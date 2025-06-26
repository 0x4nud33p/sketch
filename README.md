# Sketch - Real-time Collaborative Whiteboard [Demo-Video](https://youtu.be/nqh0m3Ls2YE)

> A modern, real-time collaborative whiteboard application built with Next.js, WebSockets, and Prisma

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

## ✨ Features

- **🎨 Real-time Collaborative Drawing** - Multiple users can draw simultaneously with instant synchronization
- **🏠 Room-based Sessions** - Create and join dedicated collaboration spaces
- **🔐 Secure Authentication** - Google OAuth integration with session management
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🚀 High Performance** - Built with modern web technologies for optimal speed
- **🎯 Intuitive Interface** - Clean, user-friendly design inspired by industry standards

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **WebSocket Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **WebSocket Server** - Live collaboration engine
- **Better Auth** - Modern authentication solution

### Database & Infrastructure
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Robust relational database
- **Turborepo** - High-performance build system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/0x4nud33p/sketch.git
   cd sketch
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   
   Copy the example environment files and configure them:
   ```bash
   # Web application
   cp apps/web/.env.example apps/web/.env.local
   
   # WebSocket backend
   cp apps/ws-backend/.env.example apps/ws-backend/.env
   
   # Database
   cp packages/db/.env.example packages/db/.env
   ```

4. **Configure environment variables**

   **`apps/web/.env.local`**
   ```env
   NEXT_WS_URL=ws://localhost:8080
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   BETTER_AUTH_SECRET=your_secure_random_string
   BETTER_AUTH_URL=http://localhost:3000
   ```

   **`packages/db/.env`**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/sketch_db"
   ```

5. **Database setup**
   ```bash
   pnpm db:push
   ```

6. **Start development servers**
   ```bash
   # Terminal 1 - Start the web application
   pnpm dev:web
   
   # Terminal 2 - Start the WebSocket server
   pnpm dev:ws
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:3000` to start collaborating!

## 📁 Project Architecture

```
sketch/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── app/               # App Router pages and layouts
│   │   ├── components/        # Reusable React components
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/               # Utility functions and configs
│   └── ws-backend/            # WebSocket server
│       └── src/               # Server implementation
├── packages/
│   ├── db/                    # Prisma database schema and client
│   ├── eslint-config/         # Shared ESLint configurations
│   ├── typescript-config/     # Shared TypeScript configurations
│   └── ui/                    # Shared UI component library
└── turbo.json                 # Turborepo configuration
```

## 🔌 API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signin` | User authentication |
| `GET` | `/api/auth/session` | Get current session |

### Application Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/drawings` | Retrieve saved drawings |
| `POST` | `/api/drawings` | Save drawing data |
| `GET` | `/api/rooms` | List available rooms |
| `POST` | `/api/rooms` | Create new collaboration room |

## 🧪 Development

### Available Scripts

```bash
# Development
pnpm dev:web          # Start web application
pnpm dev:ws           # Start WebSocket server
pnpm dev              # Start all services

# Database
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Prisma Studio
pnpm db:generate      # Generate Prisma client

# Building
pnpm build            # Build all packages
pnpm build:web        # Build web application only

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm type-check       # Run TypeScript checks
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🙏 Acknowledgments

- Inspired by [Excalidraw](https://excalidraw.com/) for the collaborative drawing experience
- Built with modern web technologies and best practices
- Special thanks to the open-source community

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/0x4nud33p/sketch/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/0x4nud33p/sketch/discussions)
- 📧 **Contact**: [anudeepavula009@example.com](mailto:anudeepavula009@example.com)

---

<div align="center">

**[🌟 Star this repo](https://github.com/0x4nud33p/sketch)** • **[🍴 Fork it](https://github.com/0x4nud33p/sketch/fork)** • **[📱 Try the demo](https://sketch-pji1og6kj-anudeep-avulas-projects.vercel.app)**

Made with ❤️ by [Anudeep Avula](https://github.com/0x4nud33p)

</div>