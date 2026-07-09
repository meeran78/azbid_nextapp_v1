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
- **Auction lifecycle**: Soft close (extend-on-bid), cron-based lot close, automatic order and invoice creation, Stripe auto-charge with optional 3DS, and seller payouts via Stripe Connect (see [Auction & Payment Flow](#auction--payment-flow-complete) below)
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
- **Resend** - Email sending
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

        # Email Configuration (Resend)
        RESEND_API_KEY="re_your_resend_api_key"
        RESEND_FROM_EMAIL="hello@yourdomain.com"
        RESEND_FROM_NAME="Az-Bid"
        SUPPORT_EMAIL="support@yourdomain.com"

        # Social Authentication
        GOOGLE_CLIENT_ID="your-google-client-id"
        GOOGLE_CLIENT_SECRET="your-google-client-secret"
        GITHUB_CLIENT_ID="your-github-client-id"
        GITHUB_CLIENT_SECRET="your-github-client-secret"

        # Admin Configuration
        ADMIN_EMAILS="admin1@example.com;admin2@example.com"

        # Stripe (payments and seller payouts)
        STRIPE_SECRET_KEY="sk_..."
        STRIPE_WEBHOOK_SECRET="whsec_..."   # For /api/stripe/webhook
        PLATFORM_COMMISSION_PCT="10"        # Optional; default 10. Per-seller override via User.commissionPct

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
    pnpm dlx prisma db seed
5. **Start the development server**
       pnpm dev
   # or
   npm run dev
6. **Open your browser**
    Navigate to http://localhost:3000

## Complete End-to-End Workflow

This application is designed to support a full auction lifecycle from a fresh database. The following steps describe the expected user journey and the technical flow behind it.

### 1. Account setup and role selection

1. Create an account using the sign-up flow.
2. Verify your email address if required by your auth setup.
3. Choose a role:
   - Buyer: browse lots, place bids, and pay for winning items.
   - Seller: create a store, add lots, and manage auctions.
   - Admin: review sellers, approve stores, manage auctions, and oversee platform activity.
4. If a user wants seller access, they can submit a seller account request through the seller onboarding flow. Admins review and approve it.

### 2. Seller onboarding flow

1. A seller signs in and opens the seller dashboard.
2. The dashboard shows the current seller workflow status:
   - whether a store exists,
   - whether the store is active or pending approval,
   - how many lots and auctions have been created.
3. If no store exists, the seller creates a store with:
   - store name,
   - description,
   - optional logo.
4. The store is created as `PENDING` by default and an email is sent to admins for review.

### 3. Admin review and store approval

1. An admin opens the admin dashboard.
2. The admin reviews the new store and approves or rejects it.
3. Once the store is `ACTIVE`, the seller can publish lots.
4. If the store is still pending, the seller sees clear guidance to wait for approval before creating listings.

### 4. Create an auction, lot, and items

Once the store is approved:

1. The seller creates a lot from the seller dashboard.
2. The seller selects the store that owns the lot.
3. The seller fills in the lot details:
   - title,
   - description,
   - closing date/time,
   - inspection date/time (optional),
   - removal date/time (optional).
4. The seller adds one or more items to the lot.
5. Each item includes:
   - title,
   - description,
   - condition,
   - category,
   - start price,
   - reserve price (optional),
   - retail price (optional),
   - image uploads.
6. The seller can save the lot as a draft or publish it.

### 5. Auction association and publishing

1. Admins can create or manage auctions and associate approved lots with them.
2. Lots can be attached to an auction or remain standalone.
3. When an auction is marked `LIVE`, its linked lots become `LIVE` as well.
4. When a lot is published and approved, it becomes available for buyers to browse and bid on.

### 6. Buyer browsing and bidding

1. A buyer signs in and browses live lots.
2. Buyers can view item details, images, pricing, and lot timing.
3. To place bids, the buyer must have a valid card on file for verification and off-session charging.
4. The bidding flow works like this:
   - the buyer places a bid,
   - the item price updates,
   - the lot close time may be extended if the bid occurs in the soft-close window,
   - the bid is recorded and the buyer remains in the live bidding experience.
5. If a buyer wins, the lot closes and the system prepares the order and invoice.

### 7. Soft close and automatic lot closing

1. Lots have a closing time (`closesAt`).
2. If a bid arrives near the end of the lot window, the lot can be extended automatically.
3. A cron job checks for lots that have expired and closes them.
4. On close, the system:
   - marks the lot as `SOLD` or `UNSOLD`,
   - selects the winning bid for each item,
   - creates orders and invoices,
   - attempts payment collection for winning buyers.

### 8. Order, invoice, and payment flow

When a lot closes:

1. The system groups won items by buyer.
2. One order is created per buyer for the lot.
3. One invoice is created per order.
4. The invoice contains the winning bids, buyer premium, tax, and total.
5. The buyer is shown a payment page where they can complete the purchase.
6. If the invoice total is below the Stripe minimum, the platform notifies the buyer and skips card payment.
7. If the invoice total is above the minimum, Stripe is used to authorize or charge the buyer.
8. If 3D Secure or additional verification is required, the buyer completes it on the payment page.

### 9. Seller payout flow

1. Once payment succeeds, the invoice becomes `PAID`.
2. The platform triggers a seller payout through Stripe Connect.
3. The payout is idempotent and will not create duplicate transfers if the webhook is retried.
4. Seller commissions are calculated from either the seller-specific commission setting, platform commission, or a default fallback.
5. Revenue and payout metrics are surfaced in the seller dashboard.

### 10. What a seller sees after launch

After the flow is complete, the seller can:
- review lots and auctions in the seller dashboard,
- see which lots are live, sold, unsold, or pending,
- track orders and payout status,
- monitor analytics and seller performance metrics.

### 11. What a buyer sees after launch

After the flow is complete, the buyer can:
- see active bids and current lot status,
- review won lots and pending payments,
- pay for successful purchases,
- see order and invoice history.

## Auction & Payment Flow (Complete)

This section describes the full lifecycle from bidding through lot close, order creation, payment, and seller payout.

### 1. Bidding and soft close

**Location:** `src/actions/bid.action.ts`

- Buyers place bids on items in LIVE lots. Each bid updates the item’s `currentPrice` and creates a `Bid` record.
- **Soft close:** If a bid lands in the “soft close window” (e.g. last 2 minutes before `closesAt`), the lot’s close time can be extended so last-second bids get a fair chance.
  - **Window:** `remainingSeconds = (lot.closesAt - now) / 1000`; if `remainingSeconds <= softCloseWindowSec` (default 120), the lot is in the window.
  - **Limit:** `lot.extendedCount < softCloseExtendLimit` (default 10 extensions).
  - **Extension:** If the auction has soft close enabled, `closesAt` is extended by `softCloseExtendSec` (default 60) and `extendedCount` is incremented.
- Auction settings come from `lot.auction` (softCloseEnabled, softCloseWindowSec, softCloseExtendSec, softCloseExtendLimit). If the lot has no auction, defaults are used so standalone lots still get soft close.
- All updates (bid create, item price, optional lot extension) run in a **single Prisma transaction**.

**Schema:** Lot has `extendedCount`, `lastExtendedAt`; Auction has the four soft-close fields. Admins configure them in the Auction form.

---

### 2. Lot close (cron)

**Location:** `src/app/api/cron/close-lots/route.ts` → `src/actions/close-expired-lots.action.ts`

- A cron job (e.g. every minute via `vercel.json`) calls `closeExpiredLots()`.
- It finds lots with `status: "LIVE"` and `closesAt <= now` (after any soft-close extensions).
- For each such lot it calls `closeLot(lotId)`. Errors are collected and returned.

---

### 3. Order and invoice creation

**Location:** `src/actions/close-lot.action.ts` (`closeLot`)

When a lot closes:

1. **LOT CLOSE** – Lot is marked SOLD (if there are winning bids) or UNSOLD.
2. **Winners** – For each item, the top bid (by amount) is taken; `winningBidId` and `winningBidAmount` are set on the item.
3. **Group by buyer** – Won items are grouped by buyer. One **Order** per (buyer, lot) with status PENDING, and one **OrderItem** per won item (subtotal, buyer premium, tax, total).
4. **Invoice** – One **Invoice** per order: `invoiceDisplayId`, `orderId`, `buyerId`, `sellerId`, `lotId`, `winningBidAmount`, `buyerPremiumPct`, `tax`, `invoiceTotal`, status PENDING. **InvoiceItems** link the invoice to each won item. Buyer premium % comes from `lot.auction?.buyersPremium` (e.g. `"12%"` → 12); if no auction, premium is 0.
5. **Payment flow** – For each created invoice (see below).
6. **Notifications** – Buyers receive “You won – pay” or “Payment received”; seller receives “Lot sold” with a summary.

All DB writes for lot/items/orders/invoices are done in a **single transaction**; Stripe PaymentIntents are created **after** the transaction.

---

### 4. Payment flow (Stripe)

**Location:** `src/actions/payment.action.ts`, `src/app/api/stripe/webhook/route.ts`

#### 4.1 Invoices below $0.50

- If `invoiceTotal < 0.50`, the platform **does not** create a PaymentIntent or attempt charge (Stripe minimum is 50¢).
- In `closeLot`, such invoices are skipped for payment; the buyer is notified and can contact support. On the order pay page, a message explains the total is below the card minimum and the Stripe form is not shown.

#### 4.2 triggerPaymentFlow(invoiceId)

- Loads the invoice and buyer. If the invoice already has a `stripePaymentIntentId`, returns success (and optionally the existing client secret).
- Otherwise creates a Stripe **PaymentIntent** for `invoice.invoiceTotal` (USD), attached to the buyer’s Stripe customer, with `metadata: { invoiceId }` and `automatic_payment_methods: { enabled: true }`.
- Saves `stripePaymentIntentId` on the Invoice.
- Returns `clientSecret` for the frontend (e.g. Pay page) to confirm payment or complete 3DS.

#### 4.3 chargeInvoiceWithStoredPayment(invoiceId) (auto-charge at lot close)

- Ensures a PaymentIntent exists (calls `triggerPaymentFlow` if needed).
- **Payment method:** Uses the buyer’s **default** payment method when set (`customer.invoice_settings.default_payment_method`), provided it is a card; otherwise uses the first card on file. This matches the card set after SetupIntent (e.g. when adding a card in payment methods).
- Calls `stripe.paymentIntents.confirm(paymentIntentId, { payment_method: pmId, off_session: true })`.
- **If status is `succeeded`:** In one transaction, updates Invoice (status PAID, `paidAt`, `paymentRequiresAction: false`), Order (PAID), and Payment (upsert). Seller payout is **not** performed here; it is done only in the webhook.
- **If status is `requires_action` (e.g. 3DS):** The invoice is updated with `paymentRequiresAction: true`. The buyer can complete verification on the order pay page; the pay page shows a message that the bank requires additional verification and displays the Stripe form so they can finish 3DS.
- **Other statuses:** Returns a reason (e.g. “Payment requires customer action”) and the invoice stays PENDING.

#### 4.4 Webhook: payment_intent.succeeded

- Stripe sends `payment_intent.succeeded` when the charge succeeds (either from the sync confirm or after the buyer completes 3DS on the pay page).
- The handler reads `metadata.invoiceId`, loads the Invoice and Order, and in a transaction updates Invoice (PAID, `paidAt`, `paymentRequiresAction: false`), Order (PAID), and Payment (upsert).
- It then calls **transferToSellerForInvoice(invoiceId)** to send the seller’s share to their Stripe Connect account. This is the **only** place seller payout runs, so it is consistent and avoids double transfer when both the sync path and the webhook run.

---

### 5. Seller payout and commission

**Location:** `src/actions/stripe-connect.action.ts`, `src/actions/seller-revenue.action.ts`

#### 5.1 When payout runs

- Only after an invoice is **PAID**, from the Stripe webhook handler (`payment_intent.succeeded`). The handler calls `transferToSellerForInvoice(invoiceId)`.

#### 5.2 Idempotency

- Each Invoice has an optional **sellerPayoutTransferId**. If it is already set, `transferToSellerForInvoice` does **not** create a new transfer; it returns success with that transfer ID. So duplicate webhook deliveries do not double-pay the seller.
- After a successful Stripe Transfer, the invoice is updated with `sellerPayoutTransferId: transfer.id`.

#### 5.3 Commission source (priority)

1. **Per-seller:** `User.commissionPct` (0–100), if set.
2. **Platform:** `process.env.PLATFORM_COMMISSION_PCT` (parsed as number), if valid.
3. **Default:** 10% in code (`DEFAULT_COMMISSION_PCT`).

Commission is validated and clamped to 0–100; invalid or NaN values fall back to the next source or the default.

#### 5.4 Payout formula

- **Seller receives:** `winningBidAmount × (1 − commissionPct/100)` (in cents, USD), transferred to the seller’s Stripe Connect Express account.
- **Platform keeps:** Commission on the hammer (`winningBidAmount × commissionPct/100`) **plus** all buyer premium. The buyer pays `invoiceTotal` (hammer + buyer premium); only the seller’s share of the hammer is transferred.

Seller revenue metrics (e.g. “Platform commission paid”, “paid payout”) use the same commission resolution and formulas so reporting matches actual transfers.

---

### 6. Flow summary diagram

```
Cron (every minute)
    → closeExpiredLots() finds LIVE lots with closesAt <= now
    → For each: closeLot(lotId)

closeLot(lotId)
    → Mark lot SOLD/UNSOLD
    → Set winningBidId/winningBidAmount on each item
    → Create Order + OrderItems + Invoice + InvoiceItems per buyer (one transaction)
    → For each invoice with total >= $0.50:
          triggerPaymentFlow(invoiceId)     → create PaymentIntent, save ID on Invoice
          chargeInvoiceWithStoredPayment()  → confirm with default/first card (off_session)
              → If succeeded: Invoice/Order PAID, Payment upsert
              → If requires_action: set paymentRequiresAction = true (buyer completes 3DS on pay page)
    → Stripe sends payment_intent.succeeded (sync or after 3DS)
    → Webhook: mark Invoice/Order PAID, Payment upsert; transferToSellerForInvoice() (idempotent)
    → Email buyers and seller
```

---

### 7. Key files reference

| Area | File(s) |
|------|--------|
| Soft close (extend on bid) | `src/actions/bid.action.ts` |
| Cron (expired lots) | `src/app/api/cron/close-lots/route.ts`, `src/actions/close-expired-lots.action.ts` |
| Order & invoice creation | `src/actions/close-lot.action.ts` |
| PaymentIntent & auto-charge | `src/actions/payment.action.ts` |
| Stripe webhook & seller transfer | `src/app/api/stripe/webhook/route.ts` |
| Seller payout & commission | `src/actions/stripe-connect.action.ts` |
| Seller revenue metrics | `src/actions/seller-revenue.action.ts` |
| Buyer pay page (3DS, small total) | `src/app/(buyers)/buyers-dashboard/orders/[orderId]/pay/page.tsx` |

---

## Project Structure

**Project Structure**

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

### Development
- `pnpm dev` – Start development server (generates Prisma client)

### Production
- `pnpm build` – Build for production (generates Prisma client)
- `pnpm start` – Start production server

### Database
- `pnpm dlx prisma generate` – Generate Prisma Client
- `pnpm dlx prisma migrate dev` – Run migrations in development
- `pnpm dlx prisma migrate deploy` – Run migrations in production
- `pnpm dlx prisma studio` – Open Prisma Studio

### Linting
- `pnpm lint` – Run ESLint

### Sanity
- `pnpm dlx sanity@latest login`
- `pnpm create sanity@latest --project 3zqt6l7q --dataset production --template clean --typescript --output-path studio-azbid`

## 🎨 UI Components
    This project uses Shadcn/ui components built on Radix UI. Components are located in src/app/components/ui/.
    Key Components
    Buttons, Inputs, Labels
    Cards, Alerts, Dialogs
    Forms, Navigation menus
    Toast notifications (Sonner)
## 📧 Email Configuration
    Email functionality uses Resend. Configure the API key and sender details in .env:
    Set RESEND_API_KEY to your Resend API key.
    Set RESEND_FROM_EMAIL to the verified sender address in Resend.
    Set SUPPORT_EMAIL to the inbox that should receive contact requests.
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

- **Hot Reload:** Changes to components auto-reload
- **Prisma Studio:** Use `pnpm dlx prisma studio` to view/edit database
- **Type Safety:** Full TypeScript support throughout
- **Error Pages:** Custom error pages with animations
- **Loading States:** Custom loading pages
## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | ✅ |
| NEXT_PUBLIC_APP_URL | Public app URL | ✅ |
| BETTER_AUTH_SECRET | Auth secret key | ✅ |
| BETTER_AUTH_URL | Auth base URL | ✅ |
| RESEND_API_KEY | Resend API key | ✅ |
| RESEND_FROM_EMAIL | Sender address for outbound mail | ✅ |
| RESEND_FROM_NAME | Sender display name | ✅ |
| SUPPORT_EMAIL | Inbox that receives contact requests | ✅ |
| STRIPE_SECRET_KEY | Stripe secret key (payments, Connect, transfers) | ✅ for payments |
| STRIPE_WEBHOOK_SECRET | Webhook signing secret for `/api/stripe/webhook` | ✅ for payouts |
| PLATFORM_COMMISSION_PCT | Default platform commission % (0–100); overridden by User.commissionPct | ❌ (default 10) |
| GOOGLE_CLIENT_ID | Google OAuth client ID | ❌ |
| GOOGLE_CLIENT_SECRET | Google OAuth secret | ❌ |
| GITHUB_CLIENT_ID | GitHub OAuth client ID | ❌ |
| GITHUB_CLIENT_SECRET | GitHub OAuth secret | ❌ |
| ADMIN_EMAILS | Semicolon-separated admin emails | ❌ |
| NEXT_PUBLIC_SANITY_PROJECT_ID | Sanity project ID | ❌ |
| NEXT_PUBLIC_SANITY_DATASET | Sanity dataset name | ❌ |
| SANITY_API_TOKEN | Sanity API token | ❌ |

## 🐛 Troubleshooting

### Prisma Client Not Generated
Run `pnpm dlx prisma generate`.

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check database credentials

### Authentication Errors
- Verify BETTER_AUTH_SECRET is set
- Check BETTER_AUTH_URL matches your domain
- Ensure email configuration is correct

### Build Errors
- Run `pnpm dlx prisma generate` before building
- Check all environment variables are set
- Verify TypeScript errors are resolved

### Stripe / payments
- Ensure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set for payments and seller payouts
- Configure the webhook in Stripe Dashboard to point to `https://your-domain/api/stripe/webhook` and listen for `payment_intent.succeeded` (and optionally `payment_intent.payment_failed`, `setup_intent.succeeded`)

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