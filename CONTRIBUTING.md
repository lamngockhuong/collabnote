# Contributing to CollabNote 🤝

Thank you for your interest in contributing to CollabNote! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/collabnote.git
   cd collabnote
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/lamngockhuong/collabnote.git
   ```

## 💻 Development Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up Supabase**:
   ```bash
   # Start Supabase local
   supabase start

   # Copy environment variables
   cp .env.example .env.local
   ```

3. **Run development server**:
   ```bash
   pnpm dev
   ```

## 🔨 Making Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Test your changes**:
   ```bash
   # Run RLS tests
   npx tsx scripts/test-rls.ts

   # Run pgTAP tests
   supabase test db

   # Check build
   pnpm build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

## 📤 Submitting Changes

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**:
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Submit!

3. **Wait for review**:
   - Address any feedback
   - Make requested changes
   - Push updates to your branch

## 📏 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes

### React/Next.js
- Use functional components with hooks
- Follow Next.js App Router conventions
- Use Server Components when possible

### Styling
- Use Tailwind CSS utility classes
- Follow existing design patterns
- Ensure responsive design

### Code Quality
- Run ESLint before committing
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions small and focused

### Testing
- Write tests for new features
- Update tests when modifying code
- Ensure all tests pass before submitting

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## 💡 Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:
- Clear description of the feature
- Why it's needed
- Proposed implementation
- Mockups/examples if applicable

## 📞 Questions?

- Open a [Discussion](https://github.com/lamngockhuong/collabnote/discussions)
- Check existing [Issues](https://github.com/lamngockhuong/collabnote/issues)

## 🙏 Thank You!

Your contributions make CollabNote better for everyone. We appreciate your time and effort!
