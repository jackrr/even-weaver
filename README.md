# Even Weaver

A tool for cross-stitchers.

![Tests](https://github.com/jackrr/even-weaver/actions/workflows/test.yml/badge.svg)

## Running locally

### First time setup

1. Install [bun](https://bun.com/)
1. Clone this repo
1. Install deps: `bun install`
1. Bootstrap the db
   1. Run migrations: `bun sql db:migrate`
   1. Seeds: `bun sql db:seed:all`

### Running

1. Run the dev server: `bun dev`

### Updating data models

Note: this kinda sucks, because the generated migration and model files are js, not ts.

Basically just generating the file for the timestamped name... everything else is copy-pasted from prior migrations and entities.

`bun sql model:generate` # migration file and new model file
`bun sql migration:generate` # just a migration file

## Roadmap

### Nuts n bolts

- FIX: Reset client auth state on login/register (effect in auth context is not re-running)

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
