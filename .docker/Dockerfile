FROM node:18-alpine

ENV NODE_OPTIONS="--enable-source-maps"
ENV HUSKY=0
ENV CI=true

RUN apk add -q --no-cache libc6-compat openssl python3 g++ make

WORKDIR /usr/sentry

RUN addgroup --system --gid 1001 sentry && adduser --system --uid 1001 sentry

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY .env tsconfig.json tsup.config.ts  ./
COPY prisma/ prisma/
COPY src/ src/ 

RUN npx prisma generate

RUN npm run build

RUN chown sentry:sentry /usr/sentry
USER sentry

ENV NODE_ENV="production"
CMD [ "npm", "run", "start" ]
