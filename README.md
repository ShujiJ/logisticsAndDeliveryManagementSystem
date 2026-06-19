# Logistics and Delivery Management System

A comprehensive, feature-rich backend system for managing end-to-end logistics operations. Built with Express.js, TypeScript, and MySQL, this system handles shipment tracking, real-time delivery updates, agent management, customer complaints, and payment processing with an integrated dashboard for analytics.

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
- [Background Jobs](#background-jobs)
- [Environment Variables](#environment-variables)

## Overview

This is a production-ready logistics and delivery management backend that handles comprehensive end-to-end operations:

- **User Management**: Multi-role support (Admin, Customer, Delivery Agent) with JWT-based authentication
- **Shipment Lifecycle Management**: Complete shipment tracking from creation to delivery with status progression (Pending → Assigned → Picked Up → In Transit → Delivered)
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

## Features

### 🔐 Authentication & Security
- **JWT-based Authentication**: Access and refresh tokens with configurable expiry
- **Role-Based Access Control (RBAC)**: Three distinct roles with granular permissions
- **Password Security**: bcryptjs hashing for secure password storage
- **Session Management**: Persistent session tracking
- **HTTP-only Cookies**: Secure token storage with CORS support

### 📦 Shipment Management
- **Complete Lifecycle Tracking**: 12 distinct shipment statuses (Pending, Assigned, Confirmed, Out for Pickup, Picked Up, In Transit, Out for Delivery, Delivered, Delayed, Completed, Cancelled)
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

### ⚙️ Advanced Features
- **Automated Cron Jobs**: Background tasks for delay detection and updates
- **Comprehensive Validation**: Zod schema validation for all request bodies
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Async Request Handling**: Non-blocking request processing
- **Database Connection Pooling**: Optimized Sequelize configuration

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

### API Versioning
- **Current Version**: v1 (at /api/v1)

## Quick Start

Get up and running in 5 minutes:

```bash
# Clone repository
git clone <repository-url>
cd logisticsAndDeliveryManagementSystem

# Install dependencies
npm install

# Configure environment (copy example file)
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

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MySQL** (v8 or higher)
- **Git**

Optional but recommended:
- **Postman** or **Thunder Client** for API testing
- **MySQL Workbench** for database management

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

This will install all required packages listed in `package.json` including:
- Express.js and related middleware
- Sequelize ORM
- TypeScript and development tools
- External service SDKs (Razorpay, Twilio, Socket.io)

### 3. Install MySQL (if not already installed)

**Windows:**
```bash
# Using Chocolatey
choco install mysql
```

**macOS:**
```bash
# Using Homebrew
brew install mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mysql-server
```

## Configuration

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
# Start MySQL service (if not already running)
# Windows: MySQL should start automatically
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Login to MySQL
mysql -u root -p

# Create the database
CREATE DATABASE logistics_db;

# Exit MySQL
EXIT;
```

### 3. Generate Secure Secrets (Recommended)

```bash
# Generate strong JWT secrets
node -e "console.log('JWT Secret:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('Access Token Secret:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('Refresh Token Secret:', require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated values to your `.env` file.

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

# Undo all migrations (careful!)
npx sequelize-cli db:migrate:undo:all
```

### 2. Run Seeders

Populate initial data:

```bash
# Seed the database with initial data (includes admin user)
npx sequelize-cli db:seed:all

# Undo all seeders
npx sequelize-cli db:seed:undo:all

# Undo specific seeder
npx sequelize-cli db:seed:undo --seed name-of-seeder-file
```

### 3. Database Schema

The application includes migrations that create the following tables:

- **Users**: User authentication and profile data
- **Sessions**: JWT session management
- **Shipments**: Shipment details and status tracking
- **Delivery Agents**: Delivery agent information
- **Delivery Slots**: Available time slots for delivery
- **Payments**: Payment transaction records
- **Shipment Timeline**: Event tracking for each shipment
- **Complaints**: Customer complaint records
- **Chat Messages**: Real-time messaging records
- **Notifications**: Notification delivery records

### 4. Default Admin User

After running seeders, login with:
- **Email**: admin@example.com
- **Password**: (check the seeder file)

You can create additional users via the `/auth/register` endpoint.

## Project Structure

```
src/
├── app.ts                          # Express app configuration
├── server.ts                       # Server entry point with Socket.io initialization
├── config/                         # Configuration management
│   ├── config.json                # Sequelize configuration
│   ├── dataBase.ts                # Database connection instance
│   └── env.ts                     # Environment variables validation
├── database/                       # Database layer
│   ├── associations.ts            # Sequelize model associations
│   ├── migrations/                # Database schema migrations
│   └── seeders/                   # Database seeders (initial data)
├── cron/                          # Scheduled background jobs
│   ├── index.ts                   # Cron job orchestration
│   └── delayDetection.ts          # Delay detection job
├── socket/                        # Real-time communication
│   └── socketInstance.ts          # Socket.io setup and handlers
├── modules/                       # Feature modules (modular architecture)
│   ├── auth/                      # Authentication & Authorization
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic layer
│   │   ├── repositories/          # Data access layer
│   │   ├── routes/                # API routes
│   │   ├── models/                # Sequelize models (User, Session)
│   │   ├── middlewares/           # Auth & role validation middlewares
│   │   ├── interfaces/            # TypeScript interfaces
│   │   ├── constants/             # Role definitions
│   │   ├── validations/           # Zod request schemas
│   │   └── utils/                 # Utility functions (token generation, etc)
│   │
│   ├── shipment/                  # Shipment management
│   │   ├── controllers/           # Shipment endpoints
│   │   ├── services/              # Shipment business logic & auto-assignment
│   │   ├── repositories/          # Shipment data access
│   │   ├── routes/                # API routes
│   │   ├── models/                # Shipment database model
│   │   ├── validations/           # Request validation schemas
│   │   ├── constants/             # Shipment status & type constants
│   │   ├── interfaces/            # TypeScript interfaces
│   │   ├── dto/                   # Data transfer objects
│   │   └── utils/                 # Tracking ID generation, etc
│   │
│   ├── deliveryAgent/             # Delivery agent management
│   │   ├── controllers/           # Agent endpoints
│   │   ├── services/              # Agent business logic
│   │   ├── repositories/          # Agent data access
│   │   ├── routes/                # API routes
│   │   ├── models/                # Agent database model
│   │   ├── validations/           # Request validation
│   │   └── dto/                   # Data transfer objects
│   │
│   ├── deliverySlot/              # Delivery slot scheduling
│   │   ├── controllers/           # Slot endpoints
│   │   ├── services/              # Slot scheduling logic
│   │   ├── repositories/          # Slot data access
│   │   ├── routes/                # API routes
│   │   └── models/                # Slot database model
│   │
│   ├── payment/                   # Payment processing
│   │   ├── controllers/           # Payment endpoints & webhooks
│   │   ├── services/              # Razorpay integration
│   │   ├── repositories/          # Payment data access
│   │   ├── routes/                # API routes
│   │   └── models/                # Payment database model
│   │
│   ├── shipmentTimeline/          # Event tracking
│   │   ├── controllers/           # Timeline endpoints
│   │   ├── services/              # Timeline business logic
│   │   ├── repositories/          # Timeline data access
│   │   ├── routes/                # API routes
│   │   └── models/                # Timeline database model
│   │
│   ├── complaints/                # Complaint management
│   │   ├── controllers/           # Complaint endpoints
│   │   ├── services/              # Complaint processing logic
│   │   ├── repositories/          # Complaint data access
│   │   ├── routes/                # API routes
│   │   ├── models/                # Complaint database model
│   │   ├── validations/           # Request validation
│   │   ├── constants/             # Complaint status & subjects
│   │   └── dto/                   # Data transfer objects
│   │
│   ├── chat/                      # Real-time messaging
│   │   ├── controllers/           # Chat endpoints
│   │   ├── services/              # Chat message logic
│   │   ├── repositories/          # Chat data access
│   │   ├── routes/                # API routes
│   │   ├── models/                # Chat database model
│   │   └── validations/           # Request validation
│   │
│   ├── notifications/             # Notification system
│   │   ├── controllers/           # Notification endpoints
│   │   ├── services/              # Notification dispatch (Twilio)
│   │   ├── repositories/          # Notification data access
│   │   ├── routes/                # API routes
│   │   ├── models/                # Notification database model
│   │   ├── constants/             # Notification types
│   │   └── dto/                   # Data transfer objects
│   │
│   ├── dashboard/                 # Analytics dashboard
│   │   ├── controllers/           # Dashboard endpoints
│   │   ├── services/              # Analytics logic
│   │   ├── repositories/          # Data aggregation
│   │   └── routes/                # API routes
│   │
│   └── pricing/                   # Dynamic pricing engine
│       ├── controllers/           # Pricing endpoints
│       ├── services/              # Pricing calculation logic
│       ├── routes/                # API routes
│       └── utils/                 # Pricing utilities
│
├── shared/                        # Shared utilities & middlewares
│   ├── handlers/                  # Response & async error handlers
│   ├── middlewares/               # Global middlewares (CORS, error handling)
│   └── utils/                     # Shared utilities (Razorpay, pricing, etc)
│
└── types/                         # Custom TypeScript type definitions
    └── express/                   # Express augmentation types
```

### Module Architecture Pattern

Each module follows the standard layered architecture:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Core business logic
- **Repositories**: Data access abstraction
- **Models**: Sequelize ORM models
- **Routes**: Express route definitions
- **Validations**: Zod request body schemas
- **Interfaces/DTOs**: TypeScript type safety

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### 🔐 Authentication Routes (`/auth`)
- `POST /auth/register` - Register new user (Customer/Delivery Agent)
- `POST /auth/login` - User login with credentials
- `POST /auth/refresh` - Refresh expired access token
- `POST /auth/logout` - User logout

### 📦 Shipment Routes (`/shipments`)
- `GET /shipments` - List all shipments (with filters)
- `POST /shipments` - Create new shipment
- `GET /shipments/:id` - Get shipment details
- `PUT /shipments/:id` - Update shipment information
- `PUT /shipments/:id/status` - Update shipment status
- `DELETE /shipments/:id` - Cancel/delete shipment
- `POST /shipments/:id/verify-otp` - Verify delivery OTP

### 👥 Delivery Agent Routes (`/deliveryAgents`)
- `GET /deliveryAgents` - List all delivery agents
- `POST /deliveryAgents` - Create new delivery agent
- `GET /deliveryAgents/:id` - Get agent profile details
- `PUT /deliveryAgents/:id` - Update agent information
- `DELETE /deliveryAgents/:id` - Deactivate delivery agent

### ⏰ Delivery Slot Routes (`/deliverySlots`)
- `GET /deliverySlots` - Get available delivery slots
- `POST /deliverySlots` - Create new delivery slot
- `GET /deliverySlots/:id` - Get slot details
- `PUT /deliverySlots/:id` - Update delivery slot
- `DELETE /deliverySlots/:id` - Remove delivery slot

### 💳 Payment Routes (`/payments`)
- `POST /payments` - Initiate payment
- `GET /payments/:id` - Get payment details
- `POST /payments/webhook/razorpay` - Razorpay webhook handler (for payment verification)

### 📊 Dashboard Routes (`/dashboard`)
- `GET /dashboard/stats` - Get overall system statistics
- `GET /dashboard/revenue` - Get revenue analytics (with granularity: daily/weekly/monthly)
- `GET /dashboard/shipments` - Get shipment statistics
- `GET /dashboard/agents` - Get agent performance metrics

### 🚨 Complaint Routes (`/complaints`)
- `GET /complaints` - List all complaints (with filters)
- `POST /complaints` - Create new complaint
- `GET /complaints/:id` - Get complaint details
- `PUT /complaints/:id` - Update complaint status
- `DELETE /complaints/:id` - Delete complaint

### 💬 Chat Routes (`/chat`)
- `GET /chat/shipment/:shipmentId` - Get chat history for shipment
- `POST /chat` - Send new message
- `PUT /chat/:messageId` - Update message
- `DELETE /chat/:messageId` - Delete message

### 🔔 Notification Routes (`/notifications`)
- `GET /notifications` - Get user notifications
- `GET /notifications/:id` - Get notification details
- `PUT /notifications/:id/read` - Mark notification as read
- `POST /notifications/send` - Send notification (admin only)

### 💰 Pricing Routes (`/pricing`)
- `POST /pricing/calculate` - Calculate shipping cost
- `GET /pricing/rates` - Get current pricing rates
- `PUT /pricing/rates` - Update pricing rates (admin only)

### 📅 Shipment Timeline Routes (`/shipmentTimeline`)
- `GET /shipmentTimeline/:shipmentId` - Get timeline events for shipment
- `POST /shipmentTimeline` - Create timeline event
- `GET /shipmentTimeline` - Get all timeline events

## Core Modules

### 🔐 Auth Module
Handles user registration, login, token management, and role-based access control.

**Key Features:**
- JWT token generation (access + refresh tokens)
- Password hashing with bcryptjs
- Session management
- Role-based middleware
- Token refresh mechanism

**Key Files:**
- `authController.ts` - Handles register/login/refresh/logout endpoints
- `authService.ts` - Authentication business logic
- `authMiddleware.ts` - JWT token validation middleware
- `roleMiddleware.ts` - Role-based access control
- `userModel.ts` - User database model
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

**Key Files:**
- `deliveryAgentController.ts` - Agent endpoints
- `deliveryAgentService.ts` - Agent business logic
- `deliveryAgentModel.ts` - Agent database model

### ⏰ Delivery Slot Module
Intelligent scheduling of delivery time slots.

**Key Features:**
- Available slot listing
- Automatic slot assignment
- Time-window based scheduling
- Slot availability checking

**Key Files:**
- `deliverySlotController.ts` - Slot endpoints
- `deliverySlotModel.ts` - Slot database model

### 💳 Payment Module
Razorpay integration for secure payment processing.

**Key Features:**
- Payment creation and initialization
- Webhook verification for payment status updates
- Payment status tracking (Pending, Paid, Failed)
- Transaction history

**Key Files:**
- `paymentController.ts` - Payment endpoints and webhooks
- `paymentService.ts` - Razorpay integration logic
- `paymentModel.ts` - Payment database model

### 📅 Shipment Timeline Module
Tracks all events and milestones for each shipment.

**Key Features:**
- Event logging for each shipment
- Timestamp tracking
- Status transition history
- Milestone recording

**Key Files:**
- `shipmentTimelineController.ts` - Timeline endpoints
- `shipmentTimelineService.ts` - Timeline logic
- `shipmentTimeLineModel.ts` - Timeline database model

### 🚨 Complaint Module
Customer complaint management and resolution tracking.

**Key Features:**
- Complaint creation and tracking
- Subject categorization
- Status management (Open, Resolved, Closed)
- Complaint history per shipment

**Key Files:**
- `complaintController.ts` - Complaint endpoints
- `complaintService.ts` - Complaint logic
- `complaintModel.ts` - Complaint database model
- `complaintConstants.ts` - Status and subject definitions

### 💬 Chat Module
Real-time messaging between customers and delivery agents.

**Key Features:**
- Shipment-specific chat rooms (Socket.io)
- Message persistence
- Real-time synchronization

**Key Files:**
- `chatController.ts` - Chat endpoints
- `chatService.ts` - Message logic
- `chatModel.ts` - Message database model

### 🔔 Notifications Module
Handles push notifications and alerts via Twilio.

**Key Features:**
- SMS notifications via Twilio
- Notification status tracking
- Event-based notification triggers
- Notification history

**Key Files:**
- `notificationController.ts` - Notification endpoints
- `notificationService.ts` - Twilio integration
- `notificationModel.ts` - Notification database model

### 📊 Dashboard Module
Analytics and reporting for system overview.

**Key Features:**
- Revenue analytics (daily, weekly, monthly)
- Shipment statistics
- Agent performance metrics
- Custom date range filtering

**Key Files:**
- `dashboardController.ts` - Dashboard endpoints
- `dashboardService.ts` - Analytics calculations
- `dashboardRepository.ts` - Data aggregation queries

### 💰 Pricing Module
Dynamic pricing engine for shipment costs.

**Key Features:**
- Cost calculation based on shipment characteristics
- Flexible pricing rates
- Rate management

**Key Files:**
- `pricingController.ts` - Pricing endpoints
- `pricingService.ts` - Pricing logic
- `pricingUtil.ts` - Pricing utilities

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

3. **DELIVERY_AGENT**
   - View assigned shipments
   - Update delivery status
   - Verify delivery with OTP
   - Participate in shipment chat
   - View personal performance metrics

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
- **Server**: Initialized with HTTP server in production mode
- **Chat Rooms**: Shipment-specific channels (format: `chat:${shipmentId}`)
- **Events**:
  - `join_chat`: Client joins shipment chat room
  - `leave_chat`: Client leaves shipment chat room
  - Custom message events for real-time messaging

### CORS Configuration
- Allowed Origins:
  - Production: https://ldms-lac.vercel.app
  - Development: http://localhost:3000, http://localhost:5173
- Credentials: Enabled for cross-origin requests

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
| **SERVER** |
| PORT | Server listening port | Number | Yes | 3000 |
| NODE_ENV | Environment (development/production) | String | Yes | development |
| **DATABASE** |
| DB_HOST | MySQL host address | String | Yes | localhost |
| DB_PORT | MySQL port | Number | Yes | 3306 |
| DB_NAME | Database name | String | Yes | logistics_db |
| DB_USER | Database username | String | Yes | root |
| DB_PASSWORD | Database password | String | Yes | your_password |
| **JWT & AUTHENTICATION** |
| JWT_SECRET | Secret for JWT signing | String | Yes | min 32 chars, use `crypto.randomBytes(32).toString('hex')` |
| ACCESS_TOKEN_SECRET | Access token secret | String | Yes | min 32 chars |
| REFRESH_TOKEN_SECRET | Refresh token secret | String | Yes | min 32 chars |
| ACCESS_TOKEN_EXPIRES_IN | Access token expiry time | String | Yes | 15m |
| REFRESH_TOKEN_EXPIRES_IN | Refresh token expiry time | String | Yes | 7d |
| **PAYMENT GATEWAY** |
| RAZORPAY_KEY_ID | Razorpay public key | String | Yes | (from Razorpay dashboard) |
| RAZORPAY_KEY_SECRET | Razorpay secret key | String | Yes | (from Razorpay dashboard) |
| RAZORPAY_WEBHOOK_SECRET | Razorpay webhook secret | String | Yes | (from webhook settings) |
| **NOTIFICATIONS** |
| TWILIO_ACCOUNT_SID | Twilio account SID | String | No | (from Twilio console) |
| TWILIO_AUTH_TOKEN | Twilio auth token | String | No | (from Twilio console) |
| TWILIO_PHONE_NUMBER | Twilio phone number | String | No | +1234567890 |
| **FRONTEND INTEGRATION** |
| FRONTEND_URL | Frontend application URL | String | No | http://localhost:5173 |

### Secret Generation Tips

```bash
# Generate secrets on Unix/Linux/macOS
openssl rand -base64 32

# Generate secrets on Windows (PowerShell)
[Convert]::ToBase64String((1..32|ForEach-Object{Get-Random -Maximum 256}))

# Generate using Node.js (cross-platform)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

### 🔴 Port Already in Use

```bash
# Option 1: Change PORT in .env
PORT=3001 npm run dev

# Option 2: On macOS/Linux, find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Option 3: On Windows, find process by port
netstat -ano | findstr :3000
# Then kill it by PID
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
- Incorrect DB_HOST (use 127.0.0.1 instead of localhost if issues persist)
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
- Check for typos in variable names

### 🔴 Module Not Found Errors

```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npx tsc --noEmit

# Clear dist folder and rebuild
rm -rf dist
npm run build
```

### 🔴 Migration Issues

```bash
# Check migration status
npx sequelize-cli db:migrate:status

# View pending migrations
npx sequelize-cli db:migrate:status | grep "down"

# Reset and re-run migrations
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate

# Seed again
npx sequelize-cli db:seed:all
```

**Common Issues:**
- Migration files out of sync
- Database already migrated, cannot re-apply
- Foreign key constraints preventing undo

### 🔴 Razorpay Integration Not Working

```
RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET errors
```

**Solutions:**
- Obtain keys from Razorpay dashboard (Settings → API Keys)
- Ensure you're in test mode for development
- Verify webhook secret matches in Razorpay settings
- Check webhook URL is publicly accessible

### 🔴 Socket.io Connection Issues

```
Client cannot connect to real-time chat
```

**Solutions:**
- Verify frontend URL in CORS_ALLOWED_ORIGINS
- Ensure Socket.io server is initialized in server.ts
- Check browser console for CORS errors
- Verify WebSocket is not blocked by firewall

### 🔴 TypeScript Compilation Errors

```bash
# Check TypeScript version
npx tsc --version

# Validate tsconfig.json
npx tsc --noEmit

# Recompile from scratch
rm -rf dist node_modules
npm install
npm run build
```

### 🔴 JWT Token Issues

```
"Invalid token" or "Token expired" errors
```

**Solutions:**
- Verify JWT_SECRET is set in .env
- Check token expiry times in .env
- Ensure refresh token is valid
- Clear browser cookies and try again
- Regenerate secrets if compromised

## Development Tips

### 🚀 Hot Module Reloading
- Uses `nodemon` for automatic restart on file changes
- Changes to `src/` directory trigger server restart
- Typically 1-2 seconds reload time

### 🔒 Type Safety
- Full TypeScript support with strict mode enabled
- `tsconfig.json` configured for strict type checking
- Run `npx tsc --noEmit` to check for type errors without compilation

### 🛡️ Error Handling
- `asyncHandler` wrapper catches async errors automatically
- Global `errorMiddleware` converts errors to structured responses
- All endpoints return consistent error format

### ✅ Input Validation
- All request bodies validated with Zod schemas
- Validation errors return 400 with detailed field information
- Type-safe DTOs for request/response payloads

### 📝 Logging
- Database query logging enabled in development mode
- Console logs show database operations
- Production deployments have logging disabled for performance

### 🔍 Debugging
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Debug specific module
DEBUG=sequelize npm run dev

# TypeScript source maps (if configured)
npx ts-node --inspect src/server.ts
```

### 📊 Database Query Optimization
```bash
# Check migration files
ls -la src/database/migrations/

# Review Sequelize model definitions
ls -la src/modules/*/models/

# Check for N+1 queries
# Look for eager loading in services
```

### 🧪 Testing Endpoints
```bash
# Test auth endpoints
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test with token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/shipments

# Use Postman/Thunder Client for complex requests
```

## Security Considerations

### 🔐 Authentication & Passwords
- Passwords hashed with **bcryptjs** (8 salt rounds)
- Never log or expose passwords
- Enforce strong password policies at registration
- Implement rate limiting on login attempts

### 🔑 JWT Token Security
- Access tokens: Short-lived (15 minutes default)
- Refresh tokens: Long-lived (7 days default), stored in HTTP-only cookies
- Tokens signed with strong secrets (min 32 characters)
- Implement token rotation on refresh

### 🍪 Cookie Configuration
- HTTP-only cookies prevent XSS attacks
- Secure flag for HTTPS only (production)
- SameSite policy prevents CSRF attacks
- Automatic cookie cleanup on logout

### 🔗 API Security
- CORS configured with specific allowed origins
- Input validation on all endpoints (Zod schemas)
- SQL injection prevention via Sequelize ORM
- XSS protection via sanitized outputs

### 💳 Payment Security
- Razorpay webhook signature verification
- Payment status verified server-side
- PCI compliance via Razorpay handling
- Webhook secrets never exposed to client

### 📨 Data Protection
- Sensitive data encrypted in database where applicable
- Environment variables for all secrets
- No sensitive data in logs
- Database backups with restricted access

### 🔄 Database Security
- SQL injection prevention via parameterized queries
- Foreign key constraints for data integrity
- Indexes on frequently queried columns
- Regular backup procedures

## Performance Optimization

### ⚡ Database Optimization
- **Connection Pooling**: Sequelize configured with optimized pool
  ```javascript
  pool: {
    min: 5,
    max: 10,
    idle: 30000,
    acquire: 30000
  }
  ```
- **Query Logging**: Disabled in production for better performance
- **Lazy Loading**: Models use associations for efficient queries
- **Eager Loading**: Services load related data to prevent N+1 queries

### 🚀 Request Processing
- **Async/Await**: All I/O operations non-blocking
- **Middleware Ordering**: Most efficient middlewares execute first
- **Request Size Limits**: JSON and URL-encoded body limits set
- **Compression**: gzip compression ready (configure as needed)

### 🔍 Cron Job Optimization
- **Delay Detection**: Runs on interval to check shipment delays
- **Scheduled Tasks**: Non-blocking background execution
- **Error Recovery**: Failed jobs logged without blocking main process

### 📦 Code Optimization
- **Layered Architecture**: Clear separation of concerns
- **Service Layer**: Business logic centralized
- **Repository Pattern**: Data access abstraction
- **Minimal Middleware**: Only necessary middlewares per route

### 💾 Memory Management
- **Connection Pooling**: Reuse database connections
- **Garbage Collection**: Node.js automatic GC
- **Stream Processing**: Large data sets handled incrementally
- **Cache Headers**: HTTP caching for static responses

## Support & Resources

### 📚 Documentation
- [README.md](./README.md) - Full documentation (this file)
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Quick setup instructions
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
3. Verify environment configuration with `.env.example`
4. Check server logs on startup
5. Review module-specific documentation
6. Check git history for recent changes

### 🆘 Getting Help
1. Review error messages carefully
2. Search GitHub issues
3. Check Stack Overflow for similar issues
4. Review Sequelize/Express documentation
5. Enable debug logging: `DEBUG=* npm run dev`

---

**Last Updated**: June 2026
**Version**: 1.0.0
**Maintained By**: Copilot
**License**: ISC

---

## Quick Links

- 📖 [Documentation](./README.md)
- 🚀 [Quick Start Guide](./SETUP_GUIDE.md)
- 📋 [API Endpoints](#api-endpoints)
- 🏗️ [Project Structure](#project-structure)
- 🔧 [Troubleshooting](#troubleshooting)

## Repository Information

- **Name**: logisticsAndDeliveryManagementSystem
- **Type**: Backend REST API
- **Status**: Active Development
- **Node.js**: v18+
- **MySQL**: v8+
- **TypeScript**: v6+

---

**Happy Coding! 🚀**

For questions or issues, please refer to the troubleshooting section or check the relevant module documentation.
