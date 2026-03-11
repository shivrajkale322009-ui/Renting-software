import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card, CardContent } from '../components/ui/card'
import { MessageSquare, Phone, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export default function Reminders() {
    const { user } = useAuth()
    const [overdueTenants, setOverdueTenants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOverdue() {
            if (!user) return

            try {
                setLoading(true)

                // 1. Fetch properties for this owner
                const { data: props } = await supabase.from('properties').select('id').eq('owner_id', user.id)
                const propIds = props?.map(p => p.id) || []

                if (propIds.length === 0) {
                    setOverdueTenants([])
                    return
                }

                // 2. Fetch all tenants for these properties
                const { data: tenants, error: tError } = await supabase
                    .from('tenants')
                    .select('*, rooms!inner(room_number, properties!inner(name))')
                    .in('rooms.property_id', propIds)
                
                if (tError) throw tError

                // 3. Fetch payments for current month
                const now = new Date()
                const currMonth = now.getMonth() + 1
                const currYear = now.getFullYear()

                const { data: paidPayments } = await supabase
                    .from('payments')
                    .select('tenant_id')
                    .eq('month', currMonth)
                    .eq('year', currYear)
                    .eq('status', 'paid')
                
                const paidTenantIds = new Set(paidPayments?.map(p => p.tenant_id))

                // 4. Overdue = tenants not in paidTenantIds
                const overdue = tenants?.filter(t => !paidTenantIds.has(t.id)) || []
                setOverdueTenants(overdue)

            } catch (err: any) {
                console.error('Overdue fetch failed:', err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchOverdue()
    }, [user])

    const sendWhatsApp = (t: any) => {
        const now = new Date()
        const monthName = now.toLocaleString('default', { month: 'long' })
        const text = `Hi ${t.name}, friendly reminder to clear your rent for ${monthName}. Amount: ₹${t.monthly_rent}. Thanks!`
        window.open(`https://wa.me/91${t.phone}?text=${encodeURIComponent(text)}`)
    }

    if (loading) return <Layout><LoadingSpinner /></Layout>

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto text-white">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rent Reminders</h1>
                        {overdueTenants.length > 0 && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{overdueTenants.length}</span>
                        )}
                    </div>
                    <p className="text-sm md:text-base text-slate-400">Tenants who haven't paid rent for the current month.</p>
                </div>

                {overdueTenants.length === 0 ? (
                    <div className="text-center py-20 bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-3xl">
                        <Clock className="mx-auto text-emerald-500 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-emerald-400">All caught up!</h3>
                        <p className="text-slate-500 mt-2">No pending rent collections for this month.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {overdueTenants.map((t) => (
                            <Card key={t.id} className="bg-slate-900/50 border-slate-800 hover:border-orange-500/30 transition-all shadow-lg">
                                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{t.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Room {t.rooms?.room_number} • {t.rooms?.properties?.name}
                                            </p>
                                            <p className="text-sm font-bold text-orange-400 mt-1">Due: ₹{Number(t.monthly_rent).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => sendWhatsApp(t)}
                                            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg transition-colors font-bold text-xs"
                                        >
                                            <MessageSquare size={16} />
                                            <span>WhatsApp</span>
                                        </button>
                                        <a 
                                            href={`tel:${t.phone}`}
                                            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors font-bold text-xs"
                                        >
                                            <Phone size={16} />
                                            <span>Call</span>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}
