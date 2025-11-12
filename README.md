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

- Finish pattern structure refactor!

### Project view

- Clicking a cell toggles completion
- Click and hold or drag will pan the screen
- Opacity is lighter if completed
- Shift (or toggle to complete mode) + Click and drag marks selected rect complete
- Long press and double click/tap on cell trigger info popup
- Global floating/pinned menu
	- Pan mode vs completion mode
	- Toggle color vs symbol mode
	- Expandable key of colors + symbols

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
