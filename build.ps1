$Commit = git rev-parse HEAD

docker compose build --build-arg GIT_COMMIT="$Commit" --build-arg ENVIRONMENT="DEVELOPMENT"

if(!$?) { Exit $LASTEXITCODE }

docker compose up --force-recreate