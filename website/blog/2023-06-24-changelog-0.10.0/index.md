---
slug: changelog-0.10.0
title: "Sentry Changelog: v0.10.0"
authors: josh
tags: [changelog]
---

Besides this new snazzy website, Sentry v0.10.0 brings us two major features of interest: [Voice Mutes/Deafens](#voice-mutesdeafens) and [Malicious Domain Scanning](#malicious-domain-scanning).

We also spent a lot of time on both this and prior updates to improve our development experience with Sentry, especially in regards to deployment. You can read more about these changes [here](#dx-behind-the-scenes-changes).

You can also see our [roadmap](#our-roadmap-for-the-future) of future additions and changes.

## Voice Mutes/Deafens

Ever wanted to moderate a user only in voice channels, without restricting them from your wider server? This release brings this functionality into Sentry.

This introduces two new punishment options:

- /vmute
- /vdeafen

which mute and deafen the user respectively.

As with other most punishments, they do support expirations so no more muting a member and forgetting about it!

_This feature was added in #49_

## Malicious Domain Scanning

Likely the more interesting of the two features added is malicious domain scanning, added in #44.

In addition to adding our primative automod support - something which will be built upon in later releases - it added URL scanning via [SinkingYachts](https://phish.sinking.yachts).

:::note
Domains are matched and checked <em>locally</em> to ensure privacy. They are not logged, nor do they ever leave Sentry to be sent to SinkingYachts.
:::

After a detection we automatically create a new punishment to remove the user.

## DX: Behind the Scenes Changes

Neither of the features added were massive as it was done in the shadow of #10 - a PR which I wish to never write again.

A major issue that we had was that we utilised a couple bits of software that depended on knowing what release we are on, namely [Sentry](https://sentry.io/welcome/) (I swear I didn't steal their name - it was a coincidence).

Sentry handles our error management, and so when we have an issue in production, we get a notification with all the details. It's not a perfect system, and it will be worked on in the future, however presently it gets the job done.

![One of our releases](https://cdn.penpow.dev/u/1bc70554-b5b6-4046-9fbf-48c0c9a20115.png)

When we push our code to production, we also have to push our "sourcemaps" over to Sentry. These allow us to map our minified and "translated" code back to what we originally are working with. This makes it a lot easier to see the source of the issues.

You can see the difference with one of our files here.

![Unmapped vs source](https://cdn.penpow.dev/u/1b68e6cd-25e2-45ed-a2c3-259ed9295def.png)

The two look nothing alike, and so we map what the error shows to what our source code is. Alas, this requires us to push source maps each time we create a new release.

```yaml title=".github/workflows/CD.yml"
name: Continuous Delivery

on:
  release:
    types: [published]

jobs:
  sentry:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Project
        uses: actions/checkout@v3
      
      - name: Add problem matcher
        run: echo "::add-matcher::.github/problemMatchers/tsc.json"

      - name: Use Node.js v18
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
          registry-url: https://registry.npmjs.org/

      - name: Install Dependencies
        run: npm ci

      - name: Build Code
        run: npx tsc

      - name: Authenticate Sentry
        run: ./node_modules/.bin/sentry-cli login --auth-token ${{ secrets.SENTRY_AUTH_TOKEN }}

      - name: Upload Sentry Release
        run: |
          chmod +x ./scripts/buildSentryRelease.sh
          ./scripts/buildSentryRelease.sh
        shell: bash
```

However, we also needed a way to embed into our docker images what release they were running so that they can then tell sentry and the sources can be correctly mapped. We added a workflow which then builds the docker image, using the commit SHA as a build argument before it then gets embedded as an env variable.

```yaml title=".github/workflows/CD.yml"
name: Continuous Delivery

on:
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  docker:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - name: Sentry
            dockerfile: Dockerfile
            image: ghcr.io/penpow/sentry

    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout Project
        uses: actions/checkout@v3
      
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log into registry ${{ env.REGISTRY }}
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v3
        with:
          images: ${{ matrix.image }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          file: docker/${{ matrix.dockerfile }}
          push: true
          build-args: |
            ENVIRONMENT=production
            GIT_COMMIT=${{ github.sha }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

      - name: Image digest
        if: ${{ !failure() }}
        run: echo ${{ steps.docker_build.outputs.digest }}

  sentry:
    runs-on: ubuntu-latest
    needs: [docker]

    steps:
      - name: Checkout Project
        uses: actions/checkout@v3
      
      - name: Add problem matcher
        run: echo "::add-matcher::.github/problemMatchers/tsc.json"

      - name: Use Node.js v18
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
          registry-url: https://registry.npmjs.org/

      - name: Install Dependencies
        run: npm ci

      - name: Build Code
        run: npx tsc

      - name: Authenticate Sentry
        run: ./node_modules/.bin/sentry-cli login --auth-token ${{ secrets.SENTRY_AUTH_TOKEN }}

      - name: Upload Sentry Release
        run: |
          chmod +x ./scripts/buildSentryRelease.sh
          ./scripts/buildSentryRelease.sh
        shell: bash
```

And as you can tell this workflow was getting incredibly chunky. We weren't done there however. Now we had the infrastructure to push a docker update to github and build the sourcemaps, we decided to go all in on our continuous delivery by adding one final job to this workflow.

This job also coincided with a sidecar docker image. After all the deployment happens externally, we make a request to this sidecar container (known as [Watchtower](https://containrrr.dev/watchtower/)), which forces it to pull the new image and restart automatically.

This brings our workflow up to this:

```yaml title=".github/workflows/CD.yml"
name: Continuous Delivery

on:
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  docker:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - name: Sentry
            dockerfile: Dockerfile
            image: ghcr.io/penpow/sentry

    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout Project
        uses: actions/checkout@v3
      
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log into registry ${{ env.REGISTRY }}
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v3
        with:
          images: ${{ matrix.image }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          file: docker/${{ matrix.dockerfile }}
          push: true
          build-args: |
            ENVIRONMENT=production
            GIT_COMMIT=${{ github.sha }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

      - name: Image digest
        if: ${{ !failure() }}
        run: echo ${{ steps.docker_build.outputs.digest }}

  sentry:
    runs-on: ubuntu-latest
    needs: [docker]

    steps:
      - name: Checkout Project
        uses: actions/checkout@v3
      
      - name: Add problem matcher
        run: echo "::add-matcher::.github/problemMatchers/tsc.json"

      - name: Use Node.js v18
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
          registry-url: https://registry.npmjs.org/

      - name: Install Dependencies
        run: npm ci

      - name: Build Code
        run: npx tsc

      - name: Authenticate Sentry
        run: ./node_modules/.bin/sentry-cli login --auth-token ${{ secrets.SENTRY_AUTH_TOKEN }}

      - name: Upload Sentry Release
        run: |
          chmod +x ./scripts/buildSentryRelease.sh
          ./scripts/buildSentryRelease.sh
        shell: bash

  deployment:
    runs-on: ubuntu-latest
    needs: [docker, sentry]
    permissions:
      deployments: write

    steps:
      - uses: chrnorm/deployment-action@v2
        name: Create Deployment
        id: deployment
        with:
          token: '${{ github.token }}'
          initial-status: 'in_progress'
          ref: ${{ github.sha }}
          sha: ${{ github.sha }}
          auto-inactive: false
          environment: Production Bot

      - name: Deploy Stage
        uses: fjogeleit/http-request-action@v1
        with:
          url: ${{ secrets.SENTRY_DEPLOYMENT_HTTP_URL }}
          timeout: 3600000
          method: 'GET'
          customHeaders: '{"Authorization": "Bearer updatesentry"}'

      - name: Update Deployment Status
        if: success()
        id: update_deployment_success
        uses: chrnorm/deployment-status@v2
        with:
          token: '${{ github.token }}'
          auto-inactive: true
          state: 'success'
          deployment-id: ${{ steps.deployment.outputs.deployment_id }}

      - name: Update deployment status (failure)
        if: failure()
        uses: chrnorm/deployment-status@v2
        with:
          token: '${{ github.token }}'
          state: 'failure'
          deployment-id: ${{ steps.deployment.outputs.deployment_id }}

      - name: Create Deployment on Sentry
        if: steps.update_deployment_success.outcome == 'success'
        run: |
          chmod +x ./scripts/buildSentryRelease.sh
          ./scripts/buildSentryRelease.sh
        shell: bash
```

139 lines of a monstrosity of a deployment system. We even added a small integration to show the deployment status on our repository - something normally only done by automated build tools such as Vercel and Netlify.

![Our environment integration](https://cdn.penpow.dev/u/e37f3ed6-4fe7-4c50-bc72-091b0d33ef5c.png)

This took a while to build, however surprisingly after just... _checks notes_ ... 7 test workflows we got it working in a fairly stable manner. This means that from now on I never have to touch the server to deploy Sentry which I am incredibly pleased about.

## Our Roadmap for the Future

Sentry remains at prerelease level, as we still have a lot of features to work on.

You can view our [list of issues](https://github.com/PenPow/Sentry/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) for more details.

In the next Sentry release we plan on launching

- A proper dashboard integration - tracked in #45
- Proper settings system
- Permissions V2 - tracked in #7

See you next update!