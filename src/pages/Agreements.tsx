import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { FileText, Download, Eye, Plus, X, Pencil, Trash2, Calendar, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export default function Agreements() {
    const { user } = useAuth()
    const [agreements, setAgreements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingAgreement, setEditingAgreement] = useState<any>(null)

    // Form states
    const [tenants, setTenants] = useState<any[]>([])
    const [formData, setFormData] = useState({
        tenant_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        signed: false,
        document_url: ''
    })

    const fetchAgreements = async () => {
        if (!user) return
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('agreements')
                .select('*, tenants!inner(name, rooms!inner(properties!inner(owner_id)))')
                .eq('tenants.rooms.properties.owner_id', user.id)
                .order('end_date', { ascending: true })
            
            if (error) throw error
            setAgreements(data || [])
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
            .select('id, name, rooms!inner(properties!inner(owner_id))')
            .eq('rooms.properties.owner_id', user.id)
        setTenants(data || [])
    }

    useEffect(() => {
        fetchAgreements()
        fetchTenants()
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingAgreement) {
                const { error } = await supabase.from('agreements').update({ ...formData }).eq('id', editingAgreement.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('agreements').insert([formData])
                if (error) throw error
            }
            setShowForm(false)
            setEditingAgreement(null)
            fetchAgreements()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this agreement record?')) return
        try {
            const { error } = await supabase.from('agreements').delete().eq('id', id)
            if (error) throw error
            fetchAgreements()
        } catch (err: any) {
            alert(err.message)
        }
    }

    if (loading && agreements.length === 0) return <Layout><LoadingSpinner /></Layout>

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto text-white">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agreements</h1>
                        <p className="text-sm md:text-base text-slate-400">Digital lease documents & tracking.</p>
                    </div>
                    <button 
                        onClick={() => { setShowForm(true); setEditingAgreement(null); setFormData({ tenant_id: '', start_date: new Date().toISOString().split('T')[0], end_date: '', signed: false, document_url: '' }) }}
                        className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors font-medium text-xs md:text-sm shadow-xl shadow-orange-500/20"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">New Agreement</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>

                {showForm && (
                    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{editingAgreement ? 'Edit Agreement' : 'Create New Agreement'}</CardTitle>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tenant</label>
                                    <select required value={formData.tenant_id} onChange={e => setFormData({ ...formData, tenant_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="">Select Tenant</option>
                                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                    <div className="flex items-center space-x-4 h-[50px]">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.signed} onChange={e => setFormData({ ...formData, signed: e.target.checked })} className="w-4 h-4 accent-orange-500" />
                                            <span className="text-sm text-slate-300">Signed & Active</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                                    <input type="date" required value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                                    <input type="date" required value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="md:col-span-2 pt-4">
                                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-orange-500/20">
                                        {editingAgreement ? 'Update Record' : 'Save Agreement Record'}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {agreements.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                        <FileText className="mx-auto text-slate-700 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-400">No agreements tracked</h3>
                        <p className="text-slate-500 mt-2">Start keeping digital logs of your lease agreements.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agreements.map((agreement) => {
                            const isExpiringSoon = new Date(agreement.end_date).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000
                            const isExpired = new Date(agreement.end_date).getTime() < new Date().getTime()
                            
                            return (
                                <Card key={agreement.id} className={`bg-slate-900/50 border-slate-800 group hover:border-orange-500/30 transition-all overflow-hidden ${isExpiringSoon ? 'border-red-500/20' : ''}`}>
                                    <CardHeader className="pb-3 border-b border-slate-800/10">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-slate-800 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex space-x-1">
                                                <button onClick={() => { setEditingAgreement(agreement); setFormData({ ...agreement }); setShowForm(true); }} className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white"><Pencil size={12} /></button>
                                                <button onClick={() => handleDelete(agreement.id)} className="p-1.5 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                        <CardTitle className="mt-4 text-xl font-bold">{agreement.tenants?.name}</CardTitle>
                                        <p className="text-xs text-slate-500 truncate">Rm {agreement.tenants?.rooms?.room_number} • {agreement.tenants?.rooms?.properties?.name}</p>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Expiry</p>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar size={12} className={isExpiringSoon ? 'text-red-400' : 'text-slate-400'} />
                                                    <p className={`text-sm font-medium ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-orange-400 font-bold' : 'text-white'}`}>
                                                        {new Date(agreement.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest inline-block ${agreement.signed ? 'bg-teal-500/10 text-teal-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                    {agreement.signed ? 'Signed' : 'Draft'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {isExpiringSoon && !isExpired && (
                                            <div className="flex items-center space-x-2 p-2 bg-orange-500/5 border border-orange-500/10 rounded-lg text-orange-500">
                                                <AlertCircle size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Renewal required soon</span>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 pt-2">
                                            <button className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700">
                                                <Eye size={14} />
                                                <span>View Details</span>
                                            </button>
                                            <button className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl transition-all border border-slate-700">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </Layout>
    )
}
