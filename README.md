# Notable - AI Meeting-to-Task Scheduler

Transform meeting transcripts into actionable, scheduled tasks with the power of AI.

## Features

- **AI-Powered Extraction**: GPT-4 automatically extracts tasks from meeting transcripts
- **Confidence Scoring**: Each task comes with a confidence score so you know which ones to review
- **Smart Scheduling**: Automatically schedules tasks in your Google Calendar based on deadlines and availability
- **Slack Integration**: Get notified when tasks are scheduled
- **Dark Theme UI**: Beautiful, minimalist "Comet" design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud Console project (for OAuth and Calendar API)
- OpenAI API key

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth & Calendar
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="sk-..."
```

### Installation

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Sign in** with your Google account
2. **Upload** a meeting transcript
3. **Review** the extracted tasks with confidence scores
4. **Edit** any tasks as needed
5. **Schedule** tasks to your Google Calendar
6. **Get notified** via Slack (optional)

## Deployment

This application is optimized for deployment on Vercel:

```bash
# Deploy to Vercel
vercel
```

Make sure to configure all environment variables in your Vercel project settings.

## License

MIT

## Built with Claude Code

This project was built with assistance from [Claude Code](https://claude.com/claude-code).
