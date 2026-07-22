# Pure - Saudi Marketplace Mobile App

A Saudi-focused mobile marketplace enabling "Made in Saudi" brand discovery with contact-based ordering via WhatsApp.

## 📋 Overview

Pure is a cross-platform mobile application that connects Saudi buyers with local sellers. The app features:
- Product discovery by category and region
- Server-calculated checkout with payment on delivery
- Multi-language support (English/Arabic) with RTL layout
- Admin-managed seller verification
- Signed Cloudinary image uploads (credentials remain server-side)

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS 10.x with TypeScript
- **Database**: PostgreSQL 15+ (NeonDB or local)
- **ORM**: Prisma
- **Authentication**: Better Auth with database-backed sessions
- **Image Storage**: Cloudinary through signed backend uploads
- **Logging**: Winston

### Mobile
- **Framework**: React Native 0.85 with Expo SDK 56
- **UI Components**: React Native Paper (Material Design)
- **UI**: React Native Paper with a shared theme
- **Navigation**: React Navigation 6.x
- **Internationalization**: i18next
- **State Management**: React Context API
- **Testing**: Jest, React Native Testing Library

## 📁 Project Structure

```text
mobileapp/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/       # Feature modules (auth, users, stores, products, admin)
│   │   ├── common/        # Shared utilities (guards, interceptors, filters)
│   │   ├── config/        # Database and application configuration
│   │   └── main.ts        # Application entry point
│   ├── prisma/            # Prisma schema and migrations
│   └── test/              # Backend tests
└── mobile/                 # Expo React Native app
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── screens/        # Screen components
    │   ├── navigation/     # Navigation setup
    │   ├── services/       # API client and utilities
    │   ├── i18n/           # Internationalization
    │   ├── theme/          # Design system
    │   └── hooks/          # Custom React hooks
    └── __tests__/          # Mobile tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (NeonDB or local)
- Expo CLI

### Installation

1. Clone repository:
```bash
git clone <repository-url>
cd mobileapp
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install mobile dependencies:
```bash
cd ../mobile
npm install
```

### Configuration

1. Copy `.env.example` to `.env` in `backend/`:
```bash
cd backend
cp .env.example .env
```

2. Update backend `.env` with your NeonDB URL:
```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-bitter-violet-alewdh1e-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
BETTER_AUTH_SECRET="your-random-secret-at-least-32-characters"
BETTER_AUTH_URL="http://localhost:3000/api/auth"
AUTH_TRUSTED_ORIGINS="pure://"
AUTH_REQUIRE_EMAIL_VERIFICATION="false"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="*"
```

3. Create `.env` in `mobile/`:
```bash
cd ../mobile
cp .env.example .env
```

4. Update mobile `.env` with backend URL:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_SUPPORT_EMAIL=support@pure.app
EXPO_PUBLIC_SENTRY_DSN=
```

### Database Setup

Run Prisma migrations:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### Running the Application

1. Start backend server (Terminal 1):
```bash
cd backend
npm run start:dev
```

2. Start mobile app (Terminal 2):
```bash
cd mobile
npm start
```

For mobile:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Run `npm run start:lan` before scanning the QR code with Expo Go on a physical device

**Note for Android Emulator**: `npm start` advertises Metro over localhost, and `npm run android` sets up `adb reverse` for port `8081` before launching the app. Use `http://10.0.2.2:3000/api` in mobile `.env` instead of `localhost:3000/api`.

## 👥 User Roles

- **Buyer**: Browse products, view details, favorite items, contact sellers via WhatsApp
- **Seller**: Create stores, upload products, manage inventory
- **Admin**: Verify seller applications, manage platform

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/sign-up/email` - Register a user
- `POST /api/auth/sign-in/email` - Sign in
- `GET /api/auth/get-session` - Read the current session
- `POST /api/auth/sign-out` - Revoke the current session
- `POST /api/auth/delete-user` - Permanently delete the current account

### Stores
- `GET /api/stores` - List stores (with filters)
- `POST /api/stores` - Create store (seller/admin only)
- `GET /api/stores/me/dashboard` - Get seller dashboard
- `POST /api/stores/:id/verify` - Verify store (admin only)

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller/admin only)
- `PATCH /api/products/:id` - Update product (seller/admin only)
- `DELETE /api/products/:id` - Delete product (seller/admin only)
- `POST /api/products/:id/favorite` - Add to favorites
- `DELETE /api/products/:id/favorite` - Remove from favorites

### Admin
- `GET /api/admin/pending-stores` - Get pending store approvals
- `GET /api/admin/dashboard` - Get admin dashboard stats

## 🧪 Testing

Run the complete local quality gate from the repository root with `npm run quality`. CI runs the same lint, type-check, test, and build checks on pull requests.

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:e2e     # Run E2E tests
npm run test:cov      # Run with coverage
```

### Mobile Tests
```bash
cd mobile
npm test              # Run all tests
npm run test:e2e     # Run E2E tests with Detox
```

## 📝 Development Scripts

### Backend
- `npm run start:dev` - Start development server with hot reload
- `npm run start:prod` - Start production server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Mobile
- `npm start` - Start Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🌍 Internationalization

The app supports English and Arabic with automatic RTL layout switching:
- Language toggle in Settings
- Persisted language preference
- RTL-aware navigation and UI components

## 🔒 Security

- Better Auth database sessions with bcrypt password hashing
- Role-based access control (RBAC)
- Input validation with class-validator
- Rate limiting on auth endpoints
- Secure storage with expo-secure-store
- Server-owned payment status, pricing, inventory, and order totals
- Signed external image storage with file size and media validation
- Explicit production CORS, structured logs, readiness checks, and graceful shutdown

## 🚢 Release operations

- [Release runbook](docs/RELEASE_RUNBOOK.md)
- [Apple and Google checklist](docs/STORE_RELEASE_CHECKLIST.md)
- [Privacy policy](docs/PRIVACY_POLICY.md)
- [Terms of service](docs/TERMS_OF_SERVICE.md)

## 📄 License

ISC

## 👥 Contributors

- Development Team

## 🙏 Acknowledgments

- Built with NestJS, React Native, and Expo
- Icons from Expo Vector Icons (Material Design)
- Design inspired by Saudi marketplace culture
