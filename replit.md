# GearGuard - Equipment Maintenance Management System

## Overview

GearGuard is an equipment maintenance management application that helps teams track equipment inventory and manage maintenance requests through an intuitive Kanban-style interface. The system allows users to register equipment, create maintenance work orders, and track repair status from initial request through completion or decommissioning.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme using CSS variables
- **Animations**: Framer Motion for smooth transitions
- **Drag & Drop**: @dnd-kit for Kanban board interactions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in shared route contracts
- **Validation**: Zod schemas shared between client and server
- **Build System**: Vite for frontend, esbuild for server bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions and Zod schemas
- **Current Storage**: In-memory storage (`MemStorage` class) - database integration ready via Drizzle config
- **Type Safety**: Types derived from Drizzle schemas using `$inferSelect` and `createInsertSchema`

### Key Design Patterns
- **Shared Contracts**: The `shared/` directory contains schemas and route definitions used by both client and server, ensuring type safety across the stack
- **API Route Registry**: Routes are defined declaratively in `shared/routes.ts` with input/output schemas, making the API self-documenting
- **Component Architecture**: Feature components (KanbanBoard, EquipmentCard) are composed from primitive UI components in `components/ui/`

### Domain Model
- **Equipment**: Physical assets tracked by name, serial number, department, and assigned team
- **Maintenance Requests**: Work orders with title, type (corrective/preventive), priority, status, scheduled date, and assigned technician
- **Status Flow**: new → in_progress → repaired/scrap (Kanban columns)

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: For schema migrations (`npm run db:push`)
- **connect-pg-simple**: PostgreSQL session store (available but not currently used)

### Third-Party UI Services
- **DiceBear Avatars**: Generates technician avatars from names (`api.dicebear.com`)
- **Google Fonts**: Outfit, DM Sans, and JetBrains Mono typefaces

### Development Tools
- **Vite**: Development server with HMR
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment

### Key npm Packages
- `@tanstack/react-query`: Data fetching and caching
- `@dnd-kit/*`: Drag and drop functionality
- `framer-motion`: Animation library
- `date-fns`: Date formatting and manipulation
- `zod`: Runtime type validation
- `drizzle-orm` / `drizzle-zod`: Database ORM and schema validation