# KiraaBook Property Management SaaS - Implementation Plan

## Project Overview
KiraaBook is a property management SaaS web application designed for Indian landlords, built with React, Supabase, Tailwind CSS, and shadcn/ui components.

## Technology Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Database & Auth**: Supabase
- **Deployment**: Vercel

## Folder Structure
```
kiraa-book/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── GoogleAuthButton.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── OverdueList.tsx
│   │   │   └── EMISummary.tsx
│   │   ├── properties/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyForm.tsx
│   │   │   └── PropertyList.tsx
│   │   ├── rooms/
│   │   │   ├── RoomCard.tsx
│   │   │   ├── RoomForm.tsx
│   │   │   └── RoomStatusBadge.tsx
│   │   ├── tenants/
│   │   │   ├── TenantCard.tsx
│   │   │   ├── TenantForm.tsx
│   │   │   └── TenantProfile.tsx
│   │   ├── payments/
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── PaymentHistory.tsx
│   │   │   └── MonthlySummary.tsx
│   │   ├── emi/
│   │   │   ├── EMITracker.tsx
│   │   │   └── PropertyBreakdown.tsx
│   │   ├── reminders/
│   │   │   ├── RentReminders.tsx
│   │   │   └── WhatsAppButton.tsx
│   │   ├── agreements/
│   │   │   ├── AgreementList.tsx
│   │   │   └── AgreementCard.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorBoundary.tsx
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Properties.tsx
│   │   ├── Rooms.tsx
│   │   ├── Tenants.tsx
│   │   ├── Payments.tsx
│   │   ├── EMITracker.tsx
│   │   ├── Reminders.tsx
│   │   └── Agreements.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── types.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProperties.ts
│   │   ├── useTenants.ts
│   │   └── usePayments.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── postcss.config.js
└── README.md
```

## Database Schema (Supabase)

### Tables

#### 1. users
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('landlord', 'manager')),
  plan VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. properties
```sql
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('residential', 'commercial', 'mixed')),
  total_rooms INTEGER NOT NULL DEFAULT 0,
  loan_amount DECIMAL(12,2) DEFAULT 0,
  emi_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. rooms
```sql
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  floor INTEGER DEFAULT 1,
  type VARCHAR(50) DEFAULT 'bedroom' CHECK (type IN ('bedroom', 'hall', 'kitchen', 'bathroom', 'other')),
  rent_amount DECIMAL(8,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'notice_period')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, room_number)
);
```

#### 4. tenants
```sql
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  aadhaar VARCHAR(12) UNIQUE,
  move_in_date DATE NOT NULL,
  deposit_amount DECIMAL(8,2) NOT NULL DEFAULT 0,
  monthly_rent DECIMAL(8,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. payments
```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  amount DECIMAL(8,2) NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  paid_date DATE,
  method VARCHAR(20) CHECK (method IN ('cash', 'upi', 'bank_transfer', 'cheque')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, month, year)
);
```

#### 6. agreements
```sql
CREATE TABLE agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pdf_url TEXT,
  signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. expenses
```sql
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('maintenance', 'repair', 'tax', 'utility', 'other')),
  amount DECIMAL(8,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

#### Users Table
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Properties Table
```sql
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Landlords can see their own properties
CREATE POLICY "Landlords can view own properties" ON properties
  FOR SELECT USING (auth.uid() = owner_id);

-- Landlords can insert their own properties
CREATE POLICY "Landlords can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Landlords can update their own properties
CREATE POLICY "Landlords can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

-- Landlords can delete their own properties
CREATE POLICY "Landlords can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = owner_id);
```

## Design System

### Color Palette
- **Background**: #07090F (dark theme)
- **Accent**: #FF6B35 (orange)
- **Secondary Accent**: #4ECDC4 (teal)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #94A3B8
- **Border**: #334155
- **Card Background**: #1E293B

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: font-semibold, tracking-tight
- **Body**: font-normal

### Component Guidelines
- All components must have loading states
- Empty states with helpful messages
- Toast notifications for all actions
- Mobile-first responsive design
- Consistent spacing using Tailwind classes

## Step-by-Step Build Order

### Phase 1: Project Setup & Foundation
1. **Initialize Vite + React Project**
   - Create new Vite project with TypeScript
   - Install Tailwind CSS and configure
   - Install and setup shadcn/ui
   - Install Supabase client

2. **Setup Supabase**
   - Create Supabase project
   - Execute database schema
   - Configure RLS policies
   - Setup Google OAuth provider

3. **Core Infrastructure**
   - Setup routing (React Router)
   - Create layout components (Header, Sidebar, Layout)
   - Setup authentication context
   - Create utility functions and types
   - Setup toast notifications

### Phase 2: Authentication Page
4. **Auth Page Implementation**
   - Login form with email/password
   - Google OAuth integration
   - Role selection (Landlord/Manager)
   - Form validation and error handling
   - Loading states and redirects

### Phase 3: Dashboard
5. **Dashboard Implementation**
   - Stats cards (properties, tenants, rent collected)
   - Pending payments count
   - Overdue rent list
   - EMI vs income summary
   - Responsive grid layout

### Phase 4: Properties Management
6. **Properties Page**
   - Property list with cards
   - Add new property form
   - Edit/delete property functionality
   - Property cards with stats
   - Search and filter options

### Phase 5: Room Management
7. **Rooms Page**
   - Room listing per property
   - Add/edit/delete rooms
   - Room status badges
   - Floor-wise organization
   - Vacancy indicators

### Phase 6: Tenant Management
8. **Tenants Page**
   - Add tenant to room
   - Tenant profiles with all details
   - Search by name/phone
   - Tenant list across properties
   - Aadhaar validation

### Phase 7: Payment System
9. **Payments Page**
   - Record monthly payments
   - Payment status tracking
   - Running balance display
   - Monthly summaries
   - Payment history

### Phase 8: EMI Tracking
10. **EMI Tracker Page**
    - Total rent income calculation
    - Total EMI calculation
    - Net profit/loss display
    - Per-property breakdown
    - Visual charts

### Phase 9: Reminders System
11. **Reminders Page**
    - Rent due in next 7 days
    - Overdue rent alerts
    - WhatsApp integration
    - Notification preferences
    - Reminder history

### Phase 10: Agreement Management
12. **Agreements Page**
    - Agreement list per tenant
    - Expiry date tracking
    - 30-day expiry alerts
    - PDF upload/download
    - Digital signatures

### Phase 11: Final Polish & Deployment
13. **Testing & Optimization**
    - Cross-browser testing
    - Mobile responsiveness
    - Performance optimization
    - Error handling improvements
    - Accessibility audit

14. **Deployment**
    - Environment configuration
    - Vercel deployment setup
    - Domain configuration
    - Production testing
    - Documentation

## Key Features Implementation Notes

### Authentication Flow
- Use Supabase Auth for email/password and Google OAuth
- Store user role in custom users table
- Implement protected routes
- Handle session management

### Data Fetching Strategy
- Use React Query for server state management
- Implement optimistic updates
- Handle loading and error states
- Real-time subscriptions where needed

### Mobile Responsiveness
- Mobile-first design approach
- Collapsible sidebar for mobile
- Touch-friendly interactions
- Optimized forms for mobile input

### Performance Considerations
- Lazy loading for heavy components
- Image optimization
- Efficient database queries
- Proper indexing in Supabase

### Security Measures
- RLS policies enforced
- Input validation on frontend
- XSS protection
- CSRF protection via Supabase

## Testing Strategy
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical user flows
- Accessibility testing
- Performance testing

## Success Metrics
- User authentication working smoothly
- All CRUD operations functional
- Responsive design on all devices
- Real-time updates working
- Security policies enforced

---

**Next Steps**: After approval of this implementation plan, I will start with Phase 1 (Project Setup & Foundation) and proceed sequentially through each phase, providing browser previews after each major page completion.
