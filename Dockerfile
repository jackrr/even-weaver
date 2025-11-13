FROM oven/bun:1 AS base
RUN apt-get update && apt-get install -y sqlite3
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun test

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/sequelize-config.ts .
COPY --from=prerelease /usr/src/app/.sequelizerc .
COPY --from=prerelease /usr/src/app/tsconfig.json .
COPY --from=prerelease /usr/src/app/bunfig.toml .
COPY --from=prerelease /usr/src/app/src ./src/

# run the app
USER bun
EXPOSE 3000/tcp
CMD [ "bun", "serve_prod"]
