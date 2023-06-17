# Shell Script to deploy Sentry
if [ -z "$GITHUB_BEARER_TOKEN" ]; then exit 1; fi

TAG_NAME=$(curl -L -H "Accept: application/vnd.github+json" -H "Authorization: Bearer $GITHUB_BEARER_TOKEN" -H "X-GitHub-Api-Version: 2022-11-28" "https://api.github.com/repos/PenPow/Sentry/releases/latest" | \
  jq .tag_name)

DEPLOYMENT_ID=$(curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_BEARER_TOKEN"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/PenPow/Sentry/deployments \
  -d "{\"ref\":\"$TAG_NAME\",\"description\":\"Watchtower Deployment\",\"environment\":\"production\"}" \
  | jq map(.id) | max)

curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_BEARER_TOKEN"\
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/PenPow/Sentry/deployments/$DEPLOYMENT_ID/statuses \
  -d '{"environment":"production","state":"success","description":"Successfully Deployed Sentry", "auto_inactive": true}'