import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Upload, Settings, Sparkles, LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session;
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Error getting session in layout:', error)
    redirect('/signin')
  }

  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
          <Sparkles className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold text-white">Notable</span>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-900 hover:text-white rounded-lg transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-900 hover:text-white rounded-lg transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Transcript</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-900 hover:text-white rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-semibold">
                {session.user?.name?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 px-4 py-2 mt-2 text-gray-400 hover:text-red-400 hover:bg-gray-900 rounded-lg transition-colors text-sm w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
