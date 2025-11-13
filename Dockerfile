FROM oven/bun:alpine
RUN apk update && apk add sqlite
WORKDIR /usr/bun/app

COPY package.json bun.lock /usr/bun/app/
RUN bun install

COPY package.json .
COPY sequelize-config.ts .
COPY tsconfig.json .
COPY bunfig.toml .
COPY src ./src/

# run the app
USER bun
EXPOSE 3000/tcp
CMD [ "bun", "serve_prod" ]
