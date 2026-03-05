# Delivery details form

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mohibazhar16-7218s-projects/v0-delivery-details-form)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/uBehve7NGVa)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/mohibazhar16-7218s-projects/v0-delivery-details-form](https://vercel.com/mohibazhar16-7218s-projects/v0-delivery-details-form)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/uBehve7NGVa](https://v0.app/chat/uBehve7NGVa)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Groq API key (for OCR image upload feature)

### Local Development Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd v0-delivery-details-form
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the project root:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   \`\`\`

4. **Run database migrations**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run all SQL scripts in the `scripts/` folder in order (001 through 009):
     - `001_create_deliveries_table.sql` - Creates deliveries table
     - `002_add_rls_policies.sql` - Sets up Row Level Security
     - `003_add_status_column.sql` - Adds delivery status field
     - `004_add_tracking_number.sql` - Adds tracking number field
     - `005_add_items_column.sql` - Adds items to pack field
     - `006_update_status_constraint.sql` - Updates status options
     - `007_add_user_id_to_deliveries.sql` - Links deliveries to users
     - `008_verify_rls_policies.sql` - Verifies RLS policies
     - `009_assign_deliveries_to_user.sql` - Assigns old deliveries to user

5. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Authentication
- User registration and login with Supabase Auth
- Email verification required before access
- Long-lasting sessions (7 days refresh token)
- Forgot password and password reset functionality
- Change password option in user menu

### Delivery Management
- Create delivery labels with recipient info (name, phone, address, city)
- Optional COD (Cash on Delivery) amount
- Items/packing list for orders
- Tracking number assignment
- Delivery status tracking (New, Prepared, Shipped, Delivered, Payment Received, Returned, Cancelled)

### Print Features
- Single delivery label printing (fits A4/A5/A6 paper)
- QR code on each label for quick scanning
- Bulk print multiple deliveries at once
- Auto-scaling fonts for better readability

### Advanced Features
- OCR image upload using Groq AI to auto-fill form fields
- Double-click inline editing for all delivery fields
- View all deliveries in a searchable table
- Color-coded delivery status badges
- Expandable address field in forms

## Project Structure

\`\`\`
├── app/
│   ├── auth/                    # Authentication pages
│   ├── page.tsx                 # Main delivery form
│   ├── deliveries/              # View all deliveries
│   ├── delivery/[id]/           # Single delivery view
│   └── actions.ts               # Server actions
├── components/
│   ├── deliveries-table.tsx     # Deliveries list table
│   ├── delivery-print.tsx       # Print label component
│   ├── ocr-upload.tsx           # OCR image upload
│   ├── user-header.tsx          # User menu and logout
│   └── ui/                      # shadcn/ui components
├── lib/
│   └── supabase/                # Supabase client setup
├── scripts/                     # Database migrations
└── proxy.ts                     # Auth middleware
\`\`\`

## Deployment

### Deploy to Vercel

1. Push your changes to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
4. Vercel automatically deploys on push

### First User Setup

After deployment, when you create the first user account:
1. Sign up with your email
2. Confirm your email address
3. Log in with credentials
4. Any existing delivery records will be automatically assigned to your account

To manually assign existing deliveries to a user, run:
\`\`\`sql
UPDATE deliveries 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL;
\`\`\`

## Technologies Used

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI/ML**: Groq API (Llama 4 Scout for OCR)
- **UI Components**: shadcn/ui
- **QR Code**: qrcode.react
- **Charts**: Recharts

## License

This project is built with [v0.app](https://v0.app)
