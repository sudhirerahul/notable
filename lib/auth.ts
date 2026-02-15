import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      try {
      if (session?.user) {
        session.user.id = user.id

        // Ensure user has settings
        const settings = await prisma.userSettings.findUnique({
          where: { userId: user.id }
        })

        if (!settings) {
          await prisma.userSettings.create({
            data: {
              userId: user.id,
              timeZone: 'America/New_York',
              workingHoursStart: 9,
              workingHoursEnd: 17,
            }
          })
        }

        // Check if Google token needs refresh
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'google',
          }
        })

        if (account && account.expires_at) {
          const expiresAt = account.expires_at * 1000 // Convert to milliseconds
          const now = Date.now()

          // Refresh if token expires in less than 5 minutes
          if (expiresAt < now + 5 * 60 * 1000 && account.refresh_token) {
            try {
              const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                  client_id: process.env.GOOGLE_CLIENT_ID || '',
                  client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                  grant_type: 'refresh_token',
                  refresh_token: account.refresh_token,
                }),
              })

              const tokens = await response.json()

              if (response.ok) {
                await prisma.account.update({
                  where: { id: account.id },
                  data: {
                    access_token: tokens.access_token,
                    expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
                    refresh_token: tokens.refresh_token ?? account.refresh_token,
                  },
                })
              }
            } catch (error) {
              console.error('Error refreshing access token', error)
            }
          }
        }
      }
      } catch (error) {
        console.error('Error in session callback:', error)
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
