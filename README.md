# Logistics and Delivery Management System

A comprehensive, feature-rich backend system for managing end-to-end logistics operations. Built with Express.js, TypeScript, and MySQL, this system handles shipment tracking, real-time delivery updates, agent management, customer complaints, and payment processing with an integrated dashboard for analytics.

## Backend deployment URL

https://logisticsanddeliverymanagementsystem.onrender.com

**Example endpoint:** [GET /api/v1/pricing/rates](https://logisticsanddeliverymanagementsystem.onrender.com/api/v1/pricing/rates)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Core Modules](#core-modules)
- [Authentication & Authorization](#authentication--authorization)
- [Real-Time Features](#real-time-features)
  - [Socket.io Integration](#socketio-integration)
  - [Client Events](#client-events-emit-to-server)
  - [Server Events](#server-events-listen)
- [Background Jobs](#background-jobs)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Overview

This is a production-ready logistics and delivery management backend that handles comprehensive end-to-end operations:

- **User Management**: Multi-role support (Admin, Customer, Delivery Agent) with JWT-based authentication and phone number support
- **Shipment Lifecycle Management**: Complete shipment tracking from creation to delivery with status progression
- **Delivery Agent Management**: Efficient assignment and performance tracking of delivery personnel
- **Delivery Slot Scheduling**: Automated scheduling with intelligent slot assignment
- **Complaint Management**: Handle and track customer complaints with resolution tracking
- **Real-Time Chat**: Socket.io integration for real-time communication between customers and delivery agents
- **Payment Processing**: Razorpay payment gateway integration with webhook verification
- **Analytics Dashboard**: Comprehensive revenue analytics with daily, weekly, and monthly granularity
- **Dynamic Pricing**: Flexible pricing engine based on shipment characteristics
- **Notifications**: Real-time notifications for shipment events via Twilio integration
- **Automated Workflows**: Cron jobs for delay detection and automated status updates
- **Timeline Tracking**: Detailed event logs for each shipment milestone
- **User Profile Management**: Update user profile including name and phone number

## Features

### 🔐 Authentication & Security
- **JWT-based Authentication**: Access and refresh tokens with configurable expiry
- **Role-Based Access Control (RBAC)**: Three distinct roles with granular permissions
- **Password Security**: bcryptjs hashing for secure password storage
- **Session Management**: Persistent session tracking
- **HTTP-only Cookies**: Secure token storage with CORS support
- **User Profile Updates**: Phone number and name management

### 📦 Shipment Management
- **Complete Lifecycle Tracking**: Multiple shipment statuses (Pending, Assigned, Confirmed, Out for Pickup, Picked Up, In Transit, Out for Delivery, Delivered, Delayed, Completed, Cancelled)
- **Multiple Shipment Types**: Standard, Express, Same-Day delivery options
- **Automatic Agent Assignment**: Intelligent assignment logic based on availability and location
- **OTP Verification**: Secure delivery confirmation with one-time passwords
- **Tracking ID Generation**: Unique identifiers for shipment tracking
- **Shipment Timeline**: Detailed event logs for each shipment milestone

### 👥 Delivery Agent Management
- **Agent Profiles**: Comprehensive agent information and performance tracking
- **Assignment Tracking**: Real-time assignment status monitoring
- **Performance Metrics**: Delivery completion rates and reliability scoring
- **Availability Management**: Schedule-based agent availability

### ⏰ Delivery Slot Management
- **Smart Slot Assignment**: Automated slot finder based on availability
- **Time-Window Based Scheduling**: Flexible time window management
- **Slot Availability**: Real-time slot availability checking
- **Dynamic Slot Calculation**: Intelligent slot recommendation engine

### 💳 Payment Integration
- **Razorpay Gateway**: Seamless payment processing
- **Payment Status Tracking**: Pending, Paid, Failed statuses
- **Webhook Verification**: Secure webhook signature validation
- **Payment Records**: Complete payment transaction history
- **Multiple Payment Methods**: Credit card, debit card, UPI support via Razorpay
- **Automatic Refunds**: Full refund via Razorpay triggered on shipment cancellation
- **Price Breakdown**: Clear cost breakdowns with paise to rupees conversion

### 📊 Analytics & Dashboard
- **Revenue Analytics**: Daily, weekly, and monthly revenue breakdowns
- **Shipment Statistics**: Overview of shipment counts and statuses
- **Performance Metrics**: Agent performance and delivery metrics
- **Custom Date Ranges**: Flexible date range filtering for analysis

### 💬 Communication
- **Real-Time Chat**: Socket.io based chat for shipment-specific communication
- **Push Notifications**: Twilio SMS integration for timely customer updates
- **Event Notifications**: Automated notifications for shipment events
- **Multi-Channel**: Email-ready notification infrastructure

### 🚨 Complaint Management
- **Complaint Tracking**: Create and manage customer complaints
- **Status Management**: Track complaint resolution from submission to closure
- **Subject Classification**: Categorized complaint subjects for better organization
- **Issue Resolution**: Comprehensive complaint history for each shipment

### 💰 Dynamic Pricing
- **Flexible Pricing Engine**: Calculate shipping costs based on various factors
- **Price Optimization**: Base rates with adjustable multipliers
- **Transparent Pricing**: Clear cost breakdowns for customers

## Tech Stack

### Core
- **Runtime**: Node.js
- **Language**: TypeScript 6.0.3 (strict mode)
- **Framework**: Express.js v5.2.1
- **Database**: MySQL 8.0+
- **ORM**: Sequelize v6.37.8 with sequelize-cli v6.6.5

### Authentication & Security
- **JWT**: jsonwebtoken v9.0.3
- **Password Hashing**: bcryptjs v3.0.3 + bcrypt v6.0.0
- **Cookie Parsing**: cookie-parser v1.4.7

### External Services
- **Payment Gateway**: Razorpay SDK v2.9.6
- **SMS Notifications**: Twilio v6.0.2
- **Real-Time Communication**: Socket.io v4.8.3

### Utilities
- **Validation**: Zod v4.4.3 (runtime schema validation)
- **Environment Variables**: dotenv v17.4.2
- **CORS**: cors v2.8.6
- **Async Handler**: express-async-handler v1.2.0
- **Scheduling**: node-cron v4.2.1

### Development Tools
- **Development Server**: nodemon v3.1.14 + ts-node-dev v2.0.0
- **TypeScript Compiler**: typescript v6.0.3
- **Type Definitions**: @types/* for all major packages

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MySQL** (v8 or higher)
- **Git**

Optional but recommended:
- **Postman** or **Thunder Client** for API testing
- **MySQL Workbench** for database management

## Quick Start

Get up and running in 5 minutes:

```bash
# Clone repository
git clone <repository-url>
cd logisticsAndDeliveryManagementSystem

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and API credentials

# Run migrations
npx sequelize-cli db:migrate

# Seed initial data
npx sequelize-cli db:seed:all

# Start development server
npm run dev
```

Access the API at `http://localhost:3000/api/v1`

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd logisticsAndDeliveryManagementSystem
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install MySQL (if not already installed)

**Windows:**
```bash
choco install mysql
```

**macOS:**
```bash
brew install mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mysql-server
```

## Configuration

> **Note:** The `.env` file is not included in the repository (it is gitignored). You must create it yourself before running the application.

### 1. Create Environment File

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=logistics_db
DB_USER=root
DB_PASSWORD=your_password

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
ACCESS_TOKEN_SECRET=your_access_token_secret_key_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_min_32_chars
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ============================================
# RAZORPAY PAYMENT GATEWAY
# ============================================
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# ============================================
# TWILIO SMS NOTIFICATIONS (Optional)
# ============================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# ============================================
# FRONTEND CONFIGURATION (CORS)
# ============================================
FRONTEND_URL=http://localhost:5173
```

**⚠️ Important Security Notes:**
- Never commit `.env` file to version control
- Use strong, random secrets for JWT tokens
- Rotate secrets regularly in production
- Use environment-specific values for development/staging/production

### 2. Create MySQL Database

```bash
# Start MySQL service
mysql -u root -p

# Create the database
CREATE DATABASE logistics_db;

# Exit MySQL
EXIT;
```

### 3. Generate Secure Secrets (Recommended)

```bash
# Generate strong JWT secrets using Node.js
node -e "console.log('JWT Secret:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('Access Token Secret:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('Refresh Token Secret:', require('crypto').randomBytes(32).toString('hex'))"
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This uses:
- `nodemon` for auto-reload on file changes
- `ts-node-dev` for TypeScript compilation
- Hot module reloading

You should see:
```
Database connected
Server running on port 3000
[Cron] All cron jobs started.
```

Access the API at: `http://localhost:3000/api/v1`

### Build for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Start Production Server

```bash
npm start
```

Runs the compiled JavaScript from `dist/server.js`

## Database Setup

### 1. Run Migrations

Create database schema:

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Check migration status
npx sequelize-cli db:migrate:status

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

### 2. Run Seeders

Populate initial data:

```bash
# Seed the database with initial data
npx sequelize-cli db:seed:all

# Undo all seeders
npx sequelize-cli db:seed:undo:all

# Undo specific seeder
npx sequelize-cli db:seed:undo --seed name-of-seeder-file
```

### 3. Database Schema

The application includes migrations that create the following tables:

- **Users**: User authentication, profile data, and phone number
- **Sessions**: JWT session management
- **Shipments**: Shipment details and status tracking
- **Delivery Agents**: Delivery agent information
- **Delivery Slots**: Available time slots for delivery
- **Payments**: Payment transaction records
- **Shipment Timeline**: Event tracking for each shipment
- **Complaints**: Customer complaint records
- **Chat Messages**: Real-time messaging records
- **Notifications**: Notification delivery records

## Project Structure

```
src/
├── app.ts                          # Express app configuration
├── server.ts                       # Server entry point with Socket.io
├── config/                         # Configuration management
│   ├── config.json                # Sequelize configuration
│   ├── dataBase.ts                # Database connection instance
│   └── env.ts                     # Environment variables validation
├── database/                       # Database layer
│   ├── associations.ts            # Sequelize model associations
│   ├── migrations/                # Database schema migrations
│   └── seeders/                   # Database seeders
├── cron/                          # Scheduled background jobs
│   ├── index.ts                   # Cron job orchestration
│   └── delayDetection.ts          # Delay detection job
├── socket/                        # Real-time communication
│   └── socketInstance.ts          # Socket.io setup and handlers
├── modules/                       # Feature modules
│   ├── auth/                      # Authentication & Authorization
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic layer
│   │   ├── repositories/          # Data access layer
│   │   ├── routes/                # API routes
│   │   ├── models/                # Sequelize models
│   │   ├── middlewares/           # Auth validation
│   │   ├── interfaces/            # TypeScript interfaces
│   │   ├── constants/             # Role definitions
│   │   ├── validations/           # Zod schemas
│   │   └── utils/                 # Utility functions
│   │
│   ├── shipment/                  # Shipment management
│   │   ├── controllers/
│   │   ├── services/              # Auto-assignment logic
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── validations/
│   │   ├── constants/
│   │   ├── interfaces/
│   │   ├── dto/
│   │   └── utils/
│   │
│   ├── deliveryAgent/             # Delivery agent management
│   ├── deliverySlot/              # Delivery slot scheduling
│   ├── payment/                   # Payment processing
│   ├── shipmentTimeline/          # Event tracking
│   ├── complaints/                # Complaint management
│   ├── chat/                      # Real-time messaging
│   ├── notifications/             # Notification system
│   ├── dashboard/                 # Analytics dashboard
│   └── pricing/                   # Dynamic pricing engine
│
├── shared/                        # Shared utilities
│   ├── handlers/                  # Response & error handlers
│   ├── middlewares/               # Global middlewares
│   └── utils/                     # Shared utilities
│
└── types/                         # Custom TypeScript types
    └── express/                   # Express augmentation
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### 🔐 Authentication Routes (`/auth`)
- `POST /auth/register` - Register new user (customer or delivery agent)
- `POST /auth/login` - Login with credentials
- `POST /auth/refreshToken` - Refresh expired access token
- `POST /auth/logout` - Logout current session
- `PATCH /auth/updateProfile` - Update name or phone number (authenticated)
- `PATCH /auth/changePassword` - Change password (authenticated)

### 📦 Shipment Routes (`/shipments`)
- `POST /shipments` - Create new shipment (customer, admin)
- `GET /shipments` - List all shipments (admin only)
- `GET /shipments/myShipments` - Customer's own shipments (customer)
- `GET /shipments/myDeliveries` - Agent's assigned shipments (delivery agent)
- `GET /shipments/:id` - Get shipment details (admin, customer — customer sees own only)
- `PATCH /shipments/:id` - Update shipment details (customer, only while PENDING)
- `PATCH /shipments/status/:id` - Update shipment status (delivery agent, admin)
- `POST /shipments/:id/cancel` - Cancel shipment (customer, only before PICKED_UP)
- `POST /shipments/:id/sendOtp` - Send delivery OTP to customer (delivery agent, admin)
- `POST /shipments/:id/verifyOtp` - Verify delivery OTP to confirm delivery (delivery agent)
- `GET /shipments/:id/timeline` - Get all timeline events for a shipment (all roles)

### 👥 Delivery Agent Routes (`/deliveryAgents`)
- `POST /deliveryAgents` - Create new delivery agent (admin)
- `GET /deliveryAgents` - List all delivery agents (admin)
- `PATCH /deliveryAgents/myAvailability` - Toggle own availability on/off (delivery agent)
- `PATCH /deliveryAgents/:id/toggleStatus` - Activate or deactivate an agent (admin)
- `PATCH /deliveryAgents/reassign/:shipmentId` - Reassign a different agent to a shipment (admin)

### 💳 Payment Routes (`/payments`)
- `POST /payments/initiate/:shipmentId` - Create Razorpay order for checkout (customer)
- `POST /payments/verify/:shipmentId` - Verify payment signature after Razorpay checkout (customer)
- `GET /payments/myPayments` - Get customer's payment history with pagination (customer)
- `GET /payments/:shipmentId` - Get payment details for a shipment (customer, admin)
- `POST /payments/pay/:shipmentId` - Direct payment without Razorpay — simulation mode (customer)

### 📊 Dashboard Routes (`/dashboard`)
- `GET /dashboard/admin` - Admin dashboard with system-wide stats (admin)
- `GET /dashboard/customer` - Customer dashboard with personal shipment summary (customer)
- `GET /dashboard/deliveryAgent` - Agent dashboard with delivery stats (delivery agent)

### 🚨 Complaint Routes (`/complaints`)
- `POST /complaints/:shipmentId` - Raise a complaint for a shipment (customer)
- `GET /complaints` - List all complaints (admin)
- `GET /complaints/me` - Get customer's own complaints (customer)
- `PATCH /complaints/:complaintId/status` - Update complaint status (admin)

### 💬 Chat Routes (`/chat`)
- `POST /chat/:shipmentId` - Send a message (customer, delivery agent)
- `GET /chat/:shipmentId` - Get messages for a shipment with pagination (all roles)
- `GET /chat/:shipmentId/history` - Get full chat history with shipment info (admin only)

### 🔔 Notification Routes (`/notifications`)
- `GET /notifications/me` - Get current user's notifications (customer)
- `PATCH /notifications/read/:id` - Mark a notification as read (customer)
- `PATCH /notifications/readAll` - Mark all notifications as read (customer)

### 💰 Pricing Routes (`/pricing`)
- `GET /pricing/rates` - Get current pricing rates (public)

> **Note:** Delivery slots have no public API. They are managed internally by the auto-assignment service when a shipment is created and payment is confirmed.

## Core Modules

### 🔐 Auth Module
Handles user registration, login, token management, and role-based access control.

**Key Features:**
- JWT token generation (access + refresh tokens)
- Password hashing with bcryptjs
- Session management
- Role-based middleware
- Token refresh mechanism
- User profile management with phone number support

**Key Files:**
- `authController.ts` - Handles register/login/refresh/logout/profile endpoints
- `authService.ts` - Authentication business logic
- `authMiddleware.ts` - JWT token validation middleware
- `roleMiddleware.ts` - Role-based access control
- `userModel.ts` - User database model with phoneNumber field
- `sessionModel.ts` - JWT session tracking
- `tokenutils.ts` - Token generation utilities

### 📦 Shipment Module
Manages shipment lifecycle, tracking, and automatic agent assignment.

**Key Features:**
- Complete status progression tracking
- Multiple shipment types (Standard, Express, Same-Day)
- Automatic agent assignment algorithm
- OTP verification for delivery confirmation
- Unique tracking ID generation
- Shipment timeline creation

**Key Files:**
- `shipmentController.ts` - Shipment CRUD endpoints
- `shipmentService.ts` - Core shipment logic
- `autoAssignService.ts` - Intelligent agent assignment
- `shipmentModel.ts` - Shipment database model
- `shipmentConstants.ts` - Status and type definitions

**Shipment Status Flow:**
```
PENDING → ASSIGNED → CONFIRMED → OUT_FOR_PICKUP → PICKED_UP 
→ IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED → COMPLETED
```

### 👥 Delivery Agent Module
Manages delivery personnel profiles and performance tracking.

**Key Features:**
- Agent profile management
- Assignment history tracking
- Performance metrics
- Availability status

### ⏰ Delivery Slot Module
Intelligent scheduling of delivery time slots.

**Key Features:**
- Available slot listing
- Automatic slot assignment
- Time-window based scheduling
- Slot availability checking

### 💳 Payment Module
Razorpay integration for secure payment processing with automatic refund support.

**Key Features:**
- Razorpay order creation and checkout flow
- Payment signature verification after checkout
- Direct payment simulation (without Razorpay, for testing)
- Payment status tracking (`PENDING`, `PAID`, `FAILED`, `REFUNDED`)
- Automatic refund triggered on shipment cancellation
- Customer payment history with pagination
- Price breakdown with rupee conversion

### 📅 Shipment Timeline Module
Tracks all events and milestones for each shipment.

**Key Features:**
- Event logging for each shipment
- Timestamp tracking
- Status transition history
- Milestone recording

### 🚨 Complaint Module
Customer complaint management and resolution tracking.

**Key Features:**
- Complaint creation and tracking
- Subject categorization
- Status management (Open, Resolved, Closed)
- Complaint history per shipment

### 💬 Chat Module
Real-time messaging between customers and delivery agents using Socket.io.

**Key Features:**
- Shipment-specific chat rooms (`chat:{shipmentId}` rooms via Socket.io)
- `new_message` event broadcast to all room members on send
- Message persistence in database
- Role-based access (only the assigned customer and agent can participate)
- Chat automatically locked when shipment reaches a terminal status

### 🔔 Notifications Module
Handles push notifications and alerts via Twilio.

**Key Features:**
- SMS notifications via Twilio
- Notification status tracking
- Event-based notification triggers
- Notification history

### 📊 Dashboard Module
Analytics and reporting for system overview.

**Key Features:**
- Revenue analytics (daily, weekly, monthly)
- Shipment statistics
- Agent performance metrics
- Custom date range filtering

### 💰 Pricing Module
Dynamic pricing engine for shipment costs.

**Key Features:**
- Cost calculation based on shipment characteristics
- Flexible pricing rates
- Rate management

## Authentication & Authorization

### User Roles

The system supports three distinct user roles with granular permissions:

1. **ADMIN**
   - Full system access
   - User management
   - Pricing configuration
   - Analytics dashboard access
   - Notification management

2. **CUSTOMER**
   - Create and manage shipments
   - View shipment status and tracking
   - Chat with delivery agents
   - File complaints
   - Payment initiation
   - View personal dashboard
   - Update profile (name, phone number)

3. **DELIVERY_AGENT**
   - View assigned shipments
   - Update delivery status
   - Verify delivery with OTP
   - Participate in shipment chat
   - View personal performance metrics
   - Update profile (name, phone number)

### JWT Token Management

**Token Types:**
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens

**Token Storage:**
- HTTP-only cookies for security
- Authorization header support (Bearer token)

**Token Usage:**

Include access token in the Authorization header:
```bash
Authorization: Bearer <access_token>
```

**Refresh Token Flow:**
```
1. Access token expires
2. Client sends refresh token to /auth/refresh
3. Server validates refresh token
4. New access token issued
5. Continue making API requests
```

## Real-Time Features

### Socket.io Integration

**Production URL:** `https://logisticsanddeliverymanagementsystem.onrender.com`
**Local URL:** `http://localhost:3000`

Chat is powered by Socket.io and scoped to individual shipments. Clients must join a room before receiving messages for that shipment.

---

#### Client Events (Emit to Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `join_chat` | `{ "shipmentId": number }` | Join the chat room for a specific shipment |
| `leave_chat` | `{ "shipmentId": number }` | Leave the chat room for a specific shipment |

---

#### Server Events (Listen)

##### `new_message`

Emitted to all clients in the room whenever a message is sent via `POST /api/v1/chat/:shipmentId`.

```json
{
  "id": number,
  "shipmentId": number,
  "senderId": number,
  "senderName": "string | null",
  "senderRole": "CUSTOMER | DELIVERY_AGENT | ADMIN",
  "message": "string",
  "createdAt": "ISO 8601 datetime"
}
```

---

#### Connection Notes
- Rooms are scoped per shipment using the pattern `chat:{shipmentId}`
- Chat is only active for shipments not in `COMPLETED`, `CANCELLED`, or `DELIVERED` status
- Only the customer assigned to the shipment and the assigned delivery agent can send messages (admin can also participate)

### CORS Configuration

| Environment | Allowed Origins |
|-------------|----------------|
| Production | `https://ldms-lac.vercel.app` |
| Development | `http://localhost:5173`, `http://localhost:3000` |

Credentials are enabled for all cross-origin requests.

## Background Jobs

### Cron Jobs

**Delay Detection Job** (`delayDetection.ts`)
- Monitors shipments in transit
- Detects delivery delays
- Updates shipment status to DELAYED
- Triggers notification alerts
- Runs on configurable schedule

**Cron Orchestration:**
- Managed in `cron/index.ts`
- Automatically starts on server initialization
- Handles error logging and recovery

## Environment Variables

### Configuration Reference

| Variable | Description | Type | Required | Example |
|----------|-------------|------|----------|---------|
| PORT | Server listening port | Number | Yes | 3000 |
| NODE_ENV | Environment | String | Yes | development |
| DB_HOST | MySQL host address | String | Yes | localhost |
| DB_PORT | MySQL port | Number | Yes | 3306 |
| DB_NAME | Database name | String | Yes | logistics_db |
| DB_USER | Database username | String | Yes | root |
| DB_PASSWORD | Database password | String | Yes | password |
| JWT_SECRET | Secret for JWT signing | String | Yes | min 32 chars |
| ACCESS_TOKEN_SECRET | Access token secret | String | Yes | min 32 chars |
| REFRESH_TOKEN_SECRET | Refresh token secret | String | Yes | min 32 chars |
| ACCESS_TOKEN_EXPIRES_IN | Access token expiry | String | Yes | 15m |
| REFRESH_TOKEN_EXPIRES_IN | Refresh token expiry | String | Yes | 7d |
| RAZORPAY_KEY_ID | Razorpay public key | String | Yes | (from dashboard) |
| RAZORPAY_KEY_SECRET | Razorpay secret key | String | Yes | (from dashboard) |
| RAZORPAY_WEBHOOK_SECRET | Webhook secret | String | Yes | (from settings) |
| TWILIO_ACCOUNT_SID | Twilio account SID | String | No | (from console) |
| TWILIO_AUTH_TOKEN | Twilio auth token | String | No | (from console) |
| TWILIO_PHONE_NUMBER | Twilio phone number | String | No | +1234567890 |
| FRONTEND_URL | Frontend application URL | String | No | http://localhost:5173 |

## Troubleshooting

### 🔴 Port Already in Use

```bash
# Change PORT in .env
PORT=3001 npm run dev

# On macOS/Linux, find and kill process
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 🔴 Database Connection Failed

```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env
cat .env | grep DB_

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Create database if missing
mysql -u root -p -e "CREATE DATABASE logistics_db;"
```

**Common Causes:**
- MySQL service not running
- Incorrect DB_HOST (use 127.0.0.1 instead of localhost)
- Wrong DB_PASSWORD
- Database doesn't exist

### 🔴 Missing Environment Variables

```bash
# Verify all required env vars are set
cat .env | wc -l

# Check specific variable
grep JWT_SECRET .env
```

**Solution:**
- Ensure `.env` file exists in root directory
- Copy from `.env.example` if needed
- Restart server after updating `.env`

### 🔴 Module Not Found Errors

```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npx tsc --noEmit

# Clear dist and rebuild
rm -rf dist
npm run build
```

### 🔴 Migration Issues

```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Reset migrations
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate

# Seed again
npx sequelize-cli db:seed:all
```

### 🔴 Razorpay Integration Not Working

**Solutions:**
- Obtain keys from Razorpay dashboard (Settings → API Keys)
- Ensure you're in test mode for development
- Verify webhook secret matches Razorpay settings
- Check webhook URL is publicly accessible

### 🔴 Socket.io Connection Issues

**Solutions:**
- Verify frontend URL in CORS configuration
- Ensure Socket.io server is initialized in server.ts
- Check browser console for CORS errors
- Verify WebSocket is not blocked by firewall

## Development Tips

### 🚀 Hot Module Reloading
- Uses `nodemon` for automatic restart on file changes
- Changes to `src/` directory trigger server restart
- Typically 1-2 seconds reload time

### 🔒 Type Safety
- Full TypeScript support with strict mode enabled
- Run `npx tsc --noEmit` to check for type errors

### 🛡️ Error Handling
- `asyncHandler` wrapper catches async errors automatically
- Global `errorMiddleware` converts errors to structured responses
- All endpoints return consistent error format

### ✅ Input Validation
- All request bodies validated with Zod schemas
- Validation errors return 400 with detailed field information
- Type-safe DTOs for request/response payloads

### 🔍 Debugging
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Debug specific module
DEBUG=sequelize npm run dev
```

## Security Considerations

### 🔐 Authentication & Passwords
- Passwords hashed with **bcryptjs** (8 salt rounds)
- Never log or expose passwords
- Enforce strong password policies

### 🔑 JWT Token Security
- Access tokens: Short-lived (15 minutes)
- Refresh tokens: Long-lived (7 days), HTTP-only cookies
- Tokens signed with strong secrets (min 32 chars)
- Implement token rotation on refresh

### 🍪 Cookie Configuration
- HTTP-only cookies prevent XSS attacks
- Secure flag for HTTPS only (production)
- SameSite policy prevents CSRF attacks

### 🔗 API Security
- CORS configured with specific allowed origins
- Input validation on all endpoints
- SQL injection prevention via Sequelize ORM
- XSS protection via sanitized outputs

### 💳 Payment Security
- Razorpay webhook signature verification
- Payment status verified server-side
- PCI compliance via Razorpay handling

### 📨 Data Protection
- Environment variables for all secrets
- No sensitive data in logs
- Database backups with restricted access

## Performance Optimization

### ⚡ Database Optimization
- **Connection Pooling**: Optimized Sequelize configuration
- **Query Logging**: Disabled in production
- **Eager Loading**: Services load related data efficiently
- **Indexes**: On frequently queried columns

### 🚀 Request Processing
- **Async/Await**: All I/O operations non-blocking
- **Middleware Ordering**: Most efficient middlewares execute first
- **Request Size Limits**: JSON and URL-encoded body limits

### 💾 Memory Management
- **Connection Pooling**: Reuse database connections
- **Garbage Collection**: Node.js automatic GC
- **Stream Processing**: Large data handled incrementally

## Support & Resources

### 📚 Documentation
- [README.md](./README.md) - Full documentation (this file)
- [Sequelize Documentation](https://sequelize.org/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 🔗 External Services
- **Razorpay**: https://razorpay.com/docs/
- **Twilio**: https://www.twilio.com/docs/
- **Socket.io**: https://socket.io/docs/
- **MySQL**: https://dev.mysql.com/doc/

### ❓ Troubleshooting Steps
1. Check [Troubleshooting](#troubleshooting) section above
2. Review migration and seeder files
3. Verify environment configuration
4. Check server logs on startup
5. Check git history for recent changes

---

**Last Updated**: June 2026
**Version**: 1.0.0
**Maintained By**: Shuji Jagadeesan
**License**: ISC

---

**Happy Coding! 🚀**

For questions or issues, please refer to the troubleshooting section or check the relevant module documentation.
