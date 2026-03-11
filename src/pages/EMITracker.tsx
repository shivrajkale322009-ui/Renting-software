import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CreditCard, TrendingUp, IndianRupee, ArrowUpCircle, ArrowDownCircle, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export default function EMITracker() {
    const { user } = useAuth()
    const [properties, setProperties] = useState<any[]>([])
    const [totalRent, setTotalRent] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchEMIData() {
            if (!user) return

            try {
                setLoading(true)

                // 1. Fetch properties for this owner with loan info
                const { data: props, error: pError } = await supabase
                    .from('properties')
                    .select('id, name, loan_amount, emi_amount')
                    .eq('owner_id', user.id)
                    .gt('loan_amount', 0)
                
                if (pError) throw pError

                // 2. Fetch total monthly rent for all tenants belonging to this owner
                const { data: propertiesList } = await supabase
                    .from('properties')
                    .select('id')
                    .eq('owner_id', user.id)
                
                const propIds = propertiesList?.map(p => p.id) || []
                
                let rentSum = 0
                if (propIds.length > 0) {
                    const { data: tenants, error: tError } = await supabase
                        .from('tenants')
                        .select('monthly_rent, rooms!inner(property_id)')
                        .in('rooms.property_id', propIds)
                    
                    if (tError) throw tError
                    rentSum = tenants?.reduce((sum, t) => sum + Number(t.monthly_rent), 0) || 0
                }

                setProperties(props || [])
                setTotalRent(rentSum)

            } catch (err: any) {
                console.error('EMI fetch failed:', err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchEMIData()
    }, [user])

    const totalEMI = properties.reduce((sum, p) => sum + Number(p.emi_amount), 0)
    const totalLoan = properties.reduce((sum, p) => sum + Number(p.loan_amount), 0)
    const netProfit = totalRent - totalEMI
    const isProfit = netProfit >= 0

    if (loading) return <Layout><LoadingSpinner /></Layout>

    return (
        <Layout>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto text-white">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financial Health</h1>
                    <p className="text-sm md:text-base text-slate-400">Projected rent vs loan obligations.</p>
                </div>

                {/* Master Summary Card */}
                <Card className={`relative overflow-hidden border-2 transition-all duration-500 ${isProfit
                        ? 'border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_30px_-12px_rgba(16,185,129,0.3)]'
                        : 'border-red-500/20 bg-red-500/5 shadow-[0_0_30px_-12px_rgba(239,68,68,0.3)]'
                    }`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Monthly Profit/Loss Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                            <ArrowUpCircle size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">Total Rent Income</span>
                                    </div>
                                    <span className="text-lg font-bold">₹{totalRent.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                            <ArrowDownCircle size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">Total Loan EMIs</span>
                                    </div>
                                    <span className="text-lg font-bold">-₹{totalEMI.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-2 py-4 md:border-l border-slate-700/50">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Net Monthly Surplus</p>
                                <div className={`text-4xl md:text-5xl font-black flex items-center space-x-2 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                    <span>{isProfit ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString()}</span>
                                    {isProfit ? <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" /> : <XCircle className="w-8 h-8 md:w-10 md:h-10" />}
                                </div>
                                <p className={`text-[10px] md:text-xs font-medium px-3 py-1 rounded-full uppercase tracking-widest ${isProfit ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                    }`}>
                                    {isProfit ? 'Operationally Green' : 'Action Required: Cash Flow Negative'}
                                </p>
                            </div>
                        </div>
                    </CardContent>

                    {/* Decorative Background Icon */}
                    <div className="absolute top-1/2 -right-8 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                        <IndianRupee size={240} />
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Cumulative EMI</CardTitle>
                            <CreditCard className="w-4 h-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalEMI.toLocaleString()}</div>
                            <p className="text-[10px] text-slate-500 mt-1">Paid on specific due dates</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">Principal Amount</CardTitle>
                            <TrendingUp className="w-4 h-4 text-teal-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalLoan.toLocaleString()}</div>
                            <p className="text-[10px] text-slate-500 mt-1">Total outstanding debt</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col space-y-4">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>Property-wise Breakdown</span>
                        <div className="h-px flex-1 bg-slate-800 ml-4"></div>
                    </h2>
                    {properties.length === 0 ? (
                        <p className="text-slate-500 text-sm italic">No active loans found across your properties.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {properties.map((property) => (
                                <Card key={property.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-bold">{property.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-slate-800/50 pb-4">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Monthly EMI</p>
                                                <p className="text-2xl font-bold text-orange-500">₹{Number(property.emi_amount).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 font-bold">Outstanding</p>
                                                <p className="text-sm font-medium">₹{Number(property.loan_amount).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 italic">EMI due on 5th of every month</span>
                                            <button className="text-orange-500 font-bold hover:underline">View Schedule</button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
