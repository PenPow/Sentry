FROM node:18-alpine as builder

WORKDIR /usr/sentry/build

ENV HUSKY=0
ENV CI=true

RUN apk add -q --no-cache libc6-compat openssl python3 g++ make

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY .env tsconfig.json tsup.config.ts  ./
COPY src/ src/ 

RUN pnpm run build

FROM node:18-alpine as app

ENV NODE_OPTIONS="--enable-source-maps"
ENV NODE_ENV="production"
ENV HUSKY=0
ENV CI=true

RUN apk add -q --no-cache libc6-compat openssl python3 g++ make

WORKDIR /usr/sentry

RUN addgroup --system --gid 1001 sentry && adduser --system --uid 1001 sentry

RUN npm i -g pnpm

COPY --from=builder /usr/sentry/build/package.json /usr/sentry/build/pnpm-lock.yaml ./
COPY --from=builder /usr/sentry/build/node_modules node_modules/
COPY --from=builder /usr/sentry/build/dist dist/

# TODO: Enable prisma
# ADD prisma/ ./

# RUN pnpm exec prisma generate

RUN chown sentry:sentry /usr/sentry
USER sentry

CMD [ "pnpm", "run", "start" ]
