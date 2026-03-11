import { Loader2 } from 'lucide-react'

export const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center w-full h-64">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
    )
}

export const PageLoading = () => {
    return (
        <div className="fixed inset-0 bg-[#07090F]/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Loading KiraaBook...</p>
            </div>
        </div>
    )
}
