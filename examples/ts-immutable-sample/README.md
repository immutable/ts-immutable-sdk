# Immutable Sample Application

Used for cross-module testing and dog fooding.

## Getting Started

```bash
yarn install
yarn playwright install
```

Create a `.env` by copying the `.env.example` file and filling in the values.

For VSCode, use the `../../../vscode.code-workspace` workspace to ensure intellisense works correctly.

## Testing

Inside that directory, you can run several commands:

  `yarn playwright test`
    Runs the end-to-end tests.

  `yarn playwright test --ui`
    Starts the interactive UI mode.

  `yarn playwright test --project=chromium`
    Runs the tests only on Desktop Chrome.

  `yarn playwright test example`
    Runs the tests in a specific file.

  `yarn playwright test --debug`
    Runs the tests in debug mode.

  `yarn playwright codegen`
    Auto generate tests with Codegen.

We suggest that you begin by typing:

    `yarn playwright test`

And check out the following files:
  - ./tests/example.spec.ts - Example end-to-end test
  - ./tests/demo-todo-app.spec.ts - Demo Todo App end-to-end tests
  - ./playwright.config.ts - Playwright Test configuration

Visit https://playwright.dev/docs/intro for more information. ✨

Happy hacking! 🎭
