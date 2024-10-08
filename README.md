# Securing Safe Food

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, a Smart, fast and extensible build system.](https://nx.dev)** ✨

## Environment Setup

Install app dependencies by running this at the repo root (`ssf`)

```
yarn install
```

To setup your backend, follow the backend-specific instructions [here](apps/backend/README.md)

*Note: you may need to prefix your `nx` commands with `npx`. For example, to serve the frontend, if:
```
nx serve frontend
```

doesn't work, try:

```
npx nx serve frontend
```

## Start the app

To start the development server run `nx serve frontend`. Open your browser and navigate to http://localhost:4200/. Happy coding!

## Running tasks

To run just the frontend (port 4200):

```
nx serve frontend
```

To run just the backend (port 3000):

```
nx serve backend
```

To run both the frontend and backend with one command:

```
nx run-many -t serve -p frontend backend
```

## Other commands

Run `git submodule update --remote` to pull the latest changes from the component library

When cloning the repo, make sure to add the `--recurse-modules` flag to also clone the component library submodule (e.g. `git clone --recurse-submodules https://github.com/Code-4-Community/scaffolding.git` for the `scaffolding` repo)
