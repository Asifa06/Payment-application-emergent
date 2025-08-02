# PayInsight API Contracts

## Overview
Full-stack PayInsight application with authentication, transaction management, and AI assistance.

## Theme: Light Mode
- **Background**: #f9fafb (light gray background)
- **Primary Accent**: #2563eb (professional blue)
- **Secondary Accent**: #0891b2 (teal)
- **Text Color**: #111827 (dark gray)
- **Card Backgrounds**: #ffffff (white)
- **Borders**: #e5e7eb (light borders)

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
Admin User:
Email: admin@payinsight.com
Password: admin123
Name: Admin User
Role: admin

Payment Analyst:
Email: analyst@payinsight.com
Password: analyst123
Name: Payment Analyst
Role: analyst
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