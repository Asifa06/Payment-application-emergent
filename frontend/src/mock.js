// Mock data for PayInsight Dashboard

// Validation functions
export const validateIFSC = (ifsc) => {
  // Simple IFSC validation - 11 characters, first 4 letters, 5th is 0, last 6 alphanumeric
  const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscPattern.test(ifsc);
};

export const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
};

export const blockedAccounts = [
  "BLOCKED_SENDER",
  "FRAUD_ACCOUNT", 
  "SUSPENDED_USER",
  "AML_FLAGGED"
];

export const mockTransactions = [
  {
    id: "TXN001234567",
    sender: "ABC Bank Ltd",
    receiver: "XYZ Corp",
    amount: 250000,
    channel: "RTGS",
    status: "Success",
    date: "2025-01-15T09:30:00Z",
    ifsc: "ABCD0123456",
    failureReason: null,
    amlFlag: false,
    highValue: true
  },
  {
    id: "TXN001234568",
    sender: "John Doe",
    receiver: "Jane Smith",
    amount: 15000,
    channel: "IMPS",
    status: "Failed",
    date: "2025-01-15T14:22:00Z",
    ifsc: "EFGH0789012",
    failureReason: "Insufficient funds",
    amlFlag: false,
    highValue: false
  },
  {
    id: "TXN001234569",
    sender: "TechCorp Pvt Ltd",
    receiver: "GlobalTech Inc",
    amount: 500000,
    channel: "NEFT",
    status: "Pending",
    date: "2025-01-15T16:45:00Z",
    ifsc: "IJKL0345678",
    failureReason: null,
    amlFlag: true,
    highValue: true
  },
  {
    id: "TXN001234570",
    sender: "Retail Store",
    receiver: "Supplier Co",
    amount: 75000,
    channel: "IMPS",
    status: "Success",
    date: "2025-01-15T11:15:00Z",
    ifsc: "MNOP0901234",
    failureReason: null,
    amlFlag: false,
    highValue: false
  },
  {
    id: "TXN001234571",
    sender: "Investment Fund",
    receiver: "Portfolio Manager",
    amount: 1200000,
    channel: "RTGS",
    status: "Failed",
    date: "2025-01-15T13:30:00Z",
    ifsc: "INVALID123",
    failureReason: "Invalid IFSC code",
    amlFlag: false,
    highValue: true
  },
  {
    id: "TXN001234572",
    sender: "Startup Inc",
    receiver: "Vendor Services",
    amount: 35000,
    channel: "NEFT",
    status: "Success",
    date: "2025-01-15T10:45:00Z",
    ifsc: "QRST0567890",
    failureReason: null,
    amlFlag: false,
    highValue: false
  },
  {
    id: "TXN001234573",
    sender: "Export Company",
    receiver: "International Client",
    amount: 850000,
    channel: "RTGS",
    status: "Pending",
    date: "2025-01-15T15:20:00Z",
    ifsc: "UVWX0234567",
    failureReason: null,
    amlFlag: true,
    highValue: true
  },
  {
    id: "TXN001234574",
    sender: "Freelancer",
    receiver: "Client Corp",
    amount: 25000,
    channel: "IMPS",
    status: "Failed",
    date: "2025-01-15T12:10:00Z",
    ifsc: "YZAB0678901",
    failureReason: "Transaction limit exceeded",
    amlFlag: false,
    highValue: false
  }
];

export const mockAlerts = [
  {
    id: "ALT001",
    type: "failure",
    title: "Repeated Transaction Failures",
    description: "Sender 'Investment Fund' has 3 failed transactions in last 2 hours",
    severity: "high",
    timestamp: "2025-01-15T16:30:00Z",
    transactionId: "TXN001234571"
  },
  {
    id: "ALT002",
    type: "high_value",
    title: "High Value Transaction Alert",
    description: "RTGS transaction of ₹12,00,000 flagged for review",
    severity: "medium",
    timestamp: "2025-01-15T15:45:00Z",
    transactionId: "TXN001234571"
  },
  {
    id: "ALT003",
    type: "aml",
    title: "AML Compliance Check",
    description: "Transaction flagged for potential money laundering pattern",
    severity: "high",
    timestamp: "2025-01-15T16:20:00Z",
    transactionId: "TXN001234569"
  },
  {
    id: "ALT004",
    type: "cross_border",
    title: "Cross-Border Restriction",
    description: "International transaction requires additional compliance verification",
    severity: "medium",
    timestamp: "2025-01-15T15:15:00Z",
    transactionId: "TXN001234573"
  }
];

// Helper functions for AI responses
const getProcessingSteps = (channel) => {
  const steps = {
    IMPS: "1. Real-time validation\n2. NPCI network routing\n3. Instant settlement\n4. Confirmation to both parties",
    NEFT: "1. Batch queue entry\n2. Hourly processing cycle\n3. Inter-bank settlement\n4. Credit confirmation",
    RTGS: "1. High-value validation\n2. Real-time gross settlement\n3. RBI network processing\n4. Immediate fund transfer"
  };
  return steps[channel] || "Standard processing flow";
};

const getExpectedTimeline = (channel) => {
  const timelines = {
    IMPS: "2-3 seconds",
    NEFT: "30-60 minutes",
    RTGS: "5-10 minutes"
  };
  return timelines[channel] || "Variable";
};

const getFailureAnalysis = (reason) => {
  const analysis = {
    "Invalid IFSC code": "The beneficiary bank routing code is either incorrect, inactive, or doesn't exist in the RBI database. This prevents proper routing of the transaction.",
    "Insufficient funds": "The sender's account balance is lower than the transaction amount plus applicable charges. The bank's validation systems prevent overdrafts.",
    "Account blocked": "The sender or receiver account has been flagged and blocked due to regulatory compliance, suspicious activity, or customer request.",
    "AML compliance hold": "The transaction triggered Anti-Money Laundering rules due to high amount, suspicious patterns, or blacklisted entities. Manual review required.",
    "Transaction limit exceeded": "The amount exceeds the daily/per-transaction limits set by RBI or the bank for the specific channel and customer category."
  };
  return analysis[reason] || "System validation failed during processing.";
};

const getRemedialActions = (reason) => {
  const actions = {
    "Invalid IFSC code": "• Verify correct IFSC from beneficiary bank\n• Use RBI IFSC lookup tool\n• Contact beneficiary for confirmation",
    "Insufficient funds": "• Check account balance\n• Add sufficient funds before retry\n• Consider partial payment if allowed",
    "Account blocked": "• Contact bank branch immediately\n• Provide required documentation\n• Follow compliance procedures",
    "AML compliance hold": "• Wait for manual review completion\n• Provide transaction justification\n• Submit supporting documents",
    "Transaction limit exceeded": "• Split into multiple smaller transactions\n• Request limit enhancement\n• Use alternative payment channel"
  };
  return actions[reason] || "Contact technical support for assistance.";
};

const getPreventionTips = (reason) => {
  const tips = {
    "Invalid IFSC code": "Always verify IFSC codes using official RBI database before transaction submission.",
    "Insufficient funds": "Enable account balance alerts and maintain adequate buffer for charges.",
    "Account blocked": "Regularly update KYC documents and avoid suspicious transaction patterns.",
    "AML compliance hold": "Structure large transactions properly and maintain clear business justification.",
    "Transaction limit exceeded": "Monitor daily limits and plan high-value transactions in advance."
  };
  return tips[reason] || "Follow standard banking practices and compliance guidelines.";
};

export const mockAIResponses = {
  "transaction_created": (txnData) => ({
    response: `**New Transaction Initiated**\n\n**Transaction Details:**\n• ID: ${txnData.id}\n• Channel: ${txnData.channel}\n• Amount: ₹${txnData.amount.toLocaleString()}\n\n**Processing Flow:**\n${getProcessingSteps(txnData.channel)}\n\n**Expected Timeline:** ${getExpectedTimeline(txnData.channel)}`,
    suggestions: ["Monitor transaction status", "Check compliance alerts", "Review processing timeline"]
  }),
  "transaction_failed": (reason, txnData) => ({
    response: `**Transaction Failed - Analysis**\n\n**Failure Reason:** ${reason}\n\n**Root Cause Analysis:**\n${getFailureAnalysis(reason)}\n\n**Recommended Actions:**\n${getRemedialActions(reason)}\n\n**Prevention:** ${getPreventionTips(reason)}`,
    suggestions: ["Retry with corrections", "Contact compliance team", "Update beneficiary details"]
  }),
  "why did this transaction fail": {
    response: "Based on the transaction details, the most common failure reasons in GPP are:\n\n1. **Insufficient Funds** - Account balance lower than transaction amount\n2. **Invalid IFSC Code** - Incorrect or inactive bank routing code\n3. **Transaction Limit Exceeded** - Amount exceeds daily/per-transaction limits\n4. **Network Timeout** - Communication failure between banks\n5. **Account Frozen** - Regulatory or compliance hold on account\n\nFor the specific transaction you're referencing, I can provide detailed analysis if you share the transaction ID.",
    suggestions: ["Check account balance", "Verify IFSC code", "Review transaction limits"]
  },
  "common reasons for neft delays": {
    response: "NEFT delays in GPP typically occur due to:\n\n**Operational Factors:**\n• **Batch Processing** - NEFT runs in hourly batches (8 AM to 7 PM on weekdays)\n• **Cut-off Times** - Transactions submitted after batch cut-off wait for next cycle\n• **Weekend/Holiday Processing** - Limited processing on non-business days\n\n**Technical Issues:**\n• **Network Congestion** - High transaction volume during peak hours\n• **System Maintenance** - Scheduled downtime affects processing\n• **Bank-specific Issues** - Receiving bank's internal processing delays\n\n**Compliance Checks:**\n• **AML Screening** - Anti-money laundering verification adds processing time\n• **High-value Review** - Transactions above ₹2L require additional verification\n• **Cross-verification** - Name-account number matching takes extra time",
    suggestions: ["Submit before batch cut-off", "Avoid peak hours", "Verify beneficiary details"]
  },
  "rtgs transaction flow in gpp": {
    response: "RTGS (Real Time Gross Settlement) flow in GPP:\n\n**Step 1: Initiation**\n• Customer initiates RTGS through bank interface\n• Minimum amount: ₹2 lakhs\n• Operating hours: 9 AM - 4:30 PM (weekdays)\n\n**Step 2: Pre-validation**\n• Bank validates account balance and limits\n• IFSC code verification\n• Beneficiary account validation\n\n**Step 3: GPP Processing**\n• Transaction enters GPP queue\n• Real-time fund blocking from sender account\n• Message formatting as per RBI standards\n\n**Step 4: RBI-RTGS Network**\n• Direct submission to RBI's RTGS system\n• Real-time gross settlement (no netting)\n• Immediate fund transfer between banks\n\n**Step 5: Settlement**\n• Funds credited to beneficiary account instantly\n• Settlement confirmation sent back through GPP\n• Transaction status updated to 'Success'\n\n**Unique Features:**\n• Individual transaction processing (no batching)\n• Immediate and irrevocable settlement\n• Highest priority in payment systems",
    suggestions: ["Ensure minimum ₹2L amount", "Submit during operating hours", "Verify all details before submission"]
  },
  "fraud detection patterns": {
    response: "GPP's fraud detection identifies these patterns:\n\n**Behavioral Patterns:**\n• **Velocity Checks** - Multiple transactions in short time\n• **Amount Patterns** - Just-below-threshold transactions to avoid reporting\n• **Time-based Anomalies** - Unusual transaction timing\n• **Geographic Inconsistencies** - Transactions from unexpected locations\n\n**Network Analysis:**\n• **Circular Transactions** - Money moving in loops between accounts\n• **Mule Account Detection** - Accounts receiving and immediately transferring funds\n• **Relationship Mapping** - Unusual connections between sender-receiver pairs\n\n**Rule-based Detection:**\n• **Blacklist Matching** - Known fraudulent account/IFSC codes\n• **Sanctioned Entity Screening** - OFAC and other watchlist checks\n• **High-risk Geography** - Transactions to/from restricted regions\n\n**ML-based Anomalies:**\n• **Behavioral Deviation** - Transactions inconsistent with account history\n• **Amount Clustering** - Suspicious patterns in transaction amounts\n• **Network Effects** - Accounts connected to known fraud cases",
    suggestions: ["Enable real-time monitoring", "Set up custom rules", "Regular model training"]
  },
  "aml compliance rules": {
    response: "AML compliance in GPP follows RBI guidelines:\n\n**Transaction Monitoring:**\n• **Cash Transaction Reports (CTR)** - Transactions ≥ ₹10 lakhs\n• **Suspicious Transaction Reports (STR)** - Unusual patterns regardless of amount\n• **Cross-border Reporting** - All international transactions\n\n**Customer Due Diligence:**\n• **KYC Verification** - Identity, address, and occupation verification\n• **Enhanced Due Diligence** - For high-risk customers and PEPs\n• **Ongoing Monitoring** - Regular review of customer profiles\n\n**Record Keeping:**\n• **Transaction Records** - Minimum 5-year retention\n• **Customer Information** - Complete audit trail\n• **Communication Records** - All customer interactions documented\n\n**Compliance Checks:**\n• **Name Screening** - Against OFAC, UN, and domestic watchlists\n• **PEP Screening** - Politically Exposed Persons identification\n• **Adverse Media** - Negative news and litigation checks\n\n**Reporting Timelines:**\n• **CTR** - Within 15 days of transaction\n• **STR** - Within 7 days of suspicion\n• **Cross-border** - Real-time for amounts > $5000",
    suggestions: ["Implement automated screening", "Regular staff training", "Update watchlists frequently"]
  }
};

export const scenarioSimulations = {
  imps: {
    success: {
      steps: [
        "Customer initiates IMPS transaction",
        "Bank validates account and limits",
        "Transaction enters NPCI network",
        "Real-time processing and settlement",
        "Instant credit to beneficiary account"
      ],
      timeline: "2-3 seconds",
      explanation: "IMPS succeeded because all validations passed and the NPCI network processed the transaction in real-time."
    },
    failure: {
      steps: [
        "Customer initiates IMPS transaction",
        "Bank validates account and limits",
        "Insufficient balance detected",
        "Transaction rejected",
        "Failure notification sent"
      ],
      timeline: "1-2 seconds",
      explanation: "IMPS failed due to insufficient funds in the sender's account. The transaction was rejected before entering the NPCI network."
    }
  },
  neft: {
    success: {
      steps: [
        "Customer submits NEFT transaction",
        "Transaction queued for next batch",
        "Batch processing initiated",
        "Funds settled through RBI",
        "Credit confirmation received"
      ],
      timeline: "30-60 minutes",
      explanation: "NEFT succeeded as the transaction was processed in the scheduled batch cycle and all settlements completed successfully."
    },
    failure: {
      steps: [
        "Customer submits NEFT transaction",
        "Transaction queued for batch processing",
        "Invalid IFSC code detected",
        "Transaction rejected from batch",
        "Failure notification and fund reversal"
      ],
      timeline: "60-90 minutes",
      explanation: "NEFT failed due to invalid IFSC code. The error was detected during batch processing, causing rejection and automatic reversal."
    }
  },
  rtgs: {
    success: {
      steps: [
        "High-value transaction initiated",
        "Real-time fund blocking",
        "Direct RBI-RTGS network entry",
        "Gross settlement executed",
        "Immediate beneficiary credit"
      ],
      timeline: "5-10 minutes",
      explanation: "RTGS succeeded with real-time gross settlement. Funds were immediately and irrevocably transferred through RBI's network."
    },
    failure: {
      steps: [
        "High-value transaction initiated",
        "AML compliance check triggered",
        "Transaction flagged for review",
        "Manual intervention required",
        "Transaction held pending investigation"
      ],
      timeline: "Indefinite hold",
      explanation: "RTGS failed due to AML compliance flag. The high-value transaction triggered automatic screening and requires manual review."
    }
  }
};