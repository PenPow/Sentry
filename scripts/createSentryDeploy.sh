VERSION=`./node_modules/.bin/sentry-cli releases propose-version --org sentry-discord --project bot`

./node_modules/.bin/sentry-cli releases deploys "$VERSION" -e PRODUCTION --org sentry-discord --project bot