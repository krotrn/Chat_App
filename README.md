# ChatApp

**ChatApp** is a modern, feature-rich real-time communication platform built with Next.js (App Router), designed to connect people through seamless messaging and video calls. Whether you're chatting one-on-one with friends or collaborating in group conversations, ChatApp offers a scalable, intuitive, and responsive experience. It leverages cutting-edge technologies like Auth.js v5 for secure authentication, PostgreSQL (via Prisma) for robust user management, and MongoDB (via Mongoose) for efficient chat storage. The user interface, crafted with [shadcn/ui](https://ui.shadcn.com/) components, ensures a sleek, accessible, and visually appealing design.

This project is perfect for developers looking to explore a full-stack application with real-time communication features or for anyone seeking a customizable chat platform to adapt to their needs.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

ChatApp is packed with functionality to enhance user experience and provide flexibility for future growth. Here's what it offers:

- **Authentication & Authorization**
  - **Credential Authentication**: Securely log in with an email and password combination
  - **Social Authentication**: Sign in effortlessly using Google or GitHub accounts
  - **Email Verification**: Powered by [Resend](https://resend.com/), ensuring only verified users gain access
  - **JWT Token Management**: Secure token handling with proper expiration and validation
  - **Session Management**: Robust session handling with access token persistence

- **Real-Time Chat Functionality**
  - **Group Chats**: Create and participate in multi-user conversations
  - **One-on-One Chats**: Enjoy private messaging with friends
  - **Friend Requests**: Build your network by sending, accepting, or declining friend requests
  - **Message Features**:
    - Text messages with emoji support
    - File attachments (images, documents, etc.)
    - Camera capture integration
    - Message reactions
    - Reply to messages
    - Read receipts
    - Typing indicators
    - Message editing
    - Message deletion (for sender or admin)
    - Rich text formatting

- **Smart Data Transformation**
  - **MongoDB Aggregation Pipelines**: Efficiently transform and shape data at the database level
  - **Type-Safe Responses**: Consistent data structures with MessageResponseType and ChatResponseType
  - **Efficient Data Loading**: Optimized queries with pagination and selective field projection
  - **Real-time Data Synchronization**: Immediate updates across all connected clients

- **User Interface**
  - **Modern and Responsive**: Built with [shadcn/ui](https://ui.shadcn.com/) components
  - **Dark/Light Mode**: Seamless theme switching
  - **Error Handling**: Graceful error states and user feedback

- **User Profiles & Privacy**
  - **Personalization**: Edit your name, avatar, and status
  - **Online Status**: See when your friends are available
  - **Privacy Controls**:
    - Online status visibility
    - Read receipts
    - Typing indicators
    - Data collection preferences

- **File Management**
  - **Drag & Drop**: Easy file uploads
  - **Multiple File Support**: Upload up to 5 files simultaneously
  - **File Type Validation**: Automatic file type checking
  - **Size Limits**: Configurable file size restrictions
  - **Progress Tracking**: Visual upload progress indicators

- **Real-Time Features**
  - **WebSocket Integration**: Instant message delivery
  - **Socket Events**: Efficient real-time communication
  - **Connection Management**: Automatic reconnection handling

---

## Tech Stack

ChatApp is built with a thoughtfully selected set of technologies to ensure performance, maintainability, and developer-friendliness:

- **Frontend**:
  - **[Next.js 15](https://nextjs.org/)**: App Router for server-side rendering and routing
  - **[React 19](https://reactjs.org/)**: UI components and state management
  - **[TypeScript](https://www.typescriptlang.org/)**: Type-safe code
  - **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
  - **[shadcn/ui](https://ui.shadcn.com/)**: Accessible UI components
  - **[Framer Motion](https://www.framer.com/motion/)**: Animations
  - **[Socket.io Client](https://socket.io/)**: Real-time communication

- **Backend**:
  - **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)**: API endpoints
  - **[Prisma](https://www.prisma.io/)**: PostgreSQL ORM
  - **[MongoDB](https://www.mongodb.com/)**: Chat data storage
  - **[Mongoose](https://mongoosejs.com/)**: MongoDB ODM with typed schema support
  - **[MongoDB Aggregation Pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/)**: For efficient data transformations
  - **[Socket.io](https://socket.io/)**: WebSocket server
  - **[Auth.js v5](https://authjs.dev/)**: Authentication
  - **[Resend](https://resend.com/)**: Email service

- **Business Logic & Data Processing**:
  - **Strongly-Typed Models**: Mongoose schemas with TypeScript interfaces
  - **Aggregation Pipelines**: Transform MongoDB ObjectIds to strings for API responses
  - **Type Conversion Logic**: Consistent field transformations for frontend consumption
  - **Stateless Architecture**: Clean separation of database entities and API responses
  - **Error Resilience**: Retry mechanisms for critical operations
  - **Real-time Event Dispatching**: Efficient socket event broadcasting

- **Development Tools**:
  - **[Turbopack](https://turbo.build/pack)**: Fast development server
  - **[ESLint](https://eslint.org/)**: Code linting
  - **[Prettier](https://prettier.io/)**: Code formatting
  - **[TypeScript](https://www.typescriptlang.org/)**: End-to-end type safety

---

## Project Structure

ChatApp's codebase is organized for clarity and scalability. Here's an overview:

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── (protected)/      # Protected routes
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat-related components
│   ├── dashboard/        # Dashboard components
│   ├── friends/          # Friend management components
│   ├── landing/          # Landing page components
│   ├── navigation/       # Navigation components
│   ├── profile/          # User profile components
│   ├── settings/         # Settings components
│   ├── skeleton/         # Loading skeleton components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions and configurations
│   ├── api/             # API utilities
│   ├── settings/        # Settings configurations
│   ├── socket.ts        # Socket.io client setup
│   └── utils/           # Helper functions
├── services/            # API service functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
│   ├── chat.ts         # Chat-related types
│   └── message.ts      # Message-related types
└── public/             # Static assets
```

This structure separates concerns, making it easier to navigate and maintain the project.

---

## Getting Started

Follow these steps to set up ChatApp on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or later
- PostgreSQL 14.x or later
- MongoDB 6.x or later
- npm or yarn package manager

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/krotrn/chat-app.git
   cd chat-app
   ```

2. **Install Dependencies**
   ```bash
   npm install --force
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/chat_app"

   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Email Service
   RESEND_API_KEY="your-resend-api-key"

   # Chat API
   CHAT_API_URL="http://localhost:3001"
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

The API documentation is available at `/api-docs` when running in development mode. Key endpoints include:

- `POST /api/auth/*` - Authentication endpoints
- `GET /api/chats` - Fetch user's chats
- `POST /api/chats` - Create new chat
- `GET /api/messages/:chatId` - Fetch chat messages
- `POST /api/messages` - Send new message
- `GET /api/friends` - Manage friend connections

The backend uses standardized response types for consistency:
- `MessageResponseType` - Used for all message-related responses
- `ChatResponseType` - Used for all chat-related responses

These types ensure strong typing throughout the application and provide a predictable API surface for frontend integration.

For detailed API documentation, see [API_DOC.md](https://github.com/krotrn/ChatApp-backend/API_DOC.md).

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
