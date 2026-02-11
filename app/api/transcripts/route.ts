import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { extractTasks } from '@/lib/llm/extractor'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create transcript
    const transcript = await prisma.transcript.create({
      data: {
        userId: user.id,
        title,
        content,
        wordCount: content.split(/\s+/).length,
        source: 'paste',
        status: 'processing',
      },
    })

    // Extract tasks asynchronously (in production, this should be a background job)
    try {
      const extractedTasks = await extractTasks(content)

      // Save tasks to database
      await prisma.task.createMany({
        data: extractedTasks.map((task) => ({
          transcriptId: transcript.id,
          userId: user.id,
          title: task.title,
          description: task.description,
          owner: task.owner,
          dueDate: task.dueDate,
          confidence: task.confidence,
          status: 'pending',
        })),
      })

      // Update transcript status
      await prisma.transcript.update({
        where: { id: transcript.id },
        data: { status: 'completed' },
      })
    } catch (error) {
      console.error('Error extracting tasks:', error)
      await prisma.transcript.update({
        where: { id: transcript.id },
        data: { status: 'failed' },
      })
    }

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Error creating transcript:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const transcripts = await prisma.transcript.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    })

    return NextResponse.json({ transcripts })
  } catch (error) {
    console.error('Error fetching transcripts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
