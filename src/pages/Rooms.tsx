import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Building2, Plus, Pencil, Trash2, X, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useSearchParams } from 'react-router-dom'

export default function Rooms() {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const urlPropertyId = searchParams.get('propertyId')

    const [rooms, setRooms] = useState<any[]>([])
    const [properties, setProperties] = useState<any[]>([])
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(urlPropertyId || '')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingRoom, setEditingRoom] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        room_number: '',
        floor: 1,
        type: 'bedroom',
        rent_amount: 0,
        status: 'vacant'
    })

    const fetchProperties = async () => {
        if (!user) return
        const { data } = await supabase.from('properties').select('*').eq('owner_id', user.id)
        setProperties(data || [])
        if (!selectedPropertyId && data && data.length > 0) {
            setSelectedPropertyId(data[0].id)
        }
    }

    const fetchRooms = async () => {
        if (!selectedPropertyId) return
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('property_id', selectedPropertyId)
                .order('room_number', { ascending: true })
            if (error) throw error
            setRooms(data || [])
        } catch (err: any) {
            console.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProperties()
    }, [user])

    useEffect(() => {
        if (selectedPropertyId) fetchRooms()
    }, [selectedPropertyId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPropertyId) return

        try {
            if (editingRoom) {
                const { error } = await supabase
                    .from('rooms')
                    .update({ ...formData })
                    .eq('id', editingRoom.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('rooms')
                    .insert([{ ...formData, property_id: selectedPropertyId }])
                if (error) throw error
            }

            setShowForm(false)
            setEditingRoom(null)
            setFormData({ room_number: '', floor: 1, type: 'bedroom', rent_amount: 0, status: 'vacant' })
            fetchRooms()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this room?')) return
        try {
            const { error } = await supabase.from('rooms').delete().eq('id', id)
            if (error) throw error
            fetchRooms()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const filteredRooms = rooms.filter(r => r.room_number.toLowerCase().includes(searchTerm.toLowerCase()))

    if (loading && rooms.length === 0 && selectedPropertyId) return <Layout><LoadingSpinner /></Layout>

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Room Management</h1>
                        <p className="text-sm md:text-base text-slate-400">Configure units for your properties.</p>
                    </div>
                    <div className="flex gap-2">
                        <select 
                            value={selectedPropertyId}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500/50"
                        >
                            <option value="">Select Property</option>
                            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button 
                            disabled={!selectedPropertyId}
                            onClick={() => { setShowForm(true); setEditingRoom(null); setFormData({ room_number: '', floor: 1, type: 'bedroom', rent_amount: 0, status: 'vacant' }) }}
                            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors font-medium text-xs md:text-sm shadow-xl shadow-orange-500/20"
                        >
                            <Plus size={18} />
                            <span>Add Room</span>
                        </button>
                    </div>
                </div>

                {showForm && (
                    <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</CardTitle>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Room/Unit No.</label>
                                    <input required value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" placeholder="101" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Floor</label>
                                    <input type="number" required value={formData.floor} onChange={e => setFormData({...formData, floor: parseInt(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="bedroom">Bedroom</option>
                                        <option value="hall">Hall</option>
                                        <option value="kitchen">Kitchen</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Rent Amount (₹)</label>
                                    <input type="number" required value={formData.rent_amount} onChange={e => setFormData({...formData, rent_amount: parseFloat(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="vacant">Vacant</option>
                                        <option value="occupied">Occupied</option>
                                        <option value="notice_period">Notice Period</option>
                                    </select>
                                </div>
                                <div className="md:col-span-3 pt-4">
                                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-orange-500/20">
                                        {editingRoom ? 'Update Room' : 'Save Room'}
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
                        placeholder="Filter by room number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-orange-500/50 focus:outline-none transition-all text-sm text-white"
                    />
                </div>

                {!selectedPropertyId ? (
                    <div className="text-center py-20 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-3xl">
                        <Building2 className="mx-auto text-slate-700 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-400">Select a property first</h3>
                        <p className="text-slate-500 mt-2">Select a property from the dropdown to manage its rooms.</p>
                    </div>
                ) : filteredRooms.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                        <Plus className="mx-auto text-slate-700 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-400">No rooms found</h3>
                        <p className="text-slate-500 mt-2">Add your first room to this property.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredRooms.map((room) => (
                            <Card key={room.id} className="bg-slate-900/50 border-slate-800 overflow-hidden group hover:border-orange-500/30 transition-all">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Room {room.room_number}</h3>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{room.type} • Floor {room.floor}</p>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            room.status === 'vacant' ? 'bg-teal-500/10 text-teal-400' :
                                            room.status === 'occupied' ? 'bg-orange-500/10 text-orange-400' :
                                            'bg-yellow-500/10 text-yellow-400'
                                        }`}>
                                            {room.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Monthly Rent</p>
                                            <p className="text-lg font-bold text-white">₹{Number(room.rent_amount).toLocaleString()}</p>
                                        </div>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingRoom(room); setFormData({ room_number: room.room_number, floor: room.floor, type: room.type, rent_amount: room.rent_amount, status: room.status }); setShowForm(true); }} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Pencil size={14} /></button>
                                            <button onClick={() => handleDelete(room.id)} className="p-1.5 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                                        </div>
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
