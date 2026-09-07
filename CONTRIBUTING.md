# Contributing to Tidy

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/ericauzenne/tidy.git
cd tidy
npm install
cp .env.example .env   # add your GEMINI_API_KEY
npm run dev
```

## Workflow

1. **Fork** the repository and create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes.** Keep commits focused — one logical change per commit.
3. **Run a type check** before pushing:
   ```bash
   npm run lint
   ```
4. **Open a Pull Request** against `main` with a clear title and description of what changed and why.

## Guidelines

- **Code style** — TypeScript throughout. Follow the patterns already in the codebase (functional components, IPC for Electron ↔ renderer communication, no business logic in the renderer).
- **Electron security** — Keep `contextIsolation: true` and `nodeIntegration: false`. All Node.js access must go through the context bridge in `electron/preload.ts`.
- **AI features** — Any addition that calls the Gemini API must gracefully degrade when `GEMINI_API_KEY` is not set.
- **No new dependencies without discussion** — Open an issue first if you need to add a new package.

## Reporting Issues

Please open an issue on GitHub with:
- A clear title describing the problem
- Steps to reproduce
- Expected vs. actual behaviour
- Your OS and Node.js version
