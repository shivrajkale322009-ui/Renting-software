import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Building2, Plus, Pencil, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export default function Properties() {
    const { user } = useAuth()
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProperty, setEditingProperty] = useState<any>(null)
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        type: 'residential',
        total_rooms: 0,
        loan_amount: 0,
        emi_amount: 0
    })

    const fetchProperties = async () => {
        if (!user) return
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            setProperties(data || [])
        } catch (err: any) {
            console.error('Error fetching properties:', err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProperties()
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        try {
            if (editingProperty) {
                const { error } = await supabase
                    .from('properties')
                    .update({ ...formData })
                    .eq('id', editingProperty.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('properties')
                    .insert([{ ...formData, owner_id: user.id }])
                if (error) throw error
            }

            setShowForm(false)
            setEditingProperty(null)
            setFormData({ name: '', address: '', type: 'residential', total_rooms: 0, loan_amount: 0, emi_amount: 0 })
            fetchProperties()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleEdit = (property: any) => {
        setEditingProperty(property)
        setFormData({
            name: property.name,
            address: property.address,
            type: property.type,
            total_rooms: property.total_rooms,
            loan_amount: property.loan_amount,
            emi_amount: property.emi_amount
        })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property? This will delete all rooms and tenants associated with it.')) return
        try {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id)
            if (error) throw error
            fetchProperties()
        } catch (err: any) {
            alert(err.message)
        }
    }

    if (loading && properties.length === 0) return <Layout><LoadingSpinner /></Layout>

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto text-white">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Properties</h1>
                        <p className="text-sm md:text-base text-slate-400">Manage your buildings and real estate.</p>
                    </div>
                    <button 
                        onClick={() => { setShowForm(true); setEditingProperty(null); setFormData({ name: '', address: '', type: 'residential', total_rooms: 0, loan_amount: 0, emi_amount: 0 }) }}
                        className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors font-medium text-xs md:text-sm shadow-xl shadow-orange-500/20"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Property</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>

                {showForm && (
                    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{editingProperty ? 'Edit Property' : 'Add New Property'}</CardTitle>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                                <X size={20} />
                            </button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Property Name</label>
                                    <input 
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                                        placeholder="E.g. Sunshine Apartments"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                                    <select 
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                                    >
                                        <option value="residential">Residential</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="mixed">Mixed</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address</label>
                                    <input 
                                        required
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                                        placeholder="Full address of the property"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Rooms</label>
                                    <input 
                                        type="number"
                                        value={formData.total_rooms}
                                        onChange={e => setFormData({ ...formData, total_rooms: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">EMI Amount (₹)</label>
                                    <input 
                                        type="number"
                                        value={formData.emi_amount}
                                        onChange={e => setFormData({ ...formData, emi_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-orange-500/20">
                                        {editingProperty ? 'Update Property' : 'Save Property'}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {properties.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                        <Building2 className="mx-auto text-slate-700 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-400">No properties yet</h3>
                        <p className="text-slate-500 mt-2">Add your first property to start managing.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {properties.map((property) => (
                            <Card key={property.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm group hover:border-orange-500/50 transition-all overflow-hidden shadow-xl">
                                <CardHeader className="pb-2 px-6">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-slate-800 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                            <Building2 size={20} />
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEdit(property)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(property.id)} className="p-1.5 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400">
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase ml-2">
                                                {property.type}
                                            </span>
                                        </div>
                                    </div>
                                    <CardTitle className="mt-4 text-lg md:text-xl font-bold text-white">{property.name}</CardTitle>
                                    <p className="text-xs md:text-sm text-slate-500 truncate">{property.address}</p>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 pt-3 border-t border-slate-800/10">
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Units</p>
                                            <p className="text-sm font-semibold text-white">{property.total_rooms}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Loan EMI</p>
                                            <p className="text-sm font-semibold text-white text-orange-400">₹{property.emi_amount?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => window.location.href = `/rooms?propertyId=${property.id}`}
                                        className="w-full mt-4 py-2 text-xs font-bold text-orange-500 bg-orange-500/5 border border-orange-500/10 rounded-lg hover:bg-orange-500 hover:text-white transition-all">
                                        Manage Rooms
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
