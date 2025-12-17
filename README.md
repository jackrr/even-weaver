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

