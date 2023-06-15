docker compose build --build-arg GIT_COMMIT=$(git rev-parse HEAD)

docker compose up --force-recreate