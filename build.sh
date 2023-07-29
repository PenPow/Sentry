docker compose build --build-arg GIT_COMMIT=$(git rev-parse HEAD) --build-arg ENVIRONMENT="development"

docker compose up --force-recreate