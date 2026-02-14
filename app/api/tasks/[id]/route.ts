import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Only allow safe fields to be updated
    const allowedFields: Record<string, unknown> = {}
    if (body.title !== undefined) allowedFields.title = body.title
    if (body.description !== undefined) allowedFields.description = body.description
    if (body.owner !== undefined) allowedFields.owner = body.owner
    if (body.dueDate !== undefined) allowedFields.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body.duration !== undefined) allowedFields.duration = body.duration
    if (body.status !== undefined) allowedFields.status = body.status

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...allowedFields,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
