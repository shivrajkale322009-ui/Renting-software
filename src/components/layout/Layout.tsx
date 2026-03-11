import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Building2, Users, Wallet, CreditCard, Bell, FileText, Settings, LogOut, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Building2, label: 'Properties', path: '/properties' },
    { icon: Users, label: 'Tenants', path: '/tenants' },
    { icon: Wallet, label: 'Payments', path: '/payments' },
  ]

  const moreItems = [
    { icon: CreditCard, label: 'EMI Tracker', path: '/emi' },
    { icon: Bell, label: 'Reminders', path: '/reminders' },
    { icon: FileText, label: 'Agreements', path: '/agreements' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="flex min-h-screen bg-[#07090F] text-white font-sans overflow-x-hidden">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 border-r border-slate-800 bg-[#090C14] flex-col fixed h-full z-20">
        <div className="p-6">
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white italic shadow-lg shadow-orange-500/20">R</div>
            <span className="text-xl font-bold tracking-tight">Renoto</span>
          </NavLink>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
              `}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">More Tools</div>
          {moreItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
              `}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Component */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#090C14] border-t border-slate-800 flex justify-around items-center px-1 pb-safe z-50 h-16 shadow-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full space-y-1
              ${isActive ? 'text-orange-500' : 'text-slate-500'}
            `}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${showMoreMenu ? 'text-orange-500' : 'text-slate-500'}`}
        >
          <MoreHorizontal size={22} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Mobile "More" Menu Overlay */}
      {showMoreMenu && (
        <div
          className="md:hidden fixed inset-0 bg-[#07090F]/80 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="absolute bottom-20 left-4 right-4 bg-[#111622] border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-5"
            onClick={(e) => e.stopPropagation()}
          >
            {moreItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setShowMoreMenu(false)}
                className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800"
              >
                <item.icon size={20} className="text-orange-500" />
                <span className="text-xs font-medium text-slate-300">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mb-20 md:mb-0 transition-all duration-300 overflow-x-hidden">
        {/* Responsive Header */}
        <header className="h-16 border-b border-slate-800 bg-[#07090F]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
          {/* Mobile App Bar */}
          <div className="flex items-center space-x-3 md:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white italic">R</div>
            <span className="text-lg font-bold tracking-tight text-white capitalize">KiraaBook</span>
          </div>

          {/* Desktop App Bar Content (Hidden on Mobile) */}
          <div className="hidden md:block text-sm text-slate-400">
            Welcome back, <span className="text-white font-medium">{user?.email?.split('@')[0] || 'Landlord'}</span>
          </div>

          {/* Global Header Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-white">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#07090F]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-teal-500 p-[1px] shadow-lg shadow-orange-500/10">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.email?.substring(0, 2) || 'JD'
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="min-h-[calc(100vh-64px)] w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
