
## Tech Stack

### Core

-   [Typescript](https://typescriptlang.org) (Language)
-   [Next.js](https://nextjs.org) (React Framework)
-   [tRPC](https://trpc.io) (RPC Framework)
-   [Tanstack-Query](https://tanstack.com/query/latest) (Query Library)
-   [Prisma](https://prisma.io) (Database ORM)
-   [Postgres](https://www.postgresql.org/) (Database)
-   [MUI](https://mui.com) (React UI Framework)
-   [NextAuth.js](https://next-auth.js.org/) (Authentication)
-   [Anthropic](https://anthropic.com/) (Prompting)

### Util

-   [Zod](https://zod.dev/) (Schema Validation)
-   [Sendgrid](https://sendgrid.com/) (Email)
-   [DateFns](https://date-fns.org/) (Date Utility)
-   [React Hook Form](https://react-hook-form.com/) (Form Validation)

## Setup Instructions

### Mac Users

You need-

-   Homebrew: https://brew.sh/
-   Node 20: `brew install nvm && nvm install 20` (check console for instructions on adding nvm to your path)
-   Docker: https://docs.docker.com/desktop/install/mac-install/

### Windows Users

You need-

-   WSL2: https://learn.microsoft.com/en-us/windows/wsl/install
-   Node 20: https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating
-   Docker: https://docs.docker.com/desktop/install/windows-install/

Once you have that you can run:

`npm run setup` to configure everything needed to run the project. (installs dependencies and starts local db and file server)

Only need to do above once or if you want to reset your system.

If you face the following error-

> Error: P1001: Can't reach database server at `localhost`:`5432`

Run `npm run setup` again after 1-2 minutes.

To dev:

`npm run dev` will start a handful of helpful development tools like prisma studio, the next dev server, and will watch the prisma schema to regenerate the prisma client.

Login:

Admin Login

-   email: test+super@apricothealth.ai
-   password: a pillow for troy

Nurse Login

-   email: test@apricothealth.ai
-   password: a pillow for troy

  
Verification code:
123456

## Branching

-   branch off of staging (main is for prod)
-   use the linear copy branch name tool to name your branch based off your ticket

## PRs

-   PRs should be made to staging
-   Make sure someone is always assigned to the PR - that is the person the PR is waiting on
-   squash and merge - try to follow this format: "description of ticket: APR-1234"

## E2E testing

-   E2e tests will run in ci/cd, to run them locally:
-   `npm run dev:test` to start local server with env needed for testing
-   `npm run cypress` will open the cypress runner
-   click run e2e in the window that opens, then click the test you want to run
