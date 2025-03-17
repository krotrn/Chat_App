# ChatApp

**ChatApp** is a modern, feature-rich chatting application built with Next.js (App Router), designed to connect people through seamless communication. Whether you're chatting one-on-one with friends or collaborating in group conversations, ChatApp offers a scalable, intuitive, and responsive experience. It leverages cutting-edge technologies like Auth.js v5 for secure authentication, PostgreSQL (via Prisma) for robust user management, and MongoDB (via Mongoose) for efficient chat storage. The user interface, crafted with [shadcn/ui](https://ui.shadcn.com/) components, ensures a sleek, accessible, and visually appealing design.

This project is perfect for developers looking to explore a full-stack application or for anyone seeking a customizable chat platform to adapt to their needs.

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

ChatApp is packed with functionality to enhance user experience and provide flexibility for future growth. Here’s what it offers:

- **Authentication & Authorization**

  - **Credential Authentication**: Securely log in with an email and password combination.
  - **Social Authentication**: Sign in effortlessly using Google or GitHub accounts.
  - **Email Verification**: Powered by [Resend](https://resend.com/), ensuring only verified users gain access.

- **Chat Functionality**

  - **Group Chats**: Create and participate in multi-user conversations for teams or communities.
  - **One-on-One Chats**: Enjoy private messaging with friends in a clean, distraction-free interface.
  - **Friend Requests**: Build your network by sending, accepting, or declining friend requests.

- **User Interface**

  - **Modern and Responsive**: Built with [shadcn/ui](https://ui.shadcn.com/) components, delivering a polished and adaptive design across devices.
  - **Real-Time Updates**: Stay connected with instant message delivery and notifications (planned for future releases).

- **User Profiles**

  - **Personalization**: Edit your name, avatar, and status to reflect your identity.
  - **Online Status**: See when your friends are available to chat.

- **Scalable & Modular Design**

  - **User Management**: PostgreSQL and Prisma ensure efficient handling of user data and relationships.
  - **Chat Storage**: MongoDB with Mongoose provides a flexible, scalable solution for storing messages and group data.
  - **API-Driven**: A clear separation of concerns makes it easy to extend or integrate with other systems.

- **Future Enhancements**
  - Real-time messaging powered by WebSockets for instantaneous communication.
  - End-to-end encryption to prioritize user privacy and security.
  - Mobile app support for iOS and Android platforms.

---

## Tech Stack

ChatApp is built with a thoughtfully selected set of technologies to ensure performance, maintainability, and developer-friendliness:

- **Frontend**:

  - **[Next.js (App Router)](https://nextjs.org/docs/app)**: Powers server-side rendering, routing, and API endpoints for a fast, SEO-friendly experience.
  - **[React](https://reactjs.org/)**: Drives dynamic, component-based UI development.
  - **[shadcn/ui](https://ui.shadcn.com/)**: Provides customizable, accessible UI components for a consistent look and feel.

- **Authentication**:

  - **[Auth.js v5](https://authjs.dev/)**: A versatile library supporting credential-based logins and social providers like Google and GitHub.

- **Databases**:

  - **PostgreSQL (via [Prisma ORM](https://www.prisma.io/))**: Manages user authentication, profiles, and relationships with a robust relational structure.

- **Languages**:
  - **[TypeScript](https://www.typescriptlang.org/)**: Adds type safety and enhances code quality, making development smoother and more reliable.

---

## Project Structure

ChatApp’s codebase is organized for clarity and scalability. Here’s an overview:

```
├── app/                # Next.js app directory (pages, API routes, layouts)
├── components/         # Reusable React components (e.g., chat window, auth forms)
├── lib/                # Utility functions (e.g., database connections, auth helpers)
├── prisma/             # Prisma schema, migrations, and database configuration
├── public/             # Static assets (images, icons, etc.)
├── styles/             # Global styles and CSS modules
├── types/              # TypeScript type definitions for shared interfaces
└── utils/              # General-purpose utilities (e.g., formatting, validation)
```

This structure separates concerns, making it easier to navigate and maintain the project.

---

## Getting Started

Follow these steps to set up ChatApp on your local machine.

### Prerequisites

Ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v14 or later)
- **[PostgreSQL](https://www.postgresql.org/)** – A running instance (local or remote).

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/krotrn/Chat_App.git
   cd Chat_App
   ```

2. **Install Dependencies**

   Using npm:

   ```bash
   npm install --force
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory and populate it with the following:

   ```env
   DATABASE_URL=your_postgresql_connection_string
   AUTH_SECRET=your_random_auth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAI =****************
   NEXT_PUBLIC_APP_NAME=app_name
   ENCRYPTION_KEY = "your_encryption_key_here"
   EMAIL_TOKEN_EXPIRATION_TIME = "in_HOURS"
   CHAT_API_URL="your_chat_api_url_here"
   INTERNAL_API_KEY="your_internal_api_key_here"
   ACCESS_TOKEN_SECRET="your_access_token_secret"
   ```

   - Replace placeholders with your actual credentials (e.g., generate `AUTH_SECRET` with a random string).
   - Obtain social auth keys from Google and GitHub developer consoles.

4. **Set Up Databases**

   - **PostgreSQL**: Initialize the schema with Prisma migrations:

     ```bash
     npx prisma migrate dev
     ```

---

## Running the Application

Launch the development server:

```bash
npm run dev
```

Open your browser to `http://localhost:3000` to explore ChatApp locally.

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

   - **MongoDB**: Verify connectivity from your production server.

Consider using a platform like Vercel for Next.js hosting or a custom server with Nginx for more control.

---

## API Documentation

Developers can explore and integrate with ChatApp via our upcoming [API Documentation](https://github.com/krotrn/ChatApp-backend/blob/main/API_DOC.md). It will detail endpoints, payloads, and authentication flows for extending the platform.

---

## Contributing

We’d love your help to make ChatApp even better! To contribute:

1. **Fork the Repository**
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

We’re excited to hear from you!

---

## **Happy coding!**
