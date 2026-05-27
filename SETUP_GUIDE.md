# Quick Setup Guide

Get the Logistics and Delivery Management System running locally in 5 minutes.

## Step 1: Prerequisites Check

Verify you have installed:

```bash
# Check Node.js version (should be v18+)
node --version

# Check npm version (should be v9+)
npm --version

# Check MySQL version (should be v8+)
mysql --version
```

## Step 2: Clone and Install

```bash
# Navigate to your workspace
cd your-workspace

# Clone the repository (or extract if provided as zip)
git clone <repository-url>
cd logisticsAndDeliveryManagementSystem

# Install all dependencies
npm install
```

## Step 3: Setup MySQL Database

```bash
# Start MySQL service (if not already running)
# Windows: mysql should start automatically or use Services
# macOS: brew services start mysql
# Linux: sudo systemctl start mysql

# Login to MySQL
mysql -u root -p

# Create the database
CREATE DATABASE logistics_db;
EXIT;
```

## Step 4: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env file with your settings:
# - DB_PASSWORD: Your MySQL root password
# - JWT_SECRET: Generate a strong random string (use: openssl rand -base64 32)
# - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET: Get from Razorpay dashboard
```

### Generate Secure Secrets (Optional but Recommended)

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Run Database Migrations

```bash
# Run all migrations to create tables
npx sequelize-cli db:migrate

# Seed the database with initial admin user
npx sequelize-cli db:seed:all
```

## Step 6: Start the Server

```bash
npm run dev
```

You should see:
```
Database connected
Server running on port 3000
```

## Step 7: Test the API

```bash
# Test with curl or use Postman
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "role": "CUSTOMER"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

## Common Commands

```bash
# Development mode with auto-reload
npm run dev

# Check TypeScript compilation
npx tsc --noEmit

# View database migrations status
npx sequelize-cli db:migrate:status

# Reset database (careful!)
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:seed:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## Default Admin User

After running seeders, login with:
- **Email**: admin@example.com
- **Password**: (check the seeder file for default password)

## What's Running?

- **API Server**: http://localhost:3000
- **Database**: MySQL on localhost:3306
- **Hot Reload**: Enabled - changes auto-restart the server

## Troubleshooting

### "Connection refused" error
- Make sure MySQL is running
- Check credentials in `.env`

### "Cannot find module" error
- Run `npm install` again
- Delete `node_modules` and `npm install` fresh

### "Port 3000 already in use"
- Change PORT in `.env` or kill process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)

### Database migration fails
- Ensure database exists: `CREATE DATABASE logistics_db;`
- Check DB credentials in `.env`
- Clear migrations: `npx sequelize-cli db:migrate:undo:all`

## Next Steps

1. Read the main [README.md](./README.md) for complete documentation
2. Check the API endpoints documentation
3. Review the project structure
4. Explore individual modules in `src/modules/`

## Support

Need help? Check:
- [README.md](./README.md) - Full documentation
- `.env.example` - Environment variable reference
- Migration files in `src/database/migrations/` - Database schema
- Module files in `src/modules/` - Feature implementations

---

Happy coding! 🚀
