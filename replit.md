# Online Notepad Application

## Overview

This is a full-stack web application built as an online notepad with category-based note organization. The application provides a rich text editor for creating and editing notes, with features like formatting tools, tagging, and search functionality. It's designed as a modern, responsive note-taking application with a clean, intuitive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better developer experience
- **Styling**: Tailwind CSS with custom CSS variables for theming and shadcn/ui component library for consistent UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Rich Text Editing**: Custom rich text editor implementation with formatting toolbar
- **Mobile Responsiveness**: Mobile-first design with responsive layouts and mobile-specific interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript for both frontend and backend consistency
- **API Design**: RESTful API with JSON responses
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Database Schema
- **Categories Table**: Stores note categories with id, name, color, and creation timestamp
- **Notes Table**: Stores notes with id, title, content, category reference, tags array, and timestamps
- **Relationships**: Notes belong to categories with cascade delete functionality

### Component Architecture
- **Three-Panel Layout**: Sidebar for categories, notes panel for note listing, and editor panel for content editing
- **Responsive Design**: Collapsible sidebar on mobile with overlay navigation
- **Component Structure**: Modular components with clear separation of concerns
- **UI Components**: Reusable shadcn/ui components with consistent styling

### Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESBuild for production bundling
- **Development Experience**: Hot module replacement and runtime error overlays

## External Dependencies

### Database Integration
- **Drizzle ORM**: Type-safe database queries and schema management
- **PostgreSQL**: Configured for production database with Neon Database serverless connection
- **Database Migrations**: Drizzle Kit for schema migrations and database management

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Class Variance Authority**: Type-safe variant management for component styling
- **Lucide React**: Icon library for consistent iconography

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for forms and API data
- **Hookform Resolvers**: Integration layer between React Hook Form and Zod

### Development and Build Tools
- **Replit Integration**: Vite plugins for Replit development environment
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **Date-fns**: Date manipulation and formatting utilities

### Potential Future Integrations
- **Authentication**: Ready for user authentication system integration
- **File Uploads**: Prepared for attachment and media upload functionality
- **Real-time Collaboration**: Architecture supports WebSocket integration for collaborative editing
- **Export/Import**: Extensible for note export in various formats