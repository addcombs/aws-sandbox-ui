# AWS Sandbox Frontend

Standalone Angular 20 application using Angular Material. The responsive shell has a top toolbar
and navigation sidenav; on narrow screens the sidenav becomes a dismissible overlay. The toolbar
theme control switches between light and dark themes.

The theme service uses the saved `aws-sandbox-theme` preference when available and otherwise
initializes from the operating system's color-scheme preference. User changes are saved in browser
local storage.

Authentication uses Amazon Cognito managed login through Amplify Auth. The public user pool ID,
app client ID, hosted-login domain, and exact redirect URLs are configured in
`src/app/auth/cognito-auth.config.ts`. The app client must be a public SPA client with no secret and
must allow the OAuth authorization-code flow, the `openid`, `email`, and `profile` scopes, and each
configured callback and sign-out URL. New accounts can sign up through the hosted page and verify
their email there.

After sign-in, the Angular app sends the Cognito access token to `GET /api/me`. The API validates
the token and synchronizes that user's Cognito profile into PostgreSQL. The API CORS allowlist must
include the frontend origin and permit the `Authorization` request header.

## Run locally

From this directory, install dependencies and start the dev server:

```bash
npm install
npm start
```

The frontend runs at `http://localhost:4200/`.

## Build and tests

```bash
npm run build
npm test -- --no-watch --browsers=ChromeHeadless
```

The workspace page also provides a read-only health check for `GET /api/health`. This endpoint is
public; profile requests require a valid Cognito access token.
