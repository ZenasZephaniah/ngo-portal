# NGO Registration & Donation Management System

An engineering prototype of a secure, full-stack NGO Web Portal designed with strict transactional decoupling between user registration and donation workflows. This architecture guarantees 100% registration data preservation and zero data loss on failed or abandoned payment flows.

## Tech Stack
*   **Frontend:** React.js (Vite), Tailwind CSS, React Router DOM (v6), Axios, Lucide Icons.
*   **Backend:** Node.js, Express.js, Mongoose ODM.
*   **Database:** MongoDB Atlas (Cloud Instance).
*   **Payment Gateway:** Stripe Checkout SDK (Sandbox/Test Mode).

---

## Architectural Design Decisions

### 1. Decoupled Transactional States
In standard e-commerce carts, user data is often bound tightly to checkout success. If a payment fails or is aborted, the lead data is lost. 

This portal implements a **write-ahead design pattern**:
1. When a user submits registration, a permanent `User` record is written to Atlas immediately, returning an active session.
2. If they choose to donate, a separate `Donation` document is created with a `pending` state and bound to a unique `Stripe Session ID`.
3. If the payment succeeds, fails, or is canceled, the frontend landing page triggers a backend cryptographic verification via the Stripe API, securely updating the `Donation` state without ever modifying or risking the independent registration profile.

### 2. Role-Based Access Control (RBAC)
Endpoints are strictly protected using a double-middleware security gate:
*   `protect`: Decodes and validates incoming JSON Web Tokens (JWT) from standard Authorization Bearer headers.
*   `adminOnly`: Inspects the validated user token's database role profile, returning `403 Forbidden` for unauthorized vertical escalation attempts.

---

## Database Schema (Data Models)

The system enforces relational integrity inside MongoDB using references between the decoupled collections:

```text
  ┌─────────────────┐             ┌─────────────────────┐
  │      User       │             │      Donation       │
  ├─────────────────┤             ├─────────────────────┤
  │ _id (ObjectId)  │ 1 ─────────*│ user (Ref ObjectId) │
  │ name (String)   │             │ amount (Number)     │
  │ email (String)  │             │ currency (String)   │
  │ password (Hash) │             │ status (Enum)       │
  │ role (Enum)     │             │ paymentOrderId      │
  │ createdAt (Date)│             │ paymentId (String)  │
  └─────────────────┘             └─────────────────────┘
```

---

## API Endpoints Reference

### Authentication Router (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Registers a new user, hashes password, returns JWT session. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns active JWT session. |

### Donations Router (`/api/donations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/donations/create-checkout-session` | Private | Creates pending DB log, returns unique Stripe Checkout URL. |
| `POST` | `/api/donations/verify` | Private | Retrieves Stripe API state, cryptographically verifies transaction. |
| `GET` | `/api/donations/my-donations` | Private | Retrieves chronological transaction history for logged-in user. |

### Administrative Router (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | Admin-Only | Aggregates system metrics (Total registrations, successful funds raised). |
| `GET` | `/api/admin/registrations` | Admin-Only | Retrieves and filters registered users with active query matching. |
| `GET` | `/api/admin/donations` | Admin-Only | Audits all payment logs, linking transactions with donor emails. |
| `GET` | `/api/admin/registrations/export` | Admin-Only | Generates and streams spreadsheet-compatible CSV files of user logs. |

---

## Getting Started (Local Setup)

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed locally.

### 2. Configure Backend
Navigate to `/backend` and create a `.env` file:
```env
PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/ngo-portal?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_token_12345
STRIPE_SECRET_KEY=sk_test_YourStripeSecretKey
```

Install backend dependencies and run development server:
```bash
cd backend
npm install
npm run dev
```

### 3. Configure Frontend
Navigate to `/frontend` and create a `.env` file:
```env
VITE_API_URL=http://localhost:5050/api
```

Install frontend dependencies and run client server:
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Production Deployment Architecture

The application is structured for fully decoupled cloud deployment:

*   **Production API Server:** Deployed on **Render** (Node/Express backend) with environment variable overrides for database URIs and Stripe Sandbox keys.
*   **Production Web Client:** Deployed on **Vercel** (Vite/React frontend) configured with dynamic routing rewrites to support clean single-page app (SPA) paths.
