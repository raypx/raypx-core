# Raypx

[![Version](https://img.shields.io/github/package-json/v/raypx/raypxjs?style=flat-square)](https://github.com/raypx/raypxjs)
[![License](https://img.shields.io/github/license/raypx/raypxjs?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![pnpm](https://img.shields.io/badge/pnpm-10.17.0-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-red?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Biome](https://img.shields.io/badge/Biome-linter%20%26%20formatter-yellow?style=flat-square&logo=biome)](https://biomejs.dev/)

> A modern, high-performance web application platform built with Next.js 15 and TypeScript, designed specifically for building scalable AI-powered applications with enterprise-grade security and developer experience.

## ✨ Features

- **🤖 AI-First Architecture** - Built-in AI integrations and optimizations
- **⚡ Lightning Fast** - Next.js 15 with React 19 and Turbopack
- **🔐 Enterprise Security** - Advanced authentication and authorization
- **🎨 Modern UI/UX** - Beautiful components with Radix UI + Tailwind CSS
- **📊 Real-time Analytics** - Comprehensive monitoring and insights
- **🔄 Type-Safe APIs** - End-to-end TypeScript with tRPC
- **🗄️ Database Agnostic** - Flexible ORM with Drizzle
- **🚀 Deploy Anywhere** - Optimized for cloud platforms

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0 (LTS recommended)
- **pnpm** >= 10.17.0 (required for workspace management)
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/raypx/raypxjs.git
cd raypxjs

# Install dependencies with pnpm
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations (if applicable)
pnpm db:migrate

# Start development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

**Live Demo**: Visit [raypx.com](https://raypx.com) to see Raypx in action.

## 📚 Documentation

Comprehensive documentation and guides are available at [docs.raypx.com](https://docs.raypx.com).

- **[Getting Started](https://docs.raypx.com/docs)** - Basic setup and configuration
- **[API Reference](https://docs.raypx.com/api)** - Complete API documentation
- **[Deployment Guide](https://docs.raypx.com/deployment)** - Production deployment instructions
- **[Contributing](https://docs.raypx.com/contributing)** - How to contribute to the project

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 15.5.0](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript 5.9.2](https://www.typescriptlang.org/)** - Type-safe development

### Development Tools
- **[pnpm 10.17.0](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[Turborepo](https://turbo.build/)** - High-performance build system for monorepos
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[Husky](https://typicode.github.io/husky/)** + **[Commitlint](https://commitlint.js.org/)** - Git hooks and commit standards

### UI & Styling
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, customizable component library
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready motion library

### Backend & Database
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM with SQL-like syntax
- **[PostgreSQL](https://www.postgresql.org/)** - Advanced open source database
- **[Redis](https://redis.io/)** - In-memory data structure store
- **[Nodemailer](https://nodemailer.com/)** - Email service integration

### Testing & Quality
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[Playwright](https://playwright.dev/)** - End-to-end testing
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript linting rules

## 📁 Project Structure

```
raypxjs/
├── apps/                          # Applications
│   ├── web/                      # Main Next.js application
│   │   ├── app/                  # App Router pages and layouts
│   │   ├── components/           # React components
│   │   ├── lib/                  # Utility functions and configurations
│   │   └── public/               # Static assets
│   └── docs/                     # Documentation site (Fumadocs)
│       ├── content/              # MDX documentation content
│       └── components/           # Doc-specific components
├── packages/                      # Shared packages
│   ├── ui/                       # UI component library
│   │   ├── components/           # Reusable UI components
│   │   └── lib/                  # UI utilities and themes
│   ├── auth/                     # Authentication system
│   ├── db/                       # Database layer and migrations
│   ├── email/                    # Email templates and service
│   ├── analytics/                # Analytics and tracking
│   ├── config/                   # Shared configurations
│   ├── shared/                   # Common utilities and types
│   └── testing/                  # Testing utilities and setup
├── tooling/                       # Development tools
│   ├── biome/                    # Biome configuration
│   ├── tsconfig/                 # TypeScript configurations
│   └── scripts/                  # Build and deployment scripts
└── .github/                       # GitHub workflows and templates
    └── workflows/                # CI/CD pipelines
```

## 🚀 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm preview          # Preview production build

# Code Quality
pnpm check            # Run Biome linting
pnpm format           # Format code with Biome
pnpm typecheck        # Run TypeScript type checking

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run end-to-end tests

# Database
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database with test data

# Utilities
pnpm clean            # Clean build artifacts
pnpm update:deps      # Update dependencies interactively
```

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](https://docs.raypx.com/contributing) for details on:

- Code of Conduct
- Development setup
- Submitting pull requests
- Reporting issues
- Coding standards

## 📄 License

This project is licensed under the [Apache License 2.0](https://opensource.org/licenses/Apache-2.0).

## 🙏 Acknowledgments

Special thanks to all the amazing open source projects that make Raypx possible:
- [Vercel](https://vercel.com/) for Next.js and deployment platform
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Tailwind Labs](https://tailwindlabs.com/) for Tailwind CSS
- [Drizzle Team](https://orm.drizzle.team/) for the excellent ORM

---

<div align="center">

**[Website](https://raypx.com)** • **[Documentation](https://docs.raypx.com)** • **[GitHub](https://github.com/raypx/raypxjs)** • **[Issues](https://github.com/raypx/raypxjs/issues)**

Made with ❤️ by the Raypx team

</div>