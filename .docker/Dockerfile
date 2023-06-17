FROM node:18-alpine

ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT

ARG ENVIRONMENT='PRODUCTION'

ENV NODE_OPTIONS="--enable-source-maps"
ENV HUSKY=0
ENV CI=true

RUN apk add -q --no-cache libc6-compat openssl python3 g++ make jq curl

WORKDIR /usr/sentry

RUN addgroup --system --gid 1001 sentry && adduser --system --uid 1001 sentry

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY .env tsconfig.json  ./
COPY src/ src/ 

RUN npm run build

# TODO: Enable prisma
# ADD prisma/ ./

# RUN npx prisma generate

RUN chown sentry:sentry /usr/sentry
USER sentry

ENV NODE_ENV=$ENVIRONMENT
CMD [ "npm", "run", "start" ]
