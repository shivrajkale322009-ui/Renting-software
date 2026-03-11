export const sampleProperties = [
    {
        id: '1',
        name: 'Sunrise Apartments',
        address: 'Block B, 12th Cross, Sector 4, Bangalore',
        type: 'flat',
        total_rooms: 12,
        loan_amount: 4500000,
        emi_amount: 45000,
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Krishna PG',
        address: 'Hebbal, near Manyata Tech Park, Bangalore',
        type: 'PG',
        total_rooms: 24,
        loan_amount: 2500000,
        emi_amount: 28000,
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Metro Suites',
        address: 'Indiranagar, 100ft Road, Bangalore',
        type: 'commercial',
        total_rooms: 8,
        loan_amount: 8500000,
        emi_amount: 75000,
        created_at: new Date().toISOString()
    }
];

export const sampleTenants = [
    {
        id: '1',
        name: 'Rahul Kumar',
        phone: '+91 98765 43210',
        monthly_rent: 12000,
        deposit_amount: 36000,
        move_in_date: '2023-01-15',
        rooms: { room_number: '101', properties: { name: 'Sunrise Apartments' } }
    },
    {
        id: '2',
        name: 'Jessica Smith',
        phone: '+91 98123 45678',
        monthly_rent: 8500,
        deposit_amount: 25000,
        move_in_date: '2023-05-20',
        rooms: { room_number: '204', properties: { name: 'Krishna PG' } }
    },
    {
        id: '3',
        name: 'Mohammed Ali',
        phone: '+91 99001 12233',
        monthly_rent: 15000,
        deposit_amount: 45000,
        move_in_date: '2023-03-10',
        rooms: { room_number: '302', properties: { name: 'Sunrise Apartments' } }
    }
];

export const samplePayments = [
    {
        id: '1',
        amount: 12000,
        month: 10,
        year: 2023,
        status: 'paid',
        paid_date: '2023-10-05',
        tenants: { name: 'Rahul Kumar', rooms: { room_number: '101', properties: { name: 'Sunrise Apartments' } } }
    },
    {
        id: '2',
        amount: 8500,
        month: 10,
        year: 2023,
        status: 'pending',
        paid_date: null,
        tenants: { name: 'Jessica Smith', rooms: { room_number: '204', properties: { name: 'Krishna PG' } } }
    },
    {
        id: '3',
        amount: 15000,
        month: 10,
        year: 2023,
        status: 'paid',
        paid_date: '2023-10-02',
        tenants: { name: 'Mohammed Ali', rooms: { room_number: '302', properties: { name: 'Sunrise Apartments' } } }
    }
];

export const sampleAgreements = [
    {
        id: '1',
        start_date: '2023-01-15',
        end_date: '2024-01-14',
        signed: true,
        tenants: { name: 'Rahul Kumar', rooms: { room_number: '101', properties: { name: 'Sunrise Apartments' } } }
    },
    {
        id: '2',
        start_date: '2023-05-20',
        end_date: '2024-05-19',
        signed: true,
        tenants: { name: 'Jessica Smith', rooms: { room_number: '204', properties: { name: 'Krishna PG' } } }
    }
];
