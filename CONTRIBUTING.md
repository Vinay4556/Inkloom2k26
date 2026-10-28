# Contributing to Inkloom

Thank you for your interest in contributing to Inkloom! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Inloom2k26.git
   cd Inloom2k26
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Run the Development Server

```bash
cd frontend
npm run dev
```

### Run Tests

```bash
cd backend
npm test
```

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint` before committing
- Write meaningful commit messages

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat: add export functionality to dashboard
fix: resolve validation engine edge case
docs: update API documentation
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to reproduce** - How to trigger the bug
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - OS, Node version, browser, etc.
6. **Screenshots** - If applicable

## ✨ Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists
2. Search existing issues to avoid duplicates
3. Clearly describe the feature and its use case
4. Explain why this feature would be useful

## 🔍 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass** (`npm test`)
4. **Update CHANGELOG.md** with your changes
5. **Request review** from maintainers

### PR Guidelines

- Keep PRs focused on a single feature/fix
- Write clear PR descriptions
- Link related issues
- Respond to review feedback promptly

## 📚 Project Structure

```
Inloom2k26/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # Pages and API routes
│   │   ├── components/ # React components
│   │   └── lib/       # Utilities
│   └── public/        # Static assets
├── backend/           # Node.js backend (copied to frontend/src/backend)
│   ├── src/
│   │   ├── services/  # Business logic
│   │   └── store/     # Data persistence
│   └── tests/         # Backend tests
└── .opencode/         # AI skills and references
```

## 🎯 Areas We Need Help

- **UI/UX improvements** - Make the interface more intuitive
- **Performance optimization** - Speed up validation and rendering
- **Documentation** - Improve guides and API docs
- **Testing** - Increase test coverage
- **Accessibility** - Enhance WCAG compliance
- **Internationalization** - Add multi-language support
- **Integrations** - Connect with Slack, Teams, Figma, etc.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Questions?

- Open a [GitHub Discussion](https://github.com/Vinay4556/Inloom2k26/discussions)
- Check existing issues
- Contact the maintainers

## 🙏 Thank You!

Your contributions make Inkloom better for everyone. We appreciate your time and effort!
