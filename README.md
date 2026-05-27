# Logistics and Delivery Management System

A comprehensive backend system for managing logistics operations, shipments, deliveries, and payments. Built with Express.js, TypeScript, and MySQL.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Modules](#modules)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)

## Overview

This is a full-featured logistics and delivery management backend that handles:
- User authentication and authorization with role-based access
- Shipment management and tracking
- Delivery agent management and assignment
- Delivery slot scheduling
- Payment processing via Razorpay integration
- Real-time delivery timeline updates

## Features

- **User Management**: Support for multiple user roles (Admin, Customer, Delivery Agent)
- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Shipment Management**: Create, track, and manage shipments with status updates
- **Delivery Agents**: Assign and manage delivery agents with performance tracking
- **Delivery Slots**: Schedule and manage delivery time slots
- **Payment Integration**: Razorpay payment gateway integration
- **Delivery Timeline**: Track shipment events and delivery milestones
- **Error Handling**: Comprehensive error handling and logging
- **Input Validation**: Zod schema validation for request bodies
- **CORS Support**: Configured for cross-origin requests

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js v5.2.1
- **Database**: MySQL
- **ORM**: Sequelize v6.37.8
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Payment**: Razorpay SDK v2.9.6
- **Validation**: Zod v4.4.3
- **Development**: ts-node-dev

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MySQL** (v8 or higher)
- **Git**

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

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

If `.env.example` doesn't exist, create a `.env` file with the following content:

```env
# Server
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=logistics_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
ACCESS_TOKEN_SECRET=your_access_token_secret_key_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_min_32_chars
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### 2. Create MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE logistics_db;
EXIT;
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

You should see:
```
Database connected
Server running on port 3000
```

### Build for Production

```bash
npx tsc
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Database Setup

### 1. Run Migrations

The application uses Sequelize migrations to manage the database schema.

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

### 2. Run Seeders

Seed the database with initial data (including admin user):

```bash
npx sequelize-cli db:seed:all

# Undo seeders
npx sequelize-cli db:seed:undo:all
```

### 3. Database Schema

The application includes the following migrations:

- **Users Table**: User authentication and profile data
- **Sessions Table**: JWT session management
- **Shipments Table**: Shipment details and status tracking
- **Delivery Agents Table**: Delivery agent information
- **Delivery Slots Table**: Available time slots for delivery
- **Shipment Timeline Table**: Event tracking for each shipment
- **Payments Table**: Payment transaction records

## Project Structure

```
src/
├── app.ts                      # Express app configuration
├── server.ts                   # Server entry point
├── config/                     # Configuration files
│   ├── config.json            # Sequelize config
│   ├── dataBase.ts            # Database connection
│   └── env.ts                 # Environment variables
├── database/                   # Database setup
│   ├── associations.ts        # Model associations
│   ├── migrations/            # Database migrations
│   └── seeders/               # Database seeders
├── modules/                   # Feature modules
│   ├── auth/                  # Authentication module
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/            # API routes
│   │   ├── models/            # Database models
│   │   ├── middlewares/       # Auth middlewares
│   │   ├── interfaces/        # TypeScript interfaces
│   │   ├── constants/         # Role definitions
│   │   ├── validations/       # Request validation
│   │   └── utils/             # Utility functions
│   ├── shipment/              # Shipment management
│   ├── deliveryAgent/         # Delivery agent management
│   ├── deliverySlot/          # Delivery slot management
│   ├── payment/               # Payment handling
│   └── shipmentTimeline/      # Timeline tracking
├── shared/                    # Shared utilities
│   ├── handlers/              # Async handler, response handler
│   ├── middlewares/           # Global middlewares
│   └── utils/                 # Shared utilities
└── types/                     # Custom TypeScript types
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Routes (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Shipment Routes (`/shipments`)
- `GET /shipments` - Get all shipments
- `POST /shipments` - Create new shipment
- `GET /shipments/:id` - Get shipment details
- `PUT /shipments/:id` - Update shipment
- `DELETE /shipments/:id` - Delete shipment

### Delivery Agent Routes (`/deliveryAgents`)
- `GET /deliveryAgents` - Get all delivery agents
- `POST /deliveryAgents` - Create delivery agent
- `GET /deliveryAgents/:id` - Get agent details
- `PUT /deliveryAgents/:id` - Update agent
- `DELETE /deliveryAgents/:id` - Delete agent

### Delivery Slot Routes (`/deliverySlots`)
- `GET /deliverySlots` - Get all slots
- `POST /deliverySlots` - Create delivery slot
- `GET /deliverySlots/:id` - Get slot details
- `PUT /deliverySlots/:id` - Update slot

### Payment Routes (`/payments`)
- `POST /payments` - Create payment
- `GET /payments/:id` - Get payment details
- `POST /payments/webhook/razorpay` - Razorpay webhook handler

## Modules

### Auth Module
Handles user registration, login, authentication, and JWT token management.

**Key Files:**
- `authController.ts` - Handles login/register requests
- `authService.ts` - Business logic for authentication
- `authMiddleware.ts` - Protects routes (JWT validation)
- `roleMiddleware.ts` - Role-based access control
- `userModel.ts` - User database model
- `sessionModel.ts` - Session database model

### Shipment Module
Manages shipment lifecycle from creation to delivery.

**Key Files:**
- `shipmentController.ts` - Shipment endpoints
- `shipmentService.ts` - Shipment business logic
- `autoAssignService.ts` - Automatic agent assignment

### Delivery Agent Module
Manages delivery agent profiles and assignments.

### Delivery Slot Module
Manages available delivery time slots.

### Payment Module
Handles payment processing and Razorpay integration.

### Shipment Timeline Module
Tracks important events and milestones for each shipment.

## Authentication

### User Roles

The system supports three user roles:

1. **ADMIN** - Full system access, can manage users and operations
2. **CUSTOMER** - Can create shipments and view their status
3. **DELIVERY_AGENT** - Can view assigned shipments and update delivery status

### JWT Tokens

- **Access Token**: Short-lived token (15 minutes) for API requests
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

### Token Usage

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are also stored in HTTP-only cookies for additional security.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | Yes |
| DB_HOST | MySQL host | Yes |
| DB_PORT | MySQL port | Yes |
| DB_NAME | Database name | Yes |
| DB_USER | Database username | Yes |
| DB_PASSWORD | Database password | Yes |
| JWT_SECRET | Secret for JWT | Yes |
| ACCESS_TOKEN_SECRET | Access token secret | Yes |
| REFRESH_TOKEN_SECRET | Refresh token secret | Yes |
| ACCESS_TOKEN_EXPIRES_IN | Access token expiry | Yes |
| REFRESH_TOKEN_EXPIRES_IN | Refresh token expiry | Yes |
| RAZORPAY_KEY_ID | Razorpay public key | Yes |
| RAZORPAY_KEY_SECRET | Razorpay secret key | Yes |
| RAZORPAY_WEBHOOK_SECRET | Razorpay webhook secret | Yes |

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or use:
PORT=3001 npm run dev
```

### Database Connection Failed
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `.env`
- Check database exists: `SHOW DATABASES;`

### Missing Environment Variables
- Ensure all required variables are in `.env`
- Restart the server after updating `.env`

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Migration Issues
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Reset and re-run migrations
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

## Development Tips

- **Hot Reload**: Uses `ts-node-dev` for automatic restart on file changes
- **Type Safety**: Full TypeScript support with strict checking
- **Error Handling**: Uses async handler wrapper for automatic error catching
- **Validation**: Request bodies validated using Zod schemas
- **Logging**: Database queries logged in development

## Security Considerations

- Passwords hashed with bcryptjs
- JWT tokens for stateless authentication
- CORS configured for controlled cross-origin access
- Input validation on all endpoints
- HTTP-only cookies for token storage
- Razorpay webhook signature verification

## Performance Optimization

- Sequelize connection pooling configured
- Database query logging disabled in production
- Async request handling prevents blocking
- Role-based middleware reduces unnecessary processing

## Support

For issues or questions:
1. Check troubleshooting section
2. Review migration and seeder logs
3. Verify environment configuration
4. Check application logs on server start

---

**Last Updated**: May 2026
**Version**: 1.0.0
