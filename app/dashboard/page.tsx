import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FileText, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default async function DashboardPage() {
  let session;
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Error getting session:', error)
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Unable to load session. Please try signing in again.</p>
        <a href="/signin" className="text-emerald-400 hover:text-emerald-300">Sign In</a>
      </div>
    )
  }

  if (!session?.user?.email) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Please sign in to continue.</p>
        <a href="/signin" className="text-emerald-400 hover:text-emerald-300">Sign In</a>
      </div>
    )
  }

  let user;
  let transcripts: any[] = [];
  let tasks: any[] = [];
  let scheduledTasks = 0;

  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Setting up your account... Please refresh in a moment.</p>
          <a href="/dashboard" className="text-emerald-400 hover:text-emerald-300">Refresh</a>
        </div>
      )
    }

    transcripts = await prisma.transcript.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    })

    tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: { in: ['pending', 'accepted'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    })

    scheduledTasks = await prisma.task.count({
      where: {
        userId: user.id,
        status: 'scheduled',
      },
    })
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Unable to load dashboard data. Please try again.</p>
        <a href="/dashboard" className="text-emerald-400 hover:text-emerald-300">Refresh</a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {session.user.name || 'there'}!
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Transcript
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-white">{transcripts.length}</div>
          <div className="text-gray-400 mt-1">Transcripts</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-cyan-400">
            {transcripts.reduce((acc, t) => acc + t._count.tasks, 0)}
          </div>
          <div className="text-gray-400 mt-1">Tasks Extracted</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-amber-400">{tasks.length}</div>
          <div className="text-gray-400 mt-1">Pending Tasks</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-3xl font-bold text-emerald-400">{scheduledTasks}</div>
          <div className="text-gray-400 mt-1">Scheduled</div>
        </div>
      </div>

      {/* Recent Transcripts */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Transcripts
        </h2>
        {transcripts.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No transcripts yet</p>
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upload Your First Transcript
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {transcripts.map((transcript) => (
              <Link
                key={transcript.id}
                href={`/dashboard/transcripts/${transcript.id}`}
                className="block bg-gray-900 border border-gray-800 hover:border-emerald-500/30 rounded-lg p-4 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">
                      {transcript.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>{transcript._count.tasks} tasks</span>
                      <span>•</span>
                      <span>{format(new Date(transcript.createdAt), 'PPP')}</span>
                      <span>•</span>
                      <span
                        className={
                          transcript.status === 'completed'
                            ? 'text-emerald-400'
                            : transcript.status === 'failed'
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }
                      >
                        {transcript.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
