FROM node:18-alpine

LABEL org.opencontainers.image.source="https://github.com/PenPow/Sentry"
LABEL org.opencontainers.image.description="Sentry's docker image"

ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT

ARG ENVIRONMENT='PRODUCTION'

ENV NODE_OPTIONS="--enable-source-maps"
ENV HUSKY=0
ENV CI=true

RUN apk add -q --no-cache libc6-compat openssl python3 g++ make

WORKDIR /usr/sentry

RUN addgroup --system --gid 1001 sentry && adduser --system --uid 1001 sentry

COPY .yarn/releases/* .yarn/releases/
COPY .yarn/plugins/ .yarn/plugins/
COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn --immutable --check-cache

COPY tsconfig.json  ./

COPY prisma/ prisma/
RUN yarn prisma generate

COPY src/ src/ 

RUN yarn run build

RUN chown sentry:sentry /usr/sentry
USER sentry

ENV NODE_ENV=$ENVIRONMENT
CMD [ "yarn", "run", "start:migrate" ]
