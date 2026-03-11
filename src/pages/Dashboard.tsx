import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Home, Users, Wallet, AlertCircle, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export default function Dashboard() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        properties: 0,
        tenants: 0,
        collected: 0,
        pending: 0
    })
    const [recentPayments, setRecentPayments] = useState<any[]>([])
    const [upcomingEmis, setUpcomingEmis] = useState<any[]>([])

    useEffect(() => {
        async function fetchDashboardData() {
            if (!user) return

            try {
                setLoading(true)

                // 1. Fetch properties for this owner
                const { data: properties, error: propError } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('owner_id', user.id)
                
                if (propError) throw propError
                const propIds = properties?.map(p => p.id) || []

                // 2. Fetch total tenants
                let tenantCount = 0
                if (propIds.length > 0) {
                    const { count, error: tenantError } = await supabase
                        .from('tenants')
                        .select('id, room_id!inner(property_id)', { count: 'exact', head: true })
                        .in('room_id.property_id', propIds)
                    
                    if (tenantError) throw tenantError
                    tenantCount = count || 0
                }

                // 3. Payments logic
                const now = new Date()
                const currMonth = now.getMonth() + 1
                const currYear = now.getFullYear()

                let collected = 0
                let pendingCount = 0
                let recent: any[] = []

                if (propIds.length > 0) {
                    const { data: payments } = await supabase
                        .from('payments')
                        .select(`amount, status, tenant_id!inner(room_id!inner(property_id))`)
                        .eq('month', currMonth)
                        .eq('year', currYear)
                        .in('tenant_id.room_id.property_id', propIds)

                    collected = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0
                    pendingCount = payments?.filter(p => p.status === 'pending').length || 0

                    // 4. Fetch last 5 recent payments
                    const { data: recentData } = await supabase
                        .from('payments')
                        .select(`
                            id, amount, paid_date, status, 
                            tenants(name, rooms(room_number, properties(name, owner_id)))
                        `)
                        .eq('tenants.rooms.properties.owner_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(5)
                    
                    recent = recentData || []
                }

                setStats({
                    properties: properties?.length || 0,
                    tenants: tenantCount,
                    collected,
                    pending: pendingCount
                })
                setRecentPayments(recent)
                setUpcomingEmis(properties?.filter(p => Number(p.emi_amount) > 0) || [])

            } catch (err: any) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [user])

    if (loading) return <Layout><LoadingSpinner /></Layout>

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto text-white">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-sm md:text-base text-slate-400">Welcome back, manager!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-slate-300">Properties</CardTitle>
                            <Home className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                        </CardHeader>
                        <CardContent className="px-3 md:px-6">
                            <div className="text-xl md:text-2xl font-bold">{stats.properties}</div>
                            <p className="text-[10px] md:text-xs text-slate-500">Active units</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-slate-300">Tenants</CardTitle>
                            <Users className="w-3 h-3 md:w-4 md:h-4 text-teal-500" />
                        </CardHeader>
                        <CardContent className="px-3 md:px-6">
                            <div className="text-xl md:text-2xl font-bold">{stats.tenants}</div>
                            <p className="text-[10px] md:text-xs text-slate-500">Total residents</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-slate-300">Collected</CardTitle>
                            <Wallet className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                        </CardHeader>
                        <CardContent className="px-3 md:px-6">
                            <div className="text-xl md:text-2xl font-bold">₹{(stats.collected / 1000).toFixed(1)}K</div>
                            <p className="text-[10px] md:text-xs text-slate-400">Rent this month</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6">
                            <CardTitle className="text-[10px] md:text-sm font-medium text-slate-300">Overdue</CardTitle>
                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                        </CardHeader>
                        <CardContent className="px-3 md:px-6">
                            <div className="text-xl md:text-2xl font-bold text-red-400">{stats.pending}</div>
                            <p className="text-[10px] md:text-xs text-slate-500">Pending items</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-7 gap-4 md:gap-6">
                    <Card className="lg:col-span-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentPayments.length > 0 ? recentPayments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-orange-500 text-xs font-bold border border-slate-700 uppercase overflow-hidden">
                                                {p.tenants?.name?.substring(0, 2) || 'JD'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{p.tenants?.name}</p>
                                                <p className="text-[10px] md:text-xs text-slate-500">
                                                    {p.tenants?.rooms?.properties?.name} - Rm {p.tenants?.rooms?.room_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-teal-500 text-sm">₹{Number(p.amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500">{p.paid_date ? new Date(p.paid_date).toLocaleDateString() : 'Pending'}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 space-y-2">
                                        <p className="text-slate-500 text-sm">No recent payments found.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-3 space-y-4 md:space-y-6">
                        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                                    <AlertCircle className="text-orange-500 w-5 h-5" />
                                    <span>Upcoming EMIs</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {upcomingEmis.length > 0 ? upcomingEmis.map((emi) => (
                                        <div key={emi.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                                            <div>
                                                <p className="font-medium text-sm text-white">{emi.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Loan EMI</p>
                                            </div>
                                            <p className="font-bold text-orange-500 text-sm">₹{Number(emi.emi_amount).toLocaleString()}</p>
                                        </div>
                                    )) : (
                                        <p className="text-slate-500 text-xs text-center py-4">No active loans found.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/30 border-orange-500/20 backdrop-blur-sm border-dashed">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                                    <Zap className="text-orange-500 w-4 h-4" />
                                    <span>Quick Tip</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-slate-400">Collect 100% rent by offering small discounts on early UPI payments!</p>
                                <div className="space-y-2">
                                    <button onClick={() => window.location.href = '/payments'} className="w-full py-2 bg-orange-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-orange-500/20">Go to Rent Records</button>
                                    <button onClick={() => window.location.href = '/tenants'} className="w-full py-2 bg-slate-900 text-slate-300 rounded-lg text-[10px] font-bold transition-all border border-slate-800">Check Tenants</button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
