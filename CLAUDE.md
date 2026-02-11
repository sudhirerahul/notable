# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Notable** - an AI Meeting-to-Task Scheduler that extracts actionable tasks from meeting transcripts using LLMs and automatically schedules them on users' calendars.

**Current Status**: Planning phase. No code implementation yet.
- **Specifications**: [prd.txt](prd.txt) - Detailed technical specifications and API definitions
- **Design**: [design_doc.txt](design_doc.txt) - UI/UX flow with "Comet" dark theme aesthetic
- **Tasks**: notable_todo.xlsx - Project roadmap and milestones

## Architecture (Planned)

### Microservices Design
- **API Gateway**: REST/GraphQL endpoint for all client requests
- **Ingestion Service**: Handles transcript uploads and webhooks
- **Extraction Service**: LLM-based task parsing with confidence scoring
- **Scheduler Service**: Time slot allocation respecting deadlines and availability
- **Integration Adapters**: Calendar (Google), Slack, Notion, Linear, Asana
- **Database**: PostgreSQL for users, tasks, transcripts, and metadata
- **Message Queue**: RabbitMQ/SQS/Redis for async job processing
- **Worker Processes**: Handle LLM calls and scheduling calculations

### Data Flow
```
User → API → Queue → LLM Worker (extract tasks) → DB → Scheduler → Calendar API → DB → User
```

## Critical Implementation Priorities

When beginning implementation, focus on these core components in order:

1. **LLM Extraction Pipeline** (highest complexity)
   - Prompt engineering for structured JSON output
   - Token log-probability confidence scoring
   - Chunking logic for long transcripts (>2000 tokens with 200-token overlap)
   - Name entity recognition to map names to user identities

2. **Scheduling Algorithm**
   - Earliest-deadline-first greedy slot filling
   - Free/busy calendar querying via Google Calendar API
   - Conflict resolution and task splitting logic

3. **Integration Layer**
   - Google Calendar OAuth 2.0 (scope: `calendar.events`)
   - Slack Block Kit for rich task notifications

4. **Time Zone Handling** (critical for correctness)
   - **ALL timestamps stored in UTC internally**
   - Convert to local time only for display
   - Use IANA tz database for DST handling

## Technical Stack (Planned)

### Backend
- **Primary**: Python with FastAPI (recommended for LLM/NLP work)
  - OpenAI GPT-4 integration
  - Celery workers with Redis/RabbitMQ
  - spaCy for name entity recognition
  - dateparser for natural language date parsing
- **Alternative**: Node.js/TypeScript with NestJS

### Frontend
- React with TypeScript
- UI Framework: Material-UI or Ant Design
- Consider Next.js for SSR if needed

### Database & Storage
- PostgreSQL (primary data store)
- S3 or similar for media files (audio/video transcripts)
- Redis for queue/cache

### Integrations
- Google Calendar API (OAuth 2.0, calendar scope)
- Slack API (webhooks, Block Kit for rich messages)
- Notion API (optional task management)
- Linear GraphQL API (optional)
- Asana REST API (optional)

### Hosting (Suggested)
- Frontend: Vercel or Netlify
- Backend: Render.com, Fly.io, or AWS
- Database: Heroku Postgres, Supabase, or AWS RDS

## Key Implementation Details

### LLM Extraction
- **Prompt Strategy**: System prompt instructs GPT-4 to output structured JSON with {title, owner, due_date, description}
- **Chunking**: Split long transcripts (>2000 tokens) by speaker turns or paragraphs with overlap
- **Confidence Scoring**: Use token log-probabilities to generate per-task confidence scores (0-1)
- **Postprocessing Pipeline**:
  1. JSON parsing & validation
  2. Name mapping to user identities
  3. Natural language date parsing to timestamps (UTC internally)
  4. Confidence calculation and thresholding
  5. Deduplication and filtering

### Scheduling Algorithm
- Sort tasks by earliest-deadline-first
- Query calendar free/busy via Google Calendar API
- Greedy slot filling: assign each task to earliest free slot before deadline
- Handle conflicts: split tasks into subtasks or flag for manual resolution
- Respect working hours and time zones (store UTC, display local)

### Confidence Thresholds (UI)
- **High**: ≥85% (green badge) - auto-accept
- **Medium**: 60-84% (yellow badge) - review recommended
- **Low**: <60% (red badge) - edit required

### API Endpoints (Planned)
- `POST /api/transcripts` - Submit transcript (returns 202 with job ID)
- `GET /api/transcripts/{id}/tasks` - Retrieve extracted tasks
- `PATCH /api/tasks/{id}` - Update task details
- `POST /api/schedule` - Trigger scheduling for task IDs
- GraphQL alternative with flexible queries

## Development Workflow (When Implemented)

### Setup & Running
**Backend (Python/FastAPI recommended)**:
```bash
pip install -r requirements.txt
uvicorn main:app --reload              # Start dev server
pytest                                  # Run tests
pytest tests/test_extraction.py -v     # Run specific test file
```

**Frontend (React/TypeScript)**:
```bash
npm install
npm run dev                             # Start dev server
npm test                                # Run tests
npm run build                           # Production build
```

**Full Stack**:
```bash
docker-compose up                       # Start all services (API, workers, DB, queue)
```

### Security Considerations
- OAuth 2.0 for all third-party integrations
- Minimal scopes (e.g., only calendar.events for Google)
- API authentication via Bearer tokens
- Input validation to prevent injection attacks
- Never store tokens in code or commits

## Analytics & Monitoring (Planned)

Track with PostHog/Mixpanel/Amplitude:
- `transcript_uploaded` - word count, source
- `tasks_extracted` - count, extraction time, confidence distribution
- `task_reviewed` - edit/delete actions
- `tasks_scheduled` - success rate
- `integration_clicked` - service type, outcome

System metrics (Prometheus/Sentry):
- LLM call latency and error rates
- Scheduler conflicts and success rate
- Queue depth and worker utilization
