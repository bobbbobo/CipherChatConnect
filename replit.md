# Overview

CipherChat is a professional, secure, real-time messaging web application that combines educational RSA cryptography learning with practical secure communication. The platform serves dual purposes: teaching RSA encryption through interactive tools and providing secure chat functionality with real-time messaging capabilities.

The application features RSA key generation, message encryption/decryption with visible mathematical steps, educational modules for learning cryptographic concepts, and WebSocket-based real-time chat with RSA encryption. Users can access the platform as guests or create authenticated accounts for enhanced features like private messaging and key persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React 18 and TypeScript using Vite as the build tool. The application follows a modern component-based architecture with clear separation of concerns:

**UI Framework**: React with TypeScript for type safety, using shadcn/ui components built on Radix UI primitives for consistent design patterns. Tailwind CSS provides utility-first styling with custom design tokens and CSS variables for theming.

**State Management**: TanStack React Query handles server state management, caching, and synchronization. Local UI state is managed with React's built-in useState and useEffect hooks. The application uses a custom WebSocket client for real-time chat state.

**Routing**: Wouter provides lightweight client-side routing with conditional rendering based on authentication state.

**Component Organization**: Components are organized into feature-based modules (chat, RSA, education, settings) with shared UI components in a common directory. Each feature module encapsulates its own state and business logic.

**Real-time Communication**: Custom WebSocket client implementation handles connection management, message broadcasting, room management, and automatic reconnection with exponential backoff.

## Backend Architecture

The backend uses Node.js with Express.js and TypeScript in an ESM module architecture:

**Server Framework**: Express.js provides RESTful API endpoints with middleware for authentication, logging, and error handling. The server implements HTTP upgrade to WebSocket for real-time features.

**WebSocket Management**: Custom WebSocketManager class handles client connections, room-based messaging, and message broadcasting with support for encrypted message transmission.

**Authentication System**: Dual authentication supporting Replit OAuth (using OpenID Connect) and traditional email/password authentication with bcrypt password hashing. Session-based authentication with secure cookie configuration.

**API Design**: RESTful endpoints for user management, chat rooms, and RSA key storage. WebSocket endpoints handle real-time messaging, typing indicators, and user presence.

**Storage Abstraction**: IStorage interface abstracts database operations, making the system testable and allowing for different storage implementations. Current implementation uses PostgreSQL with connection pooling.

## Data Storage

The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

**Database**: PostgreSQL configured for both local development and Neon serverless deployment. Connection pooling ensures optimal performance and resource utilization.

**ORM**: Drizzle ORM provides schema-first approach with TypeScript integration, automatic migration generation, and query building with type safety.

**Schema Design**: Normalized schema with tables for users, chat rooms, messages, RSA keys, and sessions. Foreign key relationships maintain data integrity.

**Session Storage**: PostgreSQL-based session storage using connect-pg-simple for authentication state persistence across server restarts.

**Migration Management**: Drizzle Kit handles schema migrations with version control and rollback capabilities.

## External Dependencies

**Database Services**: Neon serverless PostgreSQL for production deployment with WebSocket support through ws library for Node.js compatibility.

**Authentication**: Replit OAuth integration using OpenID Connect for seamless authentication within the Replit environment. Passport.js handles OAuth flow and session management.

**UI Libraries**: Radix UI primitives provide accessible, unstyled components. Lucide React supplies consistent iconography. Date-fns handles date formatting and manipulation.

**Development Tools**: Vite provides fast development server and optimized production builds. TSX enables TypeScript execution in Node.js. ESBuild handles server-side bundling for production deployment.

**Real-time Communication**: Native WebSocket implementation with custom client and server management. No external WebSocket services required.

**Cryptographic Functions**: Custom RSA implementation for educational purposes using native JavaScript math operations. Production-ready crypto operations use built-in Node.js crypto module.

**Styling System**: Tailwind CSS with custom configuration, Tailwind Merge for className optimization, and CLSX for conditional className handling.