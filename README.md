# IPO Management System - Frontend

A modern, responsive admin panel for managing IPO (Initial Public Offering) data with support for both Mainboard and SME IPOs.

## Features

- **Dual IPO Management**: Separate sections for Mainboard and SME IPOs
- **Status-based Views**: Filter IPOs by status (Upcoming, Open, Closed, Listed)
- **Comprehensive Management**:
  - Subscription tracking and management
  - GMP (Grey Market Premium) monitoring
  - Listing information updates
  - Document management (RHP, DRHP links)
  - User and PAN document management
- **Enhanced UI/UX**:
  - Color-coded IPO type badges (Purple for SME, Blue for Mainboard)
  - Advanced pagination with page numbers and ellipsis
  - Responsive data tables with sorting and filtering
  - Real-time data updates with RTK Query
- **Authentication**: Secure login with OTP verification
- **Form Validation**: Comprehensive Zod-based validation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Tables**: TanStack Table
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ipo-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Project Structure

```
ipo-frontend/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   │   ├── ipos/         # Mainboard IPO pages
│   │   ├── sme/          # SME IPO pages
│   │   ├── subscription/ # Subscription management
│   │   ├── gmp/          # GMP management
│   │   ├── listing-info/ # Listing information
│   │   ├── documents/    # Document management
│   │   └── users/        # User management
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── app-sidebar.tsx   # Sidebar navigation
│   ├── ipo-form.tsx      # IPO form component
│   └── *-manager.tsx     # Management components
├── lib/                   # Utilities and configurations
│   ├── features/         # Redux slices and API
│   │   ├── api/         # RTK Query API slices
│   │   └── auth/        # Auth slice
│   └── store.ts         # Redux store configuration
└── public/               # Static assets
```

## Key Features

### IPO Management
- Create, edit, and delete IPOs
- Filter by status and type
- View detailed IPO information
- Manage subscription data
- Track GMP history
- Update listing information
- Manage document links

### User Management
- View all customers
- Manage user PAN documents
- Update PAN verification status
- View user details and statistics

### Pagination
- Smart page number display (max 3 visible)
- Ellipsis for hidden pages
- Direct page navigation
- Previous/Next buttons

### Data Tables
- Sortable columns
- Search/filter functionality
- Column visibility toggle
- Responsive design

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL

## License

ISC
