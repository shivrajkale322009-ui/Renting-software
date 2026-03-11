import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Plus, Search, X, Users as UsersIcon, Home, Phone, Calendar, Trash2, Pencil } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export default function Tenants() {
    const { user } = useAuth()
    const [tenants, setTenants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingTenant, setEditingTenant] = useState<any>(null)

    // Form states
    const [properties, setProperties] = useState<any[]>([])
    const [rooms, setRooms] = useState<any[]>([])
    const [selectedPropertyId, setSelectedPropertyId] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        room_id: '',
        monthly_rent: 0,
        move_in_date: new Date().toISOString().split('T')[0],
        move_out_date: '',
        deposit_amount: 0,
        aadhaar: ''
    })

    const fetchTenants = async () => {
        if (!user) return
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('tenants')
                .select('*, rooms!inner(room_number, property_id, properties!inner(name, owner_id))')
                .eq('rooms.properties.owner_id', user.id)
                .order('created_at', { ascending: false })
            if (error) throw error
            setTenants(data || [])
        } catch (err: any) {
            console.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchProperties = async () => {
        if (!user) return
        const { data } = await supabase.from('properties').select('*').eq('owner_id', user.id)
        setProperties(data || [])
    }

    const fetchRoomsForProperty = async (propertyId: string) => {
        const { data } = await supabase
            .from('rooms')
            .select('*')
            .eq('property_id', propertyId)
            .eq('status', 'vacant')
        setRooms(data || [])
    }

    useEffect(() => {
        fetchTenants()
        fetchProperties()
    }, [user])

    useEffect(() => {
        if (selectedPropertyId) {
            fetchRoomsForProperty(selectedPropertyId)
        } else {
            setRooms([])
        }
    }, [selectedPropertyId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingTenant) {
                const { error } = await supabase.from('tenants').update({ ...formData }).eq('id', editingTenant.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('tenants').insert([formData])
                if (error) throw error
                // Mark room as occupied
                await supabase.from('rooms').update({ status: 'occupied' }).eq('id', formData.room_id)
            }
            setShowForm(false)
            setEditingTenant(null)
            fetchTenants()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleDelete = async (id: string, roomId: string) => {
        if (!confirm('Are you sure? This will also remove the tenant from the room.')) return
        try {
            const { error } = await supabase.from('tenants').delete().eq('id', id)
            if (error) throw error
            await supabase.from('rooms').update({ status: 'vacant' }).eq('id', roomId)
            fetchTenants()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const filteredTenants = tenants.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone?.includes(searchTerm) ||
        t.rooms?.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading && tenants.length === 0) return <Layout><LoadingSpinner /></Layout>

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto text-white">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tenants</h1>
                        <p className="text-sm md:text-base text-slate-400">View and manage all active residents.</p>
                    </div>
                    <button 
                        onClick={() => { 
                            setShowForm(true); 
                            setEditingTenant(null); 
                            setFormData({ name: '', phone: '', room_id: '', monthly_rent: 0, move_in_date: new Date().toISOString().split('T')[0], move_out_date: '', deposit_amount: 0, aadhaar: '' });
                        }}
                        className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors font-medium text-xs md:text-sm shadow-xl shadow-teal-500/20"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Tenant</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>

                {showForm && (
                    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{editingTenant ? 'Edit Tenant' : 'Add New Tenant'}</CardTitle>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tenant Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                    <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" placeholder="+91 98765 43210" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Aadhaar Number</label>
                                    <input value={formData.aadhaar} onChange={e => setFormData({ ...formData, aadhaar: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" placeholder="1234 5678 9012" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Select Property</label>
                                    <select required value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="">Choose Property</option>
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Select Room</label>
                                    <select required value={formData.room_id} onChange={e => setFormData({ ...formData, room_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="">Choose Room (Vacant only)</option>
                                        {rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number} - ₹{r.rent_amount}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Monthly Rent (₹)</label>
                                    <input type="number" required value={formData.monthly_rent} onChange={e => setFormData({ ...formData, monthly_rent: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Security Deposit (₹)</label>
                                    <input type="number" value={formData.deposit_amount} onChange={e => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Move-in Date</label>
                                    <input type="date" required value={formData.move_in_date} onChange={e => setFormData({ ...formData, move_in_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Move-out Date (Optional)</label>
                                    <input type="date" value={formData.move_out_date} onChange={e => setFormData({ ...formData, move_out_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-teal-500/20">
                                        {editingTenant ? 'Update Tenant' : 'Save Tenant'}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="flex items-center space-x-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, phone or room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-all text-sm text-white"
                        />
                    </div>
                </div>

                {filteredTenants.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                        <UsersIcon className="mx-auto text-slate-700 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-400">No tenants found</h3>
                        <p className="text-slate-500 mt-2">Add your first tenant to start tracking rent.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTenants.map((tenant) => (
                            <Card key={tenant.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm group hover:border-teal-500/50 transition-all overflow-hidden shadow-xl relative">
                                <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingTenant(tenant); setFormData({ ...tenant }); setShowForm(true); }} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Pencil size={14} /></button>
                                    <button onClick={() => handleDelete(tenant.id, tenant.room_id)} className="p-1.5 bg-slate-800 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                                </div>
                                <CardHeader className="pb-3 flex flex-row items-center space-x-3 px-4 pt-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-teal-500 font-bold text-sm border border-slate-700 uppercase">
                                        {tenant.name?.substring(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base font-bold text-white leading-tight truncate">{tenant.name}</CardTitle>
                                        <div className="flex items-center text-[10px] text-slate-500 mt-1">
                                            <Home size={10} className="mr-1" />
                                            <span>Rm {tenant.rooms?.room_number} • {tenant.rooms?.properties?.name}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3 border-t border-slate-800/10 px-4 pb-4">
                                    <div className="grid grid-cols-2 gap-y-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 flex items-center uppercase font-bold tracking-wider">
                                                <Phone size={10} className="mr-1" /> Phone
                                            </p>
                                            <p className="text-xs text-slate-300 font-medium">{tenant.phone}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Rent</p>
                                            <p className="text-xs text-teal-400 font-bold">₹{Number(tenant.monthly_rent).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 flex items-center uppercase font-bold tracking-wider">
                                                <Calendar size={10} className="mr-1" /> Since
                                            </p>
                                            <p className="text-xs text-slate-300 font-medium">
                                                {new Date(tenant.move_in_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status</p>
                                            <p className="text-[10px] text-teal-500 font-bold uppercase tracking-tight">Active</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => window.location.href = `/payments?tenantId=${tenant.id}`}
                                        className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-all border border-slate-700"
                                    >
                                        View Payments
                                    </button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}
