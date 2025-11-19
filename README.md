# Even Weaver

A tool for cross stitchers.

![Tests](https://github.com/jackrr/even-weaver/actions/workflows/test.yml/badge.svg)

## Running locally

### First time setup

1. Install [bun](https://bun.com/)
1. Clone this repo
1. Install dependencies: `bun install`
1. Bootstrap the db: `bun run src/scripts/migrate.ts`

### Running

1. Run the dev server: `bun dev`

## Deploying

Build the docker image:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t jackratner/even-weaver --push . 
```

(Optional) Run the image locally to verify:

```bash
docker run -v ./tmp/:/usr/src/app/tmp/ --network host jackratner/even-weaver
```

## Roadmap

- Verify that generated cocteau twins color pallet matches Anna's project

### Bugs

- Some images (maybe vertical?) do not generate properly

### Polish

- Auth pages (login + sign-up)
  - Enter/return in inputs should submit form
  - Visual feedback on invalid credentials/create failure
- Header (logout, username, site title)
  - Make this somehow hidden but accessible on project detail page
- Create project form
- Project list page
- Make a favicon/logo

