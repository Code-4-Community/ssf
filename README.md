# Securing Safe Food

## Environment Setup

We use yarn for dependency management. Install app dependencies by running this command at the repo root (`ssf`):

```
yarn install
```

To set up your backend, follow the backend-specific instructions [here](apps/backend/README.md).

\*Note: you may need to prefix your `nx` commands with `npx`. For example, to serve the frontend, if:

```
nx serve frontend
```

doesn't work, try:

```
npx nx serve frontend
```

## Start the app

To start the development server, run one of the following commands:

- To run the frontend at http://localhost:4200/: `nx serve frontend`
- To run the backend at http://localhost:3000/: `nx serve backend`
  - The homepage includes the Swagger API documentation.

You can also run both the frontend and backend with one command:

```
nx run-many -t serve -p frontend backend
```

## CI (GitHub Actions)
On every push and pull request, GitHub Actions runs:

Prettier - checks formatting
Backend tests - Jest test suite
Local Commands
Prettier:

run yarn prettier:check  to verify formatting locally
run yarn prettier:write to fix formatting locally
Backend tests:
run 'npx jest` with test DB setup

The locally hosted frontend and backend will update live as you make changes to the code. Happy coding!
