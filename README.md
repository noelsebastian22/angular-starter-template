# Angular Starter Template

A highly configurable Angular 20+ starter template focused on developer productivity and scalability.

This project is designed to be your go-to foundation for real-world projects or take-home assignments.
It includes pre-configured tools and best practices to help you build, test, lint, and ship high-quality Angular applications.

---

## 🚀 Features

### ✅ Angular 20+

Built with the latest Angular standalone architecture and `ApplicationConfig` setup (no `AppModule`).

### ✅ NgRx

State management with NgRx:

- `StoreModule` and `EffectsModule` included in `app.config.ts`
- Feature-based store structure (e.g., `auth`)
- Local storage synchronization using `ngrx-store-localstorage`

### ✅ Folder Structure

Scalable and clean structure:

```
src/
├── app/
│   ├── core/               # Core services & utilities
│   ├── features/           # Feature modules (e.g., auth)
│   ├── infrastructure/     # Infrastructure layer (HTTP, external services)
│   ├── shared/             # Shared reusable components & directives
│   ├── store/              # Global state (if any)
│   └── styles/             # Global SCSS (reset, variables, etc.)
```

### ✅ ESLint

Configured with `@angular-eslint/schematics` using `eslint.config.js`, includes:

- TypeScript rules
- Angular-specific linting
- Inline template linting
- Accessibility recommendations

### ✅ Prettier

- Prettier configured to auto-format code
- Works seamlessly with ESLint (no conflicting rules)
- Includes `.prettierrc` and `.prettierignore`

### ✅ Husky + Lint-staged

Git hooks to prevent bad commits:

- Pre-commit: runs `lint-staged` to auto-fix and lint staged files
- Commit-msg: validates commit message format using custom Conventional Commit linter

### ✅ Commit Linting (Custom Script)

Enforces [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

- Implemented in `scripts/validate-commit-msg.js`
- Types: `feat`, `fix`, `docs`, `chore`, `test`, etc.
- Scope optional
- Supports multi-line body and footers
- Integrated with Husky's `commit-msg` hook

### ✅ Unit Testing with Jest

- Replaces Karma with Jest
- Simple and fast test runner
- Pre-configured for new apps and scalable tests

### ✅ Infrastructure Layer

Clean separation of infrastructure concerns:

- `infrastructure/http/` - HTTP client abstractions and utilities
- Resource abstract class for standardized API interactions
- Type-safe HTTP service base class with CRUD operations
- Built-in error handling and query parameter support

---

## 📦 Getting Started

1. **Clone the Template**

```bash
degit your-github-username/angular-starter-template my-app
cd my-app
```

2. **Install Dependencies**

```bash
npm install
```

3. **Setup Husky**

```bash
npm run prepare
```

4. **Start the App**

```bash
npm run start
```

---

## 📁 Scripts Overview

| Script           | Description                          |
| ---------------- | ------------------------------------ |
| `start`          | Start the development server         |
| `lint`           | Run ESLint                           |
| `format`         | Format code using Prettier           |
| `test`           | Run unit tests using Jest            |
| `prepare`        | Initialize Husky hooks               |
| `prettier:check` | Check for Prettier formatting issues |
| `prettier:write` | Auto-fix Prettier formatting issues  |

---

## 🔧 Future Enhancements

- GitHub Actions CI pipeline
- E2E testing with Playwright
- PWA support
- Theming and dark mode toggle

---

## 🙌 Contributing

Feel free to fork and extend this template for your projects. PRs are welcome!

---

## 📝 License

[MIT](LICENSE)

---

> Built with ❤️ by Noel Sebastian
