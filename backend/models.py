from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    analyst = "analyst"

class PaymentChannel(str, Enum):
    IMPS = "IMPS"
    NEFT = "NEFT"
    RTGS = "RTGS"

class TransactionStatus(str, Enum):
    Success = "Success"
    Failed = "Failed"
    Pending = "Pending"

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password: str
    name: str
    role: UserRole
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.analyst

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime

# Transaction Models
class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: f"TXN{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}")
    user_id: str
    sender: str
    receiver: str
    amount: float
    channel: PaymentChannel
    status: TransactionStatus = TransactionStatus.Pending
    date: datetime = Field(default_factory=datetime.utcnow)
    ifsc: str
    failure_reason: Optional[str] = None
    aml_flag: bool = False
    high_value: bool = False
    purpose: Optional[str] = None

class TransactionCreate(BaseModel):
    sender: str
    receiver: str
    amount: float
    channel: PaymentChannel
    ifsc: str
    purpose: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    sender: str
    receiver: str
    amount: float
    channel: str
    status: str
    date: datetime
    ifsc: str
    failure_reason: Optional[str]
    aml_flag: bool
    high_value: bool
    purpose: Optional[str]

# Response Models
class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: Optional[str] = None
    user: Optional[UserResponse] = None

class TransactionListResponse(BaseModel):
    success: bool
    transactions: List[TransactionResponse]
    total: int

class TransactionCreateResponse(BaseModel):
    success: bool
    transaction: Optional[TransactionResponse] = None
    message: Optional[str] = None