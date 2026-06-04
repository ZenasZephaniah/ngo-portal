# NGO Registration & Donation Management System

An architectural prototype of an NGO web portal built with a clear separation of user registration and payment tracking. This system ensures high data integrity, robust role-based access, and transparent accounting, using secure Stripe sandbox validation.

## Key Features

### User Capabilities
*   **Independent Registration:** User details are saved permanently to MongoDB Atlas regardless of whether they complete a subsequent transaction.
*   **Aesthetic Donation Module:** Seamless, non-obtrusive integration with Stripe Checkout Sandbox to process payments.
*   **Live History Tracking:** Chronologically ordered table showcasing status updates (`Success`, `Pending`, `Failed`) with associated Stripe reference IDs.

### Security & Authorization
*   **Role-Based Access Control (RBAC):** Middleware protecting backend endpoints and client routers from horizontal escalation.
*   **Cryptographic Password Storage:** Secure hashing using `bcryptjs` with salt round factors.
*   **JSON Web Tokens (JWT):** Token-based session states passed natively via standardized bearer authentication headers.

### Administrator Capabilities
*   **Aggregated Analytics:** Cards tracking registered user metrics, successful donations count, and monetary sums raised.
*   **Registration Management:** Searchable and query-filtered records of registered users.
*   **Transaction Audits:** Complete list of attempts, showing timestamps, statuses, and donor profiles.
*   **Data Export Utility:** One-click dynamic CSV file generation for local spreadsheet audits.

---

## Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your local machine.

### 2. Clone and Setup Environment File
Create a `.env` file in the `/backend` folder:
```env
PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.8ttmkna.mongodb.net/ngo-portal
JWT_SECRET=zenas123
STRIPE_SECRET_KEY=sk_test_YourStripeSecretKeyHere
