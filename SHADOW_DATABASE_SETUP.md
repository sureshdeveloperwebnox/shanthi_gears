# Shadow Database Configuration

## What is a Shadow Database?

A shadow database is a temporary database that Prisma creates during migrations to:
- Validate schema changes
- Test migrations before applying them
- Ensure data integrity

## Why Disable Shadow Database?

Shadow databases can cause issues in:
- Production environments
- Cloud databases with limited connections
- Environments where you can't create additional databases
- When you don't need the extra validation overhead

## Configuration Steps

### 1. No Shadow Database Configuration

Your Prisma schema is configured to **NOT use shadow database**:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 2. Environment Variables

You only need your main database URL:

```env
# Your main database
DATABASE_URL="mysql://username:password@localhost:3306/shanthi_gears"
```

**No shadow database configuration needed!**

### 3. Migration Commands

Since shadow database is disabled, you can use these commands without any shadow database issues:

```bash
# For development
npx prisma migrate dev

# For production
npx prisma migrate deploy

# Reset database (use with caution)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### 4. Environment-Specific Configuration

#### Development
```env
DATABASE_URL="mysql://root:password@localhost:3306/shanthi_gears_dev"
```

#### Production
```env
DATABASE_URL="mysql://user:password@production-host:3306/shanthi_gears_prod"
```

**No shadow database URLs needed!**

## Troubleshooting

### Common Issues

1. **Shadow database connection failed**
   - Solution: Use the same database URL for both DATABASE_URL and SHADOW_DATABASE_URL

2. **Migration fails due to shadow database**
   - Solution: Use `npx prisma migrate deploy` instead of `npx prisma migrate dev`

3. **Production deployment issues**
   - Solution: Ensure SHADOW_DATABASE_URL is set in production environment

### Best Practices

1. **For Development**: Use separate shadow database
2. **For Production**: Use the same database for shadow
3. **For CI/CD**: Use `prisma migrate deploy` command
4. **For Testing**: Use `prisma migrate reset` with `--skip-seed`

## Commands Reference

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## Environment Variables Summary

```env
# Required - Only Database URL needed
DATABASE_URL=mysql://username:password@host:port/database

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# India Email Configuration
INDIA_TO_EMAIL=manager1@shanthigears.com,manager2@shanthigears.com
INDIA_CC_EMAIL=cc1@shanthigears.com,cc2@shanthigears.com

# Other Countries Email Configuration
OTHER_COUNTRY_TO_EMAIL=international1@shanthigears.com,international2@shanthigears.com
OTHER_COUNTRY_CC_EMAIL=international-cc1@shanthigears.com,international-cc2@shanthigears.com

# Fallback Email
COMPLAINT_CC_EMAIL=fallback@shanthigears.com

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

**Note: No shadow database environment variables needed!**
