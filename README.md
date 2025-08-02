**Payment Application Emergent – Smart Payment Intelligence Dashboard**
A full-stack portfolio project featuring a smart payment intelligence dashboard built with AI agent (Emergent). It showcases advanced payment analytics, user authentication, and a modern UI, providing secure, compliant, and insightful payment management.

🚀** Overview**
PayInsight is an intelligent payment dashboard enabling users to analyze, monitor, and manage transactions with built-in AI features for risk and compliance. It supports secure user authentication and offers a modern, light-themed UI for seamless workflow.

✨ **Features**
User Authentication: Secure login with JWT-based sessions and role-based access (admin, analyst).
Payment Analytics Dashboard: View, filter, and analyze transactions in real-time.
AI Agent Integration: Automated insights, transaction monitoring, and compliance checks.
Modern UI: Responsive, light-mode theme with intuitive navigation.
Transaction Management: Initiate, track, and validate payments (IMPS, NEFT, RTGS).
Fraud & Compliance Insights: AML flagging, high-value detection, IFSC validation, and blocked account checks.
Test Users: Sample admin and analyst accounts for easy evaluation.
🏗️ Tech Stack
Frontend: JavaScript (React, Create React App, modern CSS)
Backend: Node.js, Express, Python (AI logic)
Database: MongoDB
Authentication: JWT tokens, protected API routes, session management
🗃️ Database Schema
Users Collection

js
{
  _id: ObjectId,
  email: string,
  password: string, // hashed
  name: string,
  role: string,
  created_at: datetime
}
Transactions Collection

js
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
🧪 Sample Test Users
Admin User
Email: admin@payinsight.com
Password: admin123
Role: admin
Payment Analyst
Email: analyst@payinsight.com
Password: analyst123
Role: analyst
⚙️ Validation & Compliance
AML flag: Flag if amount ≥ 100,000
High Value: Flag if amount ≥ 200,000
IFSC Validation: 11-character code (e.g., ABCD0123456)
Blocked Accounts: Transactions blocked for certain user states
Channel Limits: IMPS (≤ 500,000), RTGS (≥ 200,000), NEFT (no limit)
🛠️ Getting Started
Frontend Setup

bash
cd frontend
npm install
npm start
Runs the app at http://localhost:3000.

Backend Setup

Configure backend server and integrate with MongoDB.
Set environment variables for DB connection and JWT secret.
📁 Project Structure
/frontend – React SPA (dashboard, auth, UI components)
/contracts.md – API contracts, validation, and UI/UX specs
/test_result.md – Testing protocol and logs
📄 License
Repository does not specify a license. Add a license for open-source compliance.

👤 Author
Asifa06

Smart Payment Intelligence Dashboard – Secure. Insightful. AI-powered.
