# Even Weaver

A tool for cross-stitchers.

## Running locally

### First time setup

1. Install [bun](https://bun.com/)
1. Clone this repo
1. Install deps: `bun install`
1. Bootstrap the db: `bun sql db:migrate`

### Running

1. Run the dev server: `bun dev`

## Roadmap

### Navigation

- Homepage lists current user's projects
- Login page
- Sign up page

### Project view

- Client side nav of project w/ drag interactions
- API to fetch project state (return everything)
- API to update state (require full state send)
- Global menu
- Color and symbol key
- Tap toggle completion
- Opacity for completion feedback

### Project creation

- Image -> project pipeline
- PDF -> project pipeline
- Client-side image uploader
