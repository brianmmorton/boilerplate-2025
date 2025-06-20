# RESTful API Node Server firstpick

## Quick Start

Install the dependencies:

```bash
npm install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Setup postgres

```bash
psql postgres
```

```bash
create database firstpick;
```

```bash
create user brianmorton with encrypted password 'secret';
```

```bash
grant all privileges on database firstpick to brianmorton;
```

Create Shadow Database to run npx prisma migrate dev

```bash
create database firstpick_shadow;
```

```bash
grant all privileges on database firstpick_shadow to brianmorton;
```

## Commands

Running locally:

```bash
npm run dev
```

Running in production:

```bash
npm run start
```

Testing:

```bash
# run all tests
npm run test

# run all tests in watch mode
npm run test:watch

# run test coverage
npm run coverage
```

Database:

```bash
# push changes to db
npm run db:push

# start prisma studio
npm run db:studio
```

Docker:

```bash
# run docker container in development mode
npm run docker:dev

# run docker container in production mode
npm run docker:prod

# run all tests in a docker container
npm run docker:test

# run docker container with PostgreSQL db
npm run docker:dev-db:start

# stop docker container with PostgreSQL db
npm run docker:dev-db:stop
```

Linting:

```bash
# run ESLint
npm run lint

# fix ESLint errors
npm run lint:fix

# run prettier
npm run prettier

# fix prettier errors
npm run prettier:fix
```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Port number
PORT=3030

# URL of the PostgreSQL database
DATABASE_URL=postgresql://postgres:secret@localhost:5432/mydb?schema=public

# JWT
# JWT secret key
JWT_SECRET=thisisasamplesecret
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=30
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=30

# SMTP configuration options for the email service
# For testing, you can use a fake SMTP service like Ethereal: https://ethereal.email/create
SMTP_HOST=email-server
SMTP_PORT=587
SMTP_USERNAME=email-server-username
SMTP_PASSWORD=email-server-password
EMAIL_FROM=support@yourapp.com
```

# Reset Research

```sql
DELETE FROM "ProductResearchStep";
DELETE FROM "ProductResearch";
```

To completely reset research and all related data:

```sql
DELETE FROM "ResearchSourceToPainPoint";
DELETE FROM "ProductIdea";

DELETE FROM "_ResearchSourceTokens";
DELETE FROM "ResearchSource";

DELETE FROM "PainPoint";
DELETE FROM "ProductToken" WHERE type = 'PainPoint';
```

To reset Pain points specifically

```sql
DELETE FROM "ResearchSourceToPainPoint";
DELETE FROM "ProductIdea";

DELETE FROM "PainPoint";
DELETE FROM "ProductToken" WHERE type = 'PainPoint';
```
