# VideoSync - AI-Powered Video Style Transfer Application

## Overview

VideoSync is a full-stack web application that enables users to apply AI-powered style transfer to their videos. Users can upload their own video and either select a predefined style template or upload a reference video from their favorite influencer. The application automatically analyzes the reference content and applies stylistic elements like color grading, pacing, and audio enhancements to transform the user's video to match the desired aesthetic.

The application provides a modern, responsive interface built with React and a robust backend processing pipeline using Express.js with Python-based video processing capabilities. It's designed to handle the complete workflow from video upload to processed output delivery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using **React 18** with TypeScript, providing a modern single-page application experience. The UI is constructed using **shadcn/ui** components built on top of **Radix UI** primitives, ensuring accessibility and consistent design patterns. **TailwindCSS** handles all styling with a custom design system featuring CSS variables for theming.

The frontend uses **Wouter** for client-side routing, **TanStack Query** for server state management and caching, and **React Hook Form** with **Zod** validation for form handling. The application is bundled using **Vite** with hot module replacement for development efficiency.

Key architectural decisions include:
- Component-based architecture with reusable UI components in `/components/ui/`
- Custom hooks for mobile detection and toast notifications
- Centralized API client with automatic error handling and request/response interceptors
- Real-time job status polling using TanStack Query's refetch intervals

### Backend Architecture
The server uses **Express.js** with TypeScript running on Node.js, providing RESTful API endpoints for video processing operations. The architecture separates concerns across multiple layers:

**API Layer**: Express routes handle HTTP requests, file uploads using **Multer**, and response formatting. All routes are centralized in `/server/routes.ts` with proper error handling middleware.

**Storage Layer**: An abstraction layer (`IStorage` interface) with an in-memory implementation for managing video jobs and style templates. This design allows for easy migration to database storage later.

**Processing Layer**: Python scripts handle the computationally intensive video processing tasks, executed via Node.js child processes. The main processing logic is in `/server/video_processor.py` using **MoviePy** and **OpenCV**.

### Data Management
The application uses **Drizzle ORM** with PostgreSQL for data persistence, though the current implementation includes an in-memory storage fallback. The database schema is defined in `/shared/schema.ts` using Zod for runtime validation.

**Job Management**: Video processing jobs are tracked with status updates (pending, processing, completed, failed) and progress percentages. The job system supports both reference video uploads and predefined style templates.

**File Storage**: Uploaded videos are temporarily stored in local directories (`/uploads` and `/outputs`) with configurable size limits and MIME type validation.

### Video Processing Pipeline
The core video processing uses Python with several specialized libraries:

**Style Analysis**: Extracts color palettes from reference videos using K-means clustering on sampled video frames. The system analyzes dominant colors, contrast patterns, and timing characteristics.

**Style Application**: Applies extracted styles to user videos through color grading, brightness/contrast adjustments, and timing modifications. The processing supports various enhancement options like film grain, audio normalization, and transition effects.

**Progress Tracking**: The Python processing script communicates progress back to the Node.js server, enabling real-time status updates for users.

### State Management & Real-time Updates
The frontend implements optimistic updates and real-time job status polling. TanStack Query manages server state with automatic background refetching when jobs are in progress. The polling strategy uses adaptive intervals - frequent updates during processing, stopped when jobs complete.

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database adapter for serverless environments
- **drizzle-orm**: Type-safe database ORM with automatic migration support
- **express**: Web framework for the API server
- **multer**: Middleware for handling multipart/form-data file uploads

### Frontend UI & Interaction
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives (dialogs, dropdowns, forms, etc.)
- **@tanstack/react-query**: Server state management with caching and background updates
- **@hookform/resolvers**: Form validation integration with Zod schemas
- **wouter**: Lightweight client-side routing
- **class-variance-authority**: Type-safe CSS class composition for component variants

### Video Processing & Analysis
- **moviepy**: Python library for video editing and manipulation
- **opencv-python** (cv2): Computer vision library for frame analysis and color extraction
- **scikit-learn**: Machine learning algorithms for color clustering and pattern analysis
- **numpy**: Numerical computing for image and color data processing

### Development & Build Tools
- **vite**: Fast build tool with hot module replacement
- **typescript**: Type safety across the entire application
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration and schema management tools

### Styling & Design System
- **clsx** & **tailwind-merge**: Conditional CSS class composition
- **date-fns**: Date manipulation and formatting
- **lucide-react**: Consistent icon library
- **embla-carousel-react**: Touch-friendly carousel components

The architecture prioritizes type safety, developer experience, and scalability while maintaining clear separation between frontend presentation, backend API logic, and intensive video processing tasks.