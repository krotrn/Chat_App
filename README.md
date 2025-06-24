# Chat App Frontend

**Chat App** is a modern, production-ready real-time chat application built with Next.js 15 and React 19. This frontend client provides a seamless messaging experience with advanced real-time features, comprehensive Socket.IO integration, and a beautiful user interface. It connects to a dedicated Node.js backend service for chat functionality while managing user authentication and profiles through Auth.js v5 and PostgreSQL.

The application features advanced state management with Redux Toolkit, real-time communication through Socket.IO, server state management with React Query, and a responsive UI built with shadcn/ui components. It includes sophisticated connection recovery, health monitoring, and optimistic UI updates for the best user experience.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

Chat App is built with advanced features and modern patterns to deliver a superior user experience:

### 🔐 **Authentication & Security**

- **Social Authentication**: Google and GitHub OAuth integration via Auth.js v5
- **JWT Token Management**: Secure token handling with automatic refresh and validation
- **Session Management**: Persistent session handling with Redux state management
- **Database Integration**: PostgreSQL user management with Prisma ORM

### 💬 **Real-time Communication**

- **WebSocket Integration**: Full-featured Socket.IO client with health monitoring
- **Connection Recovery**: Automatic reconnection with exponential backoff
- **Health Checks**: Periodic connection monitoring with stale connection detection
- **Optimistic Updates**: Immediate UI updates with server synchronization
- **Message Features**:
  - Real-time messaging with instant delivery
  - Message reactions with emoji support
  - Message editing and deletion
  - Reply to messages functionality
  - Pin/unpin important messages
  - Read receipts and status tracking
  - File attachments and image sharing

### 🏘️ **Chat Management**

- **Group Chats**: Create and manage multi-user conversations
- **Direct Messages**: Private one-on-one conversations
- **Chat Administration**: Add/remove participants, delete chats
- **Real-time Updates**: Live chat creation, updates, and member changes
- **Infinite Scrolling**: Efficient message loading with React Query

### 👥 **Social Features**

- **Friend System**: Send, accept, and manage friend requests
- **User Search**: Find and connect with other users
- **Online Status**: Real-time user presence tracking
- **Typing Indicators**: Live typing status for active conversations
- **User Profiles**: Customizable avatars and status information

### 🎨 **Modern User Experience**

- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Mode**: Seamless theme switching with next-themes
- **Smooth Animations**: Framer Motion powered interactions
- **Loading States**: Sophisticated skeleton loaders and error boundaries
- **Real-time Notifications**: Toast notifications with Sonner

### ⚡ **Performance & State Management**

- **Redux Toolkit**: Advanced state management with real-time middleware
- **React Query**: Server state management with caching and synchronization
- **Connection Middleware**: Specialized Redux middleware for Socket.IO events
- **Optimistic UI**: Instant feedback with error recovery
- **Infinite Queries**: Efficient data loading with automatic pagination

---

## Tech Stack

Chat App leverages cutting-edge technologies for optimal performance and developer experience:

### 🖥️ **Frontend Core**

- **[Next.js 15](https://nextjs.org/)**: App Router with server-side rendering and advanced routing
- **[React 19](https://reactjs.org/)**: Latest React features with concurrent rendering
- **[TypeScript](https://www.typescriptlang.org/)**: End-to-end type safety across the application
- **[Tailwind CSS 4.0](https://tailwindcss.com/)**: Modern utility-first CSS framework

### 🎨 **UI & Design**

- **[shadcn/ui](https://ui.shadcn.com/)**: Beautiful, accessible component library
- **[Radix UI](https://www.radix-ui.com/)**: Low-level UI primitives for complex components
- **[Framer Motion](https://www.framer.com/motion/)**: Smooth animations and transitions
- **[Lucide React](https://lucide.dev/)**: Beautiful SVG icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)**: Theme switching support

### ⚡ **State Management & Data**

- **[Redux Toolkit](https://redux-toolkit.js.org/)**: Predictable state management
- **[React Query (TanStack Query)](https://tanstack.com/query/)**: Server state management and caching
- **[React Hook Form](https://react-hook-form.com/)**: Performant form handling
- **[Zod](https://zod.dev/)**: TypeScript-first schema validation

### 🔄 **Real-time Communication**

- **[Socket.IO Client](https://socket.io/)**: WebSocket communication with the backend
- **Custom Middleware**: Redux middleware for Socket.IO event handling
- **Connection Recovery**: Advanced reconnection logic with health monitoring
- **Event Management**: Type-safe Socket.IO event definitions and handlers

### 🗄️ **Database & Authentication**

- **[Prisma](https://www.prisma.io/)**: PostgreSQL ORM for user data management
- **[Auth.js v5](https://authjs.dev/)**: Modern authentication with OAuth providers
- **[PostgreSQL](https://www.postgresql.org/)**: Robust relational database for user management
- **[MongoDB](https://www.mongodb.com/)**: Chat data storage (via backend service)

### 🛠️ **Development & Tooling**

- **[Turbopack](https://turbo.build/pack)**: Ultra-fast development bundler
- **[ESLint](https://eslint.org/)**: Code linting with TypeScript support
- **[Prettier](https://prettier.io/)**: Consistent code formatting
- **[PostCSS](https://postcss.org/)**: CSS processing and optimization

### 📦 **Additional Libraries**

- **[date-fns](https://date-fns.org/)**: Modern date utility library
- **[lodash](https://lodash.com/)**: Utility functions for data manipulation
- **[Sonner](https://sonner.emilkowal.ski/)**: Toast notifications
- **[Embla Carousel](https://www.embla-carousel.com/)**: Lightweight carousel component
- **[React Resizable Panels](https://github.com/bvaughn/react-resizable-panels)**: Resizable UI panels

---

## Project Structure

ChatApp's codebase is organized for clarity and scalability. Here's an overview:

```
src/
├── app/                   # Next.js app directory
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── (protected)/        # Protected routes
│   └── globals.css         # Global styles
├── components/            # React components
│   ├── auth/               # Authentication components
│   ├── chat/               # Chat-related components
│   ├── dashboard/          # Dashboard components
│   ├── friends/            # Friend management components
│   ├── landing/            # Landing page components
│   ├── navigation/         # Navigation components
│   ├── profile/            # User profile components
│   ├── settings/           # Settings components
│   ├── skeleton/           # Loading skeleton components
│   └── ui/                 # Reusable UI components
├── lib/                   # Utility functions and configurations
│   ├── api/                # API utilities
│   ├── redux/              # Authentication utilities
│   ├── settings/           # Settings configurations
│   ├── socket.ts           # Socket.io client setup
│   └── utils/              # Helper functions
├── services/              # API service functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
│   ├── chat.ts             # Chat-related types
│   └── message.ts          # Message-related types
└── public/                # Static assets
```

This structure separates concerns, making it easier to navigate and maintain the project.

---

## Getting Started

Follow these steps to set up ChatApp on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.x or later
- PostgreSQL 14.x or later
- npm package manager

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/krotrn/chat-app.git
   cd chat-app
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Database
   DATABASE_URL = "postgresql://********:*****************.*********************.****.tech/*****?sslmode=require"

   NODE_ENV = "development"
   AUTH_SECRET = **********************************************************************

   # from chat-backend at http://github.com/krotrn/chat-backend
   NEXT_PUBLIC_API_BASE_URL = http://localhost:3000

   # Auth0 credentials for NextAuth
   GITHUB_CLIENT_ID = ***************
   GITHUB_CLIENT_SECRET = ****************************************
   GOOGLE_CLIENT_ID = ************-********************************.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = *****-***********************************************

   # Resend API key
   RESEND_API_KEY = your_resend_api_key_here
   RESEND_FROM_EMAIL = ****************
   NEXT_PUBLIC_APP_NAME = "Chat App"

   # similar to chat-backend chat-backend at http://github.com/krotrn/chat-backend
   JWT_SECRET = "your_jwt_secret_here"

   # for Encryption of verification code
   ENCRYPTION_KEY = "your_encryption_key_here"
   EMAIL_TOKEN_EXPIRATION_TIME = "in_HOURS"
   NEXT_PUBLIC_CHAT_API_URL = "your_chat_api_url_here"
   NEXT_PUBLIC_SUPPORT_EMAIL = "enter_your_support_email_here"

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name_here
   CLOUDINARY_API_KEY = your_cloudinary_api_key_here
   CLOUDINARY_API_SECRET = your_cloudinary_api_secret_here
   CLOUDINARY_AVATAR_UPLOAD_PRESET = chat_app_avatar
   CLOUDINARY_CHAT_FILE_UPLOAD_PRESET = chat_app_files
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## Running the Application

1. **Development Mode**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:3000`

2. **Production Build**

   ```bash
   npm run build

   ```

---

## Docker Setup

Chat App includes comprehensive Docker support for both development and production environments. The setup includes PostgreSQL database integration and optimized multi-stage builds.

### 🐳 **Docker Features**

- **Multi-stage Dockerfile**: Optimized for production with minimal image size
- **PostgreSQL Integration**: Containerized database with persistent storage
- **Development & Production Modes**: Separate configurations for different environments
- **Health Checks**: Container health monitoring and dependency management
- **Volume Management**: Persistent data storage and development mounting

### **Quick Start with Docker**

1. **Prerequisites**

   - Docker Desktop installed and running
   - Docker Compose (included with Docker Desktop)

2. **Production Setup**

   ```bash
   # Copy the Docker environment template
   cp .env.docker .env

   # Update environment variables with your actual values
   # Configure DATABASE_URL, API keys, and authentication providers

   # Build and start all services
   docker-compose up --build -d
   ```

   The application will be available at `http://localhost:3000`

3. **Development Setup**

   ```bash
   # Use the development compose file
   docker-compose -f docker-compose.dev.yml up --build -d

   # Or use the npm script
   npm run docker:dev
   ```

### **Docker Commands**

```bash
# Build and start all services
npm run docker:up

# Start in development mode with hot reload
npm run docker:dev

# Stop all services
npm run docker:down

# View logs
docker-compose logs -f app

# Access the database
docker exec -it chat-app-postgres psql -U chatapp_user -d chatapp

# Clean up everything (including volumes)
docker-compose down -v --remove-orphans
```

### **Docker Environment Variables**

Create a `.env` file with Docker-specific configurations:

```env
# Database (automatically configured for Docker)
DATABASE_URL=postgresql://chatapp_user:chatapp_password@postgres:5432/chatapp?sslmode=disable

# Backend API URLs (adjust ports as needed)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_CHAT_API_URL=http://localhost:3001

# Add all other environment variables from the main setup
# (Authentication, Cloudinary, etc.)
```

### **Container Architecture**

The Docker setup includes:

- **App Container**: Next.js application with optimized production build
- **PostgreSQL Container**: Database with persistent volume storage
- **Shared Network**: Secure communication between containers
- **Volume Management**: Persistent database storage and development mounting

### **Production Optimization**

The Dockerfile uses multi-stage builds for optimal production performance:

- **Dependencies Stage**: Installs only production dependencies
- **Builder Stage**: Compiles the application with Prisma generation
- **Runner Stage**: Minimal runtime environment with security best practices

For detailed Docker documentation, see [DOCKER.md](DOCKER.md).

---

## Deployment

To deploy ChatApp to a production environment:

1. **Build the Application**

   ```bash
   npm run build
   ```

2. **Start the Production Server**

   ```bash
   npm start
   ```

3. **Configure Production Environment**

   Ensure your `.env` file or hosting platform (e.g., Vercel, Heroku) has all required environment variables set.

4. **Set Up Databases in Production**

   - **PostgreSQL**: Deploy migrations:

     ```bash
     npx prisma migrate deploy
     ```

Consider using a platform like Vercel for Next.js hosting or a custom server with Nginx for more control.

---

## API Documentation

The backend uses standardized response types for consistency:

- `MessageResponseType` - Used for all message-related responses
- `ChatResponseType` - Used for all chat-related responses

These types ensure strong typing throughout the application and provide a predictable API surface for frontend integration.

For detailed API documentation, see [API_DOC.md](https://github.com/krotrn/ChatApp-backend/blob/main/API_DOC.md).

---

## Contributing

We'd love your help to make ChatApp even better! To contribute:

1. **Fork the Repository**

   ```bash
   git clone https://github.com/krotrn/chat-app.git
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add your feature description"
   ```

4. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a Pull Request**
   Include a detailed description of your changes and link any related issues.

Check out [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines on reporting bugs, suggesting features, and coding standards.

---

## License

ChatApp is licensed under the [MIT License](LICENSE), granting you the freedom to use, modify, and distribute the software as you see fit, provided you include the license notice.

---

## Contact

Have questions or ideas? Reach out by:

- Opening an issue on GitHub.
- Emailing [krotrn.ks@gmail.com](mailto:krotrn.ks@gmail.com).

We're excited to hear from you!

---

## **Happy coding!**
