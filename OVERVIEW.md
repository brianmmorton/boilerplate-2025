# ScoutSense - Product Intelligence Platform

## What is ScoutSense?

ScoutSense is an AI-powered product intelligence platform that automatically monitors the internet to discover customer pain points and generate actionable product insights. It scours social media platforms, forums, and online discussions to help businesses understand their customers' real-world problems and identify opportunities for product improvements.

## Core Value Proposition

**"Example is a boilerplate app"**

## How It Works

### 1. TBD

## Key Features

### TBD

- TBD

## Architecture

### Frontend (React/TypeScript)

- **Location**: `apps/web/`
- Modern React application with TypeScript
- Zustand for state management
- Tailwind CSS and shadcn/ui components
- Real-time updates via Socket.IO

### Backend API (Node.js/Express)

- **Location**: `apps/api/`
- RESTful API built with Express.js
- PostgreSQL database with Prisma ORM
- Redis for caching and job queues
- Socket.IO for real-time communication

### AI Workers (LangChain)

- **Location**: `apps/api/src/workers/product-research/`
- Autonomous AI agents using LangChain
- Google Gemini for language processing
- Tavily for web search capabilities
- Background job processing with Bull queues

### Marketing Site (Next.js)

- **Location**: `apps/marketing/`
- Static marketing website
- Modern animations with Framer Motion
- Responsive design and SEO optimization

## Data Models

### Core Entities

- **Users**: Users using the platform

## Technology Stack

### Frontend

- React 19 with TypeScript
- Zustand for state management
- Tailwind CSS + shadcn/ui
- React Router for navigation
- Socket.IO client for real-time updates

### Backend

- Node.js with Express
- PostgreSQL with Prisma ORM
- Redis for caching and queues
- Socket.IO for real-time communication
- Bull queues for background jobs

### AI & Machine Learning

- LangChain for AI orchestration
- Google Gemini 2.5 Flash for language processing
- Tavily for intelligent web search
- Structured output parsing

### Infrastructure

- Fly.io for deployment
- Vercel for frontend hosting
- PostgreSQL managed database
- Redis Cloud for caching

## Security & Privacy

- OAuth-based authentication
- Role-based access control
- Data encryption in transit and at rest
- GDPR compliance considerations
- Rate limiting and abuse prevention
