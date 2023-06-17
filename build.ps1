$Commit = git rev-parse HEAD

docker compose build --build-arg GIT_COMMIT="$Commit" --build-arg ENVIRONMENT="DEVELOPMENT"

docker compose up --force-recreate