# Contributing to SketchRoom

Thank you for your interest in contributing to SketchRoom! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/sketchRoom.git
   cd sketchRoom/draw-app
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your database credentials and other required values
5. **Set up the database**:
   ```bash
   cd packages/db
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

## 📋 Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

Example: `feature/add-undo-redo`, `fix/canvas-zoom-bug`

### Making Changes

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes**:
   ```bash
   # Run linting
   pnpm lint
   
   # Run type checking
   pnpm check-types
   
   # Test the application
   pnpm dev
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add undo/redo functionality"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

Examples:
- `feat: add rectangle tool to canvas`
- `fix: resolve WebSocket connection timeout issue`
- `docs: update API documentation`

## 🎨 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes
- Use type aliases for unions and complex types

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings (or double quotes consistently)
- Use trailing commas in multi-line objects/arrays
- Use meaningful variable and function names
- Add comments for complex logic

### React/Next.js

- Use functional components with hooks
- Use TypeScript for component props
- Follow Next.js 15 App Router conventions
- Use server components when possible

### File Organization

- Keep components in the `components/` directory
- Use kebab-case for file names
- One component per file
- Export components as default when appropriate

## 🧪 Testing

Before submitting a PR, ensure:

1. **Code compiles** without TypeScript errors
2. **Linting passes**: `pnpm lint`
3. **Type checking passes**: `pnpm check-types`
4. **Manual testing** of your changes
5. **No console errors** in the browser

## 📚 Documentation

- Update README.md if you add new features or change setup instructions
- Add JSDoc comments for new functions and classes
- Update API documentation if you modify endpoints
- Include examples in your PR description

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description** of the bug
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Environment**:
   - OS and version
   - Node.js version
   - Browser and version (if frontend issue)
6. **Screenshots** (if applicable)
7. **Error messages** or console logs

## 💡 Feature Requests

For feature requests:

1. Check if the feature already exists or is planned
2. Open an issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain how it would benefit users

## 🔍 Code Review Process

1. All PRs require at least one approval
2. Address review comments promptly
3. Keep PRs focused - one feature/fix per PR
4. Keep PRs small when possible - break large changes into multiple PRs
5. Respond to feedback constructively

## 📦 Monorepo Structure

This project uses Turborepo. When making changes:

- **Frontend changes**: Work in `apps/excalidraw-frontend/`
- **Backend changes**: Work in `apps/http-backend/` or `apps/ws-backend/`
- **Shared code**: Work in `packages/`
- **Database changes**: Update `packages/db/prisma/schema.prisma` and create migrations

## 🚫 What Not to Do

- Don't commit `.env` files
- Don't commit `node_modules/`
- Don't commit build artifacts (`dist/`, `.next/`)
- Don't force push to shared branches
- Don't submit PRs with broken code
- Don't ignore linting or type errors

## ❓ Questions?

If you have questions:

1. Check existing issues and PRs
2. Open a new issue with the `question` label
3. Ask in the PR comments

## 🙏 Thank You!

Your contributions make SketchRoom better for everyone. Thank you for taking the time to contribute!

