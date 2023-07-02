---
title: "Sentry Changelog: v0.10.0"
authorName: PenPow
authorIcon: https://cdn.penpow.dev/u/dhuzy0.png
date: 2023-06-24
layout: blog
excerpt: Have a peek at the latest features added to Sentry in release v0.10.0
---

<script>
  import { Alert } from 'flowbite-svelte';
</script>

Besides this new snazzy new website, Sentry v0.10.0 brings us two major features of interest: [Voice Mutes/Deafens](#voice-mutesdeafens) and [Malicious Domain Scanning](#malicious-domain-scanning).

We also spent a lot of time on both this and prior updates to improve our development experience with Sentry, especially in regards to deployment. You can read more about these changes [here](#dx-behind-the-scenes-changes).

You can also see our [roadmap](#our-roadmap-for-the-future) of future additions and changes.

## Voice Mutes/Deafens

Ever wanted to moderate a user only in voice channels, without restricting them from your wider server? This release brings this functionality into Sentry.

This introduces two new punishment options:

- /vmute
- /vdeafen

which mute and deafen the user respectively.

As with other most punishments, they do support expirations so no more muting a member and forgetting about it!

*This feature was added in #49*

## Malicious Domain Scanning

Likely the more interesting of the two features added is malicious domain scanning, added in #44.

In addition to adding our primative automod support - something which will be built upon in later releases - it added URL scanning via [SinkingYachts](https://phish.sinking.yachts).

<Alert color="blue">
  <svg slot="icon" aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
  Domains are matched and checked <em>locally</em> to ensure privacy. They are not logged, nor do they ever leave Sentry to be sent to SinkingYachts.
</Alert>

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

![Our release workflow](https://cdn.penpow.dev/u/ea7990fd-c4e5-4b61-883e-71ede424ce23.png)

However, we also needed a way to embed into our docker images what release they were running so that they can then tell sentry and the sources can be correctly mapped. We added a workflow which then builds the docker image, using the commit SHA as a build argument before it then gets embedded as an env variable.

![Our new release workflow](https://cdn.penpow.dev/u/c7676de1-361e-46e4-8311-0ae3f341a0ef.png)

And as you can tell this workflow was getting incredibly chunky. We weren't done there however. Now we had the infrastructure to push a docker update to github and build the sourcemaps, we decided to go all in on our continuous delivery by adding one final job to this workflow.

This job also coincided with a sidecar docker image. After all the deployment happens externally, we make a request to this sidecar container (known as [Watchtower](https://containrrr.dev/watchtower/)), which forces it to pull the new image and restart automatically.

This brings our workflow up to this:

![Final workflow](https://cdn.penpow.dev/u/25b64673-8149-4f8b-8c9c-ab2530ed9a98.png)

139 lines of a monstrosity of a deployment system. We even added a small integration to show the deployment status on our repository - something normally only done by automated build tools such as Vercel and Netlify.

![Our environment integration](https://cdn.penpow.dev/u/e37f3ed6-4fe7-4c50-bc72-091b0d33ef5c.png)

This took a while to build, however surprisingly after just... *checks notes* ... 7 test workflows we got it working in a fairly stable manner. This means that from now on I never have to touch the server to deploy Sentry which I am incredibly pleased about. 

## Our Roadmap for the Future

Sentry remains at prerelease level, as we still have a lot of features to work on.

You can view our [list of issues](https://github.com/PenPow/Sentry/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) for more details.

In the next Sentry release we plan on launching

- A proper dashboard integration - tracked in #45
- Proper settings system
- Permissions V2 - tracked in #7

See you next update!