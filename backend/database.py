from motor.motor_asyncio import AsyncIOMotorClient
from models import User, UserRole
from auth import hash_password
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable is not set")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'payinsight')]

# Collections
users_collection = db.users
transactions_collection = db.transactions

async def init_database():
    """Initialize database with sample users"""
    try:
        # Check if users already exist
        existing_users = await users_collection.count_documents({})
        
        if existing_users == 0:
            # Create sample users
            sample_users = [
                {
                    "email": "admin@payinsight.com",
                    "password": hash_password("admin123"),
                    "name": "Admin User",
                    "role": "admin",
                    "created_at": datetime.utcnow()
                },
                {
                    "email": "analyst@payinsight.com", 
                    "password": hash_password("analyst123"),
                    "name": "Payment Analyst",
                    "role": "analyst",
                    "created_at": datetime.utcnow()
                }
            ]
            
            result = await users_collection.insert_many(sample_users)
            logger.info(f"Created {len(result.inserted_ids)} sample users")
            
            # Create indexes
            await users_collection.create_index("email", unique=True)
            await transactions_collection.create_index("user_id")
            await transactions_collection.create_index("date")
            
            logger.info("Database initialization completed")
        else:
            logger.info(f"Database already initialized with {existing_users} users")
            
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

async def get_user_by_email(email: str):
    """Get user by email"""
    return await users_collection.find_one({"email": email})

async def create_transaction(transaction_data: dict):
    """Create a new transaction"""
    result = await transactions_collection.insert_one(transaction_data)
    transaction_data["_id"] = result.inserted_id
    return transaction_data

async def get_user_transactions(user_id: str):
    """Get all transactions for a user"""
    cursor = transactions_collection.find({"user_id": user_id}).sort("date", -1)
    transactions = await cursor.to_list(length=100)
    return transactions

async def update_transaction_status(transaction_id: str, status: str, failure_reason: str = None):
    """Update transaction status"""
    update_data = {"status": status}
    if failure_reason:
        update_data["failure_reason"] = failure_reason
    
    await transactions_collection.update_one(
        {"id": transaction_id},
        {"$set": update_data}
    )