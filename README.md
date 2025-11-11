# Even Weaver

A tool for cross stitchers.

![Tests](https://github.com/jackrr/even-weaver/actions/workflows/test.yml/badge.svg)

## Running locally

### First time setup

1. Install [bun](https://bun.com/)
1. Clone this repo
1. Install dependencies: `bun install`
1. Bootstrap the db
   1. Run migrations: `bun sql db:migrate`
   1. Seeds: `bun sql db:seed:all`

### Running

1. Run the dev server: `bun dev`

### Updating data models

Note: this kinda sucks, because the generated migration and model files are JavaScript, not TypeScript.

Basically just generating the file for the timestamped name... everything else is copy-pasted from prior migrations and entities.

`bun sql model:generate` # migration file and new model file
`bun sql migration:generate` # just a migration file

## Roadmap

### Navigation

- Homepage lists current user's projects

### Project view

- Client side nav of project with drag interactions
- Global menu
- Color and symbol key
- Tap toggle completion
- Opacity for completion feedback

### Project creation

- Client-side image uploading form submission (maybe resize image and generate payload in the client?)

### Polish

- Auth pages (login + sign-up)
- Nav bar (logout, username, site title, current context)
