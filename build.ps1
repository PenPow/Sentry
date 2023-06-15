$Commit = git rev-parse HEAD

docker compose build --build-arg GIT_COMMIT="$Commit"

docker compose up --force-recreate