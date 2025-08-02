import re
from typing import Tuple, Optional

# Blocked accounts for fraud simulation
BLOCKED_ACCOUNTS = [
    "BLOCKED_ACCOUNT",
    "FRAUD_USER", 
    "SUSPENDED",
    "BLACKLISTED_CORP",
    "SUSPICIOUS_ENTITY"
]

def validate_ifsc(ifsc: str) -> bool:
    """Validate IFSC code format"""
    # IFSC format: 4 letters + 1 zero + 6 alphanumeric
    pattern = r'^[A-Z]{4}0[A-Z0-9]{6}$'
    return bool(re.match(pattern, ifsc.upper()))

def validate_transaction(sender: str, receiver: str, amount: float, channel: str, ifsc: str) -> Tuple[bool, Optional[str], dict]:
    """
    Validate transaction and return status, failure reason, and flags
    Returns: (is_valid, failure_reason, flags)
    """
    flags = {
        'aml_flag': False,
        'high_value': False
    }
    
    # 1. IFSC validation
    if not validate_ifsc(ifsc):
        return False, "Invalid IFSC code", flags
    
    # 2. Blocked account check
    if sender.upper() in BLOCKED_ACCOUNTS or receiver.upper() in BLOCKED_ACCOUNTS:
        return False, "Account blocked", flags
    
    # 3. Amount validations
    if amount <= 0:
        return False, "Invalid amount", flags
        
    # 4. AML check - amounts >= 1L
    if amount >= 100000:
        flags['aml_flag'] = True
        
    # 5. High value check - amounts >= 2L
    if amount >= 200000:
        flags['high_value'] = True
        
    # 6. AML hold for very high amounts (>=10L)
    if amount >= 1000000:
        return False, "AML compliance hold", flags
    
    # 7. Channel-specific validations
    if channel == "IMPS" and amount > 500000:
        return False, "Transaction limit exceeded", flags
        
    if channel == "RTGS" and amount < 200000:
        return False, "Amount below RTGS minimum limit", flags
    
    # 8. Simulated random failures (5% chance)
    import random
    if random.random() < 0.05:
        return False, "Network timeout", flags
    
    # 9. Insufficient funds simulation (10% chance for amounts > 50K)
    if amount > 50000 and random.random() < 0.10:
        return False, "Insufficient funds", flags
    
    return True, None, flags

def get_processing_timeline(channel: str) -> str:
    """Get expected processing timeline for channel"""
    timelines = {
        "IMPS": "2-3 seconds",
        "NEFT": "30-60 minutes", 
        "RTGS": "5-10 minutes"
    }
    return timelines.get(channel, "Variable")

def get_channel_description(channel: str) -> str:
    """Get channel description"""
    descriptions = {
        "IMPS": "Immediate Payment Service - 24x7 instant transfer",
        "NEFT": "National Electronic Funds Transfer - Batch processing",
        "RTGS": "Real Time Gross Settlement - High value real-time"
    }
    return descriptions.get(channel, "Unknown channel")