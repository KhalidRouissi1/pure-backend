# Pure Backend

NestJS backend API for the Pure marketplace.

## Stack

- NestJS with TypeScript
- PostgreSQL with Prisma
- Better Auth sessions
- Cloudinary signed image uploads
- Winston logging

## Setup

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npm run start:dev
```

## Scripts

From the repository root:

```bash
npm run backend
npm run backend:lint
npm run backend:type-check
npm run backend:test
npm run quality
```

From `backend/`:

```bash
npm run start:dev
npm run build
npm run lint
npm run type-check
npm test
```

## Docker

```bash
docker build -t nestapp:new ./backend
```

The existing EC2 container setup uses:

```text
container: nestapp
image: nestapp:new
```

## GitHub Secrets

Only add SSH secrets if a workflow needs to connect to EC2:

```text
EC2_HOST
EC2_USER
EC2_SSH_KEY
```

Do not commit private keys or `.env` files.
