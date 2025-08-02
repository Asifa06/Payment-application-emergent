# PayInsight API Contracts

## Overview
Full-stack PayInsight application with authentication, transaction management, and AI assistance.

## Theme: Light Mode
- **Primary Colors**: White backgrounds (#ffffff), light gray (#f8fafc, #f1f5f9)
- **Accent Color**: Soft teal (#0891b2)
- **Text**: Dark gray (#1e293b, #475569)
- **Borders**: Light gray (#e2e8f0)

## Authentication Flow
1. User lands on login page
2. Enters email/password
3. Backend validates against MongoDB users collection
4. Returns JWT token on success
5. Frontend stores token and redirects to dashboard
6. All subsequent API calls include JWT token

## API Endpoints

### Authentication
```
POST /api/auth/login
Request: { email: string, password: string }
Response: { success: boolean, token?: string, message?: string, user?: object }
```

### Transactions
```
GET /api/transactions
Headers: { Authorization: "Bearer <token>" }
Response: { transactions: Transaction[] }

POST /api/transactions
Headers: { Authorization: "Bearer <token>" }
Request: { sender: string, receiver: string, amount: number, channel: string, ifsc: string, purpose?: string }
Response: { success: boolean, transaction?: object, message?: string }
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: string,
  password: string, // hashed
  name: string,
  role: string,
  created_at: datetime
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  id: string, // transaction ID
  sender: string,
  receiver: string,
  amount: number,
  channel: "IMPS" | "NEFT" | "RTGS",
  status: "Success" | "Failed" | "Pending",
  date: datetime,
  ifsc: string,
  failureReason?: string,
  amlFlag: boolean,
  highValue: boolean,
  purpose?: string
}
```

## Sample Test Users
```
Email: admin@payinsight.com
Password: admin123
Name: Admin User

Email: demo@payinsight.com  
Password: demo123
Name: Demo User

Email: analyst@payinsight.com
Password: analyst123
Name: Payment Analyst
```

## Frontend Components to Update
1. **App.js** - Add authentication routing
2. **LoginPage.jsx** - New login component
3. **Dashboard.jsx** - Update to light theme, add auth checks
4. **TransactionForm.jsx** - Integrate with backend API
5. **All UI components** - Convert to light theme

## Backend Validation Rules
- **AML Flag**: amount >= 100000
- **High Value**: amount >= 200000
- **IFSC Validation**: 11 characters, format ABCD0123456
- **Blocked Accounts**: ["BLOCKED_ACCOUNT", "FRAUD_USER", "SUSPENDED"]
- **Channel Limits**: 
  - IMPS: max 500000
  - RTGS: min 200000
  - NEFT: no specific limits

## Authentication Implementation
- Use JWT tokens
- Store user sessions
- Protect all transaction routes
- Frontend auth context for state management