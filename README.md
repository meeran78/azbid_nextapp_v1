# AZBid - Online Auction Platform

A modern, full-featured online auction platform built with Next.js 16, featuring role-based authentication, multi-factor authentication, and a comprehensive auction management system.

## 🚀 Features

### Authentication & Security
- **Better Auth Integration**: Secure authentication with email/password and social login (Google, GitHub)
- **Multi-Factor Authentication (MFA)**: Enhanced security with 2FA support
- **Role-Based Access Control**: Three user roles (Buyer, Seller, Admin) with different permissions
- **Email Verification**: Required email verification for new accounts
- **Password Reset**: Secure password reset functionality via email
- **Magic Link Login**: Passwordless authentication option

### User Roles
- **Buyer**: Browse auctions, place bids, manage watchlist
- **Seller**: Create listings, manage auctions, track sales
- **Admin**: Full platform management, user administration, analytics

### Platform Features
- **Live Auctions**: Real-time auction browsing and bidding
- **Buy Now**: Instant purchase option for select items
- **User Profiles**: Comprehensive user profile management
- **Email Notifications**: Automated email notifications for important events
- **Responsive Design**: Fully responsive UI with dark mode support
- **Animated UI**: Smooth animations using Framer Motion

### Content Management
- **Sanity CMS Integration**: Headless CMS for content management
- **Custom Studio**: Sanity Studio for content editing

## 🛠️ Tech Stack

### Core
- **Next.js 16.1.3** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety

### Authentication & Database
- **Better Auth 1.4.17** - Authentication library
- **Prisma 7.3.0** - Database ORM
- **PostgreSQL** - Database
- **Argon2** - Password hashing

### UI & Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Shadcn/ui** - Component library (Radix UI)
- **Framer Motion 12.27.0** - Animation library
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Additional Libraries
- **Sanity 4.22.0** - Headless CMS
- **Nodemailer** - Email sending
- **Stripe** - Payment processing (integrated)
- **Zod** - Schema validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 20.x or higher
- **pnpm** (recommended) or npm/yarn
- **PostgreSQL** database
- **Git**

## 🔧 Installation

1. **Clone the repository**
   git clone <repository-url>
   cd azbid_nextapp_v1
2. **Install Dependencies**
    pnpm install
    # or
    npm install
3. **Set up environment variables**
     # Database
        DATABASE_URL="postgresql://user:password@localhost:5432/azbid_db"

        # Next.js
        NEXT_PUBLIC_APP_URL="http://localhost:3000"

        # Better Auth
        BETTER_AUTH_SECRET="your-secret-key-here"
        BETTER_AUTH_URL="http://localhost:3000"

        # Email Configuration (Nodemailer)
        SMTP_HOST="smtp.gmail.com"
        SMTP_PORT=587
        SMTP_USER="your-email@gmail.com"
        SMTP_PASSWORD="your-app-password"

        # Social Authentication
        GOOGLE_CLIENT_ID="your-google-client-id"
        GOOGLE_CLIENT_SECRET="your-google-client-secret"
        GITHUB_CLIENT_ID="your-github-client-id"
        GITHUB_CLIENT_SECRET="your-github-client-secret"

        # Admin Configuration
        ADMIN_EMAILS="admin1@example.com;admin2@example.com"

        # Sanity (optional)
        NEXT_PUBLIC_SANITY_PROJECT_ID="your-sanity-project-id"
        NEXT_PUBLIC_SANITY_DATASET="production"
        SANITY_API_TOKEN="your-sanity-api-token"
4. **Set up the database**
       # Generate Prisma Client
   pnpm dlx prisma generate

   # Run migrations
   pnpm dlx prisma migrate dev

   # (Optional) Seed the database
   # pnpm dlx prisma db seed
5. **Start the development server**
       pnpm dev
   # or
   npm run dev
6. **Open your browser**
    Navigate to http://localhost:3000

## Project Structure
    **Proejct Structure**
    azbid_nextapp_v1/
    ├── src/
    │   ├── app/                    # Next.js App Router pages
    │   │   ├── (admin)/            # Admin routes
    │   │   ├── (auction)/          # Auction routes
    │   │   ├── (auth)/             # Authentication routes
    │   │   │   ├── sign-in/        # Sign in page
    │   │   │   ├── sign-up/        # Sign up page
    │   │   │   ├── forgot-password/ # Password reset
    │   │   │   ├── verify-email/   # Email verification
    │   │   │   └── profile/        # User profile
    │   │   ├── (buyers)/           # Buyer-specific routes
    │   │   ├── (sellers)/          # Seller-specific routes
    │   │   ├── api/                # API routes
    │   │   │   └── auth/           # Better Auth API
    │   │   ├── components/         # React components
    │   │   │   └── ui/             # Shadcn/ui components
    │   │   ├── studio/             # Sanity Studio
    │   │   ├── layout.tsx          # Root layout
    │   │   ├── page.tsx            # Home page
    │   │   ├── loading.tsx         # Loading page
    │   │   ├── error.tsx           # Error page
    │   │   ├── not-found.tsx       # 404 page
    │   │   └── global-error.tsx    # Global error page
    │   ├── actions/                # Server actions
    │   │   ├── signInEmail.action.ts
    │   │   ├── signUpEmail.action.ts
    │   │   ├── forgetPassword.action.ts
    │   │   ├── changePassword.action.ts
    │   │   └── sendEmail.action.ts
    │   ├── lib/                    # Utility libraries
    │   │   ├── auth.ts             # Better Auth configuration
    │   │   ├── auth-client.ts      # Client-side auth
    │   │   ├── prisma.ts           # Prisma client
    │   │   ├── permissions.ts     # Role-based permissions
    │   │   ├── utils.ts            # Utility functions
    │   │   └── argon2.ts           # Password hashing
    │   └── sanity/                 # Sanity CMS configuration
    ├── prisma/
    │   ├── schema.prisma          # Database schema
    │   └── migrations/            # Database migrations
    ├── public/                    # Static assets
    │   ├── images/                # Image assets
    │   └── videos/                # Video assets
    ├── generated/                 # Generated Prisma client
    └── package.json

## 🔐 Authentication
    User Registration
    Navigate to /sign-up
    Choose your account type (Buyer, Seller, or Admin with special key)
    Fill in your details and accept terms & conditions
    Verify your email address
    Complete your profile

## Admin Access
    To create an admin account, use the special admin key:

## Social Authentication
    Google OAuth: Configure Google OAuth credentials in .env
    GitHub OAuth: Configure GitHub OAuth credentials in .env
## Multi-Factor Authentication
    MFA can be enabled in user profile settings for enhanced security.
## 🗄️ Database Schema
    Models
    User: User accounts with roles (BUYER, SELLER, ADMIN)
    Session: User sessions
    Account: OAuth accounts
    Verification: Email verification tokens
    Post: Example content model (can be extended)
    User Roles
    BUYER - Default role for new users
    SELLER - For users who want to sell items
    ADMIN - Platform administrators
## 🚀 Available Scripts

# Developmentpnpm dev              
# Start development server (generates Prisma client)# Productionpnpm build            
# Build for production (generates Prisma client)pnpm start            
# Start production server# Databasepnpm dlx prisma generate        
# Generate Prisma Clientpnpm dlx prisma migrate dev      
# Run migrations in developmentpnpm dlx prisma migrate deploy   
# Run migrations in productionpnpm dlx prisma studio           
# Open Prisma Studio# Lintingpnpm lint             
# Run ESLint# Sanitypnpm dlx sanity@latest loginpnpm create sanity@latest --project 3zqt6l7q --dataset production --template clean --typescript --output-path studio-azbid

## 🎨 UI Components
    This project uses Shadcn/ui components built on Radix UI. Components are located in src/app/components/ui/.
    Key Components
    Buttons, Inputs, Labels
    Cards, Alerts, Dialogs
    Forms, Navigation menus
    Toast notifications (Sonner)
## 📧 Email Configuration
    Email functionality uses Nodemailer. Configure SMTP settings in .env:
    Gmail: Use App Password (not regular password)
    Other providers: Adjust SMTP_HOST and SMTP_PORT accordingly
## 🔒 Security Features
    Password hashing with Argon2
    Email verification required
    Session management with secure cookies
    CSRF protection
    Rate limiting (via Better Auth)
    Role-based access control
    MFA support
## 🌐 Deployment
    Vercel (Recommended)
    Push your code to GitHub
    Import project in Vercel
    Add environment variables
    Deploy
    Other Platforms
    Ensure PostgreSQL database is accessible
    Set all environment variables
    Run pnpm build before deployment
    Run migrations: pnpm dlx prisma migrate deploy
## 🧪 Development Tips
    Hot Reload: Changes to components auto-reload
    Prisma Studio: Use pnpm dlx prisma studio to view/edit database
    Type Safety: Full TypeScript support throughout
    Error Pages: Custom error pages with animations
    Loading States: Custom loading pages
## 📝 Environment Variables Reference
    Variable	Description	Required
    DATABASE_URL	PostgreSQL connection string	✅
    NEXT_PUBLIC_APP_URL	Public app URL	✅
    BETTER_AUTH_SECRET	Auth secret key	✅
    BETTER_AUTH_URL	Auth base URL	✅
    SMTP_HOST	SMTP server host	✅
    SMTP_PORT	SMTP server port	✅
    SMTP_USER	SMTP username	✅
    SMTP_PASSWORD	SMTP password	✅
    GOOGLE_CLIENT_ID	Google OAuth client ID	❌
    GOOGLE_CLIENT_SECRET	Google OAuth secret	❌
    GITHUB_CLIENT_ID	GitHub OAuth client ID	❌
    GITHUB_CLIENT_SECRET	GitHub OAuth secret	❌
    ADMIN_EMAILS	Semicolon-separated admin emails	❌
    NEXT_PUBLIC_SANITY_PROJECT_ID	Sanity project ID	❌
    NEXT_PUBLIC_SANITY_DATASET	Sanity dataset name	❌
    SANITY_API_TOKEN	Sanity API token	❌
## 🐛 Troubleshooting
    Prisma Client Not Generated
    pnpm dlx prisma generate
    Database Connection Issues
    Verify DATABASE_URL is correct
    Ensure PostgreSQL is running
    Check database credentials
    Authentication Errors
    Verify BETTER_AUTH_SECRET is set
    Check BETTER_AUTH_URL matches your domain
    Ensure email configuration is correct
    Build Errors
    Run pnpm dlx prisma generate before building
    Check all environment variables are set
    Verify TypeScript errors are resolved
## 📚 Additional Resources
    Next.js Documentation
    Better Auth Documentation
    Prisma Documentation
    Shadcn/ui Documentation
    Sanity Documentation
## 🤝 Contributing
    Fork the repository
    Create a feature branch (git checkout -b feature/amazing-feature)
    Commit your changes (git commit -m 'Add amazing feature')
    Push to the branch (git push origin feature/amazing-feature)
    Open a Pull Request
## 📄 License
    This project is private and proprietary of Falah LLC.
## 👥 Support
    For issues and questions, please contact the development team.