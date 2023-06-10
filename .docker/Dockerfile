FROM node:18-alpine as builder

WORKDIR /usr/sentry/build

ENV HUSKY=0
ENV CI=true

RUN apk add -q --no-cache libc6-compat openssl python3 g++ make

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY .env tsconfig.json tsup.config.ts  ./
COPY src/ src/ 

RUN npm run build

FROM node:18-alpine as app

ENV NODE_OPTIONS="--enable-source-maps"
ENV NODE_ENV="production"
ENV HUSKY=0
ENV CI=true

RUN apk add -q --no-cache libc6-compat openssl python3 g++ make

WORKDIR /usr/sentry

RUN addgroup --system --gid 1001 sentry && adduser --system --uid 1001 sentry

COPY --from=builder /usr/sentry/build/package.json /usr/sentry/build/package-lock.json ./
COPY --from=builder /usr/sentry/build/node_modules node_modules/
COPY --from=builder /usr/sentry/build/dist dist/

# TODO: Enable prisma
# ADD prisma/ ./

# RUN npx prisma generate

RUN chown sentry:sentry /usr/sentry
USER sentry

CMD [ "npm", "run", "start" ]
