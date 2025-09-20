# Raypx

[![Version](https://img.shields.io/github/package-json/v/raypx/raypxjs?style=flat-square)](https://github.com/raypx/raypxjs)
[![License](https://img.shields.io/github/license/raypx/raypxjs?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![pnpm](https://img.shields.io/badge/pnpm-10.17.0-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-red?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Biome](https://img.shields.io/badge/Biome-linter%20%26%20formatter-yellow?style=flat-square&logo=biome)](https://biomejs.dev/)

> A modern web application platform built with Next.js and TypeScript for building AI-powered applications.

## 🚀 Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/) >= 9.0.0
- Node.js >= 20 (for compatibility)

### Installation

```bash
# Clone the repository
git clone https://github.com/raypx/raypxjs.git
cd raypx

# Install dependencies with pnpm
pnpm install

# Start development server
pnpm dev
```

Visit [raypx.com](https://dub.sh/raypx) to get started with the platform.

## 📚 Documentation

Comprehensive documentation is available at [docs.raypx.com](https://docs.raypx.com).

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.0 with React 19
- **Language**: TypeScript 5.9.2
- **Package Manager**: pnpm 9.x ⚡
- **Monorepo**: Turborepo
- **UI Components**: Radix UI + Tailwind CSS (shadcn/ui)
- **Database**: Drizzle ORM
- **Authentication**: Custom auth system
- **Email**: Nodemailer
- **Cache**: Redis
- **Testing**: Vitest
- **Code Quality**: Biome (linting & formatting)
- **Git Hooks**: Husky + Commitlint

## 📁 Project Structure

```
raypx/
├── apps/
│   ├── web/          # Main Next.js application
│   └── docs/         # Documentation site (Fumadocs)
├── packages/         # Shared packages
│   ├── ui/           # UI component library
│   ├── auth/         # Authentication system
│   ├── db/           # Database layer (Drizzle)
│   ├── email/        # Email service
│   └── ...           # Other utilities
└── tooling/          # Development tools & configs
```

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the [Apache License 2.0](https://opensource.org/licenses/Apache-2.0).
