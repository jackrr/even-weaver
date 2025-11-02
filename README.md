# Even Weaver

A tool for cross-stitchers. 

## Running locally

1. Install [bun](https://bun.com/)
1. Clone this repo
1. Install deps: `bun install`
1. Run the dev server: `bun dev`

TODO: database setup stuff

## Roadmap

### Users and auth

- User model
  - Password system
- Token authentication

### Core gunk

- Data mapping of colors to threads

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

### Navigation

- Homepage lists current user's projects
- Login redirect on homepage
- Login page
- Sign up page
