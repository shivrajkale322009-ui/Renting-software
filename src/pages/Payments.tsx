import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export default function Payments() {
    const { user } = useAuth()
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingPayment, setEditingPayment] = useState<any>(null)

    // Form states
    const [tenants, setTenants] = useState<any[]>([])
    const [formData, setFormData] = useState({
        tenant_id: '',
        amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: 'upi'
    })

    const fetchPayments = async () => {
        if (!user) return
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    tenants!inner(
                        name, phone, 
                        rooms!inner(room_number, properties!inner(name, owner_id))
                    )
                `)
                .eq('tenants.rooms.properties.owner_id', user.id)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            setPayments(data || [])
        } catch (err: any) {
            console.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchTenants = async () => {
        if (!user) return
        const { data } = await supabase
            .from('tenants')
            .select('id, name, monthly_rent, rooms!inner(properties!inner(owner_id))')
            .eq('rooms.properties.owner_id', user.id)
        setTenants(data || [])
    }

    useEffect(() => {
        fetchPayments()
        fetchTenants()
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingPayment) {
                const { error } = await supabase.from('payments').update({ ...formData }).eq('id', editingPayment.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('payments').insert([formData])
                if (error) throw error
            }
            setShowForm(false)
            setEditingPayment(null)
            fetchPayments()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this payment record?')) return
        try {
            const { error } = await supabase.from('payments').delete().eq('id', id)
            if (error) throw error
            fetchPayments()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const filteredPayments = payments.filter(p =>
        p.tenants?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tenants?.rooms?.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading && payments.length === 0) return <Layout><LoadingSpinner /></Layout>

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto text-white">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rent Payments</h1>
                        <p className="text-sm md:text-base text-slate-400">Total transaction history across all properties.</p>
                    </div>
                    <button 
                        onClick={() => { setShowForm(true); setEditingPayment(null); setFormData({ tenant_id: '', amount: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: 'paid', paid_date: new Date().toISOString().split('T')[0], payment_method: 'upi' }) }}
                        className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors font-medium text-xs md:text-sm shadow-xl shadow-orange-500/20"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Record Payment</span>
                        <span className="sm:hidden">Record</span>
                    </button>
                </div>

                {showForm && (
                    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{editingPayment ? 'Edit Record' : 'Record New Payment'}</CardTitle>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tenant</label>
                                    <select 
                                        required 
                                        value={formData.tenant_id} 
                                        onChange={e => {
                                            const tenantId = e.target.value;
                                            const tenant = tenants.find(t => t.id === tenantId);
                                            setFormData({ ...formData, tenant_id: tenantId, amount: tenant?.monthly_rent || 0 });
                                        }} 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
                                    >
                                        <option value="">Select Tenant</option>
                                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name} (Rent: ₹{t.monthly_rent})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Amount Paid (₹)</label>
                                    <input type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Month</label>
                                        <select value={formData.month} onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Year</label>
                                        <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Payment Date</label>
                                    <input type="date" value={formData.paid_date} onChange={e => setFormData({ ...formData, paid_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Method</label>
                                    <select value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="upi">UPI</option>
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-orange-500/20">
                                        {editingPayment ? 'Update Record' : 'Save Record'}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or room..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    />
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-800/40 border-b border-slate-800">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenant / Room</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-slate-300">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white leading-tight">{payment.tenants?.name}</span>
                                                <span className="text-[10px] text-slate-500 mt-0.5">Room {payment.tenants?.rooms?.room_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {payment.tenants?.rooms?.properties?.name}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium">
                                            {new Date(2000, payment.month - 1).toLocaleString('default', { month: 'short' })} {payment.year}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-teal-400">
                                            ₹{Number(payment.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-tight border ${
                                                payment.status === 'paid' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 
                                                payment.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingPayment(payment); setFormData({ ...payment }); setShowForm(true); }} className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white"><Pencil size={12} /></button>
                                                <button onClick={() => handleDelete(payment.id)} className="p-1 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
