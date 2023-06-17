docker compose build --build-arg GIT_COMMIT=$(git rev-parse HEAD) --build-arg ENVIRONMENT="DEVELOPMENT"

docker compose up --force-recreate