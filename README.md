# Raypx

[![Version](https://img.shields.io/github/package-json/v/raypx/raypx-core?style=flat-square)](https://github.com/raypx/raypx-core)
[![License](https://img.shields.io/github/license/raypx/raypx-core?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![Bun](https://img.shields.io/badge/Bun-1.2.20-black?style=flat-square&logo=bun)](https://bun.sh/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-red?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Biome](https://img.shields.io/badge/Biome-linter%20%26%20formatter-yellow?style=flat-square&logo=biome)](https://biomejs.dev/)

> A modern web application platform built with Next.js and TypeScript for building AI-powered applications.

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Node.js >= 20 (for compatibility)

### Installation

```bash
# Clone the repository
git clone https://github.com/raypx/raypx.git
cd raypx

# Install dependencies with Bun
bun install

# Start development server
bun dev
```

Visit [raypx.com](https://dub.sh/raypx) to get started with the platform.

## 📚 Documentation

Comprehensive documentation is available at [docs.raypx.com](https://docs.raypx.com).

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.0 with React 19
- **Language**: TypeScript 5.9.2
- **Runtime & Package Manager**: Bun 1.2.20 ⚡
- **Monorepo**: Turborepo
- **UI Components**: Radix UI + Tailwind CSS (shadcn/ui)
- **Database**: Drizzle ORM
- **Authentication**: Custom auth system
- **Email**: Nodemailer
- **Cache**: Redis
- **Testing**: Vitest (with Bun native support)
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
