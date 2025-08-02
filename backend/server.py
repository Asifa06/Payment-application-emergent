from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import asyncio
from datetime import datetime, timedelta
from typing import List

# Import our modules
from models import *
from auth import *
from database import *
from validation import *

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="PayInsight API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        await init_database()
        logger.info("PayInsight API started successfully")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    client.close()

# Authentication routes
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(user_credentials: UserLogin):
    """Authenticate user and return JWT token"""
    try:
        # Get user from database
        user = await get_user_by_email(user_credentials.email)
        
        if not user or not verify_password(user_credentials.password, user["password"]):
            return LoginResponse(
                success=False,
                message="Incorrect email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user["_id"]),
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            },
            expires_delta=access_token_expires
        )
        
        return LoginResponse(
            success=True,
            token=access_token,
            message="Login successful",
            user=UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                name=user["name"],
                role=user["role"],
                created_at=user["created_at"]
            )
        )
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Transaction routes
@api_router.post("/transactions", response_model=TransactionCreateResponse)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new payment transaction"""
    try:
        # Validate transaction
        is_valid, failure_reason, flags = validate_transaction(
            transaction_data.sender,
            transaction_data.receiver,
            transaction_data.amount,
            transaction_data.channel,
            transaction_data.ifsc
        )
        
        # Create transaction object
        transaction = Transaction(
            user_id=current_user["user_id"],
            sender=transaction_data.sender,
            receiver=transaction_data.receiver,
            amount=transaction_data.amount,
            channel=transaction_data.channel,
            ifsc=transaction_data.ifsc.upper(),
            purpose=transaction_data.purpose,
            status=TransactionStatus.Failed if not is_valid else TransactionStatus.Pending,
            failure_reason=failure_reason,
            aml_flag=flags['aml_flag'],
            high_value=flags['high_value']
        )
        
        # Save to database
        transaction_dict = transaction.dict()
        await create_transaction(transaction_dict)
        
        # Simulate async status update for successful transactions
        if is_valid:
            asyncio.create_task(simulate_transaction_processing(transaction.id))
        
        return TransactionCreateResponse(
            success=True,
            transaction=TransactionResponse(**transaction_dict),
            message="Transaction created successfully"
        )
        
    except Exception as e:
        logger.error(f"Transaction creation error: {e}")
        return TransactionCreateResponse(
            success=False,
            message="Failed to create transaction"
        )

@api_router.get("/transactions", response_model=TransactionListResponse)
async def get_transactions(current_user: dict = Depends(get_current_user)):
    """Get all transactions for the current user"""
    try:
        transactions = await get_user_transactions(current_user["user_id"])
        
        transaction_responses = []
        for txn in transactions:
            # Convert ObjectId to string and format response
            txn_response = TransactionResponse(
                id=txn["id"],
                user_id=txn["user_id"],
                sender=txn["sender"],
                receiver=txn["receiver"],
                amount=txn["amount"],
                channel=txn["channel"],
                status=txn["status"],
                date=txn["date"],
                ifsc=txn["ifsc"],
                failure_reason=txn.get("failure_reason"),
                aml_flag=txn["aml_flag"],
                high_value=txn["high_value"],
                purpose=txn.get("purpose")
            )
            transaction_responses.append(txn_response)
        
        return TransactionListResponse(
            success=True,
            transactions=transaction_responses,
            total=len(transaction_responses)
        )
        
    except Exception as e:
        logger.error(f"Get transactions error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")

# Simulation function for transaction processing
async def simulate_transaction_processing(transaction_id: str):
    """Simulate async transaction processing"""
    try:
        # Wait for random processing time (3-15 seconds)
        import random
        await asyncio.sleep(random.uniform(3, 15))
        
        # 85% success rate for valid transactions
        if random.random() < 0.85:
            await update_transaction_status(transaction_id, "Success")
        else:
            failure_reasons = ["Network timeout", "Beneficiary bank unreachable", "Processing error"]
            reason = random.choice(failure_reasons)
            await update_transaction_status(transaction_id, "Failed", reason)
            
    except Exception as e:
        logger.error(f"Transaction processing simulation error: {e}")

# Health check
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "PayInsight API v1.0.0", "status": "running"}

# Include the router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)