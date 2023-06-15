VERSION=`./node_modules/.bin/sentry-cli releases propose-version`

./node_modules/.bin/sentry-cli releases set-commits "$VERSION" --auto

./node_modules/.bin/sentry-cli sourcemaps inject dist/
./node_modules/.bin/sentry-cli sourcemaps upload dist/

./node_modules/.bin/sentry-cli releases finalize "$VERSION"