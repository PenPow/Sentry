VERSION=`./node_modules/.bin/sentry-cli releases propose-version --org sentry-discord --project bot`

./node_modules/.bin/sentry-cli releases set-commits "$VERSION" --auto --org sentry-discord --project bot

./node_modules/.bin/sentry-cli sourcemaps inject dist/ --release=$VERSION --org sentry-discord --project bot
./node_modules/.bin/sentry-cli sourcemaps upload dist/ --release=$VERSION --org sentry-discord --project bot

./node_modules/.bin/sentry-cli releases finalize "$VERSION" --org sentry-discord --project bot