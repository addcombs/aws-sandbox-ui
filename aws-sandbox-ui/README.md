# AWS Sandbox Frontend

Standalone Angular 20 application using Angular Material. The responsive shell has a top toolbar
and navigation sidenav; on narrow screens the sidenav becomes a dismissible overlay. The toolbar
theme control switches between light and dark themes.

The theme service uses the saved `aws-sandbox-theme` preference when available and otherwise
initializes from the operating system's color-scheme preference. User changes are saved in browser
local storage.

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

The Spring Boot API currently has no frontend contract wired into this application, so the
workspace page makes no API requests.
