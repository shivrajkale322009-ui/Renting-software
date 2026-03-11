export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'landlord' | 'manager'
  plan: 'free' | 'starter' | 'pro'
  created_at: string
}

export interface Property {
  id: string
  owner_id: string
  name: string
  address: string
  type: 'flat' | 'PG' | 'hostel' | 'commercial'
  total_rooms: number
  loan_amount: number
  emi_amount: number
  created_at: string
}

export interface Room {
  id: string
  property_id: string
  room_number: string
  floor: number
  type: string
  rent_amount: number
  status: 'vacant' | 'occupied' | 'notice'
  created_at: string
}

export interface Tenant {
  id: string
  room_id: string
  name: string
  phone: string
  aadhaar?: string
  photo_url?: string
  move_in_date: string
  move_out_date?: string
  deposit_amount: number
  monthly_rent: number
  created_at: string
}

export interface Payment {
  id: string
  tenant_id: string
  amount: number
  month: number
  year: number
  paid_date?: string
  method?: 'cash' | 'upi' | 'bank'
  status: 'paid' | 'pending' | 'partial'
  razorpay_id?: string
  created_at: string
}

export interface Agreement {
  id: string
  tenant_id: string
  start_date: string
  end_date: string
  pdf_url?: string
  signed: boolean
  signed_date?: string
  created_at: string
}

export interface Expense {
  id: string
  property_id: string
  type: string
  amount: number
  date: string
  description?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  message: string
  sent_at: string
  channel: 'whatsapp' | 'email' | 'sms'
  status: 'sent' | 'failed' | 'pending'
}
