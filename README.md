# ChatApp

A feature-rich chatting application built with Next.js (App Router) that supports multiple authentication methods, group chats, friend chats, friend requests, and more. This project uses Auth.js v5 for authentication, PostgreSQL (via Prisma) for user authentication and identification, and MongoDB (via Mongoose) for chat storage. The UI is built with [shadcn/ui](https://ui.shadcn.com/) components.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Authentication & Authorization**
  - Credential authentication
  - Social authentication with Google and GitHub
  - Email verification (Resend)
  - OTP-based login

- **Chat Functionality**
  - Group chat support
  - One-on-one friend chats
  - Friend request system

- **User Interface**
  - Built with shadcn/ui components for a modern and responsive design

- **Scalable & Modular**
  - Uses PostgreSQL (via Prisma) for handling user data
  - Uses MongoDB (via Mongoose) for efficient chat storage
  - Clean separation between authentication and chat data

- **Future Enhancements**
  - Additional chat features
  - Improved notifications and real-time updates
  - More integrations and social login providers

## Tech Stack

- **Frontend:** Next.js (App Router), React, shadcn/ui
- **Authentication:** Auth.js v5 (with support for multiple providers)
- **Databases:**
  - **PostgreSQL** (with Prisma ORM) – for user data and authentication
  - **MongoDB** (with Mongoose) – for chat messages and related data
- **Languages:** TypeScript

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [PostgreSQL](https://www.postgresql.org/) instance
- [MongoDB](https://www.mongodb.com/) instance

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/krotrn/Chat_App.git
   cd Chat_App
   ```

2. **Install Dependencies**

   Using npm:

   ```bash
   npm install
   ```

## Running the Application

Start the development server with:

```bash
npm run dev
```

## Contributing

Contributions are welcome! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute, report issues, or propose new features.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions, suggestions, or feedback, please open an issue or contact [krotrn.ks@gmail.com](mailto:krotrn.ks@gmail.com).

---

Happy coding!

