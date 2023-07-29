---
slug: changelog-0.11.0
title: "Sentry Changelog: v0.11.0"
authors: josh
tags: [changelog]
---

Having returned from holidays I finished up #58 which involved a complete rewrite of Sentry to improve performance and debugging.

## Removed Features

There are a few breaking changes/removed features in this version. Should this result in a major version bump... yes ...but thankfully we use [ZeroVer](https://0ver.org/) (while I am joking, we aren't fully launched and so expect removed features).

### Malicious Domain Scanning

This feature has been removed temporarily while I work on overhauling it to link into the wider `AutoMod` system. I'll publish more details about it in a further blog post. However, for now, it's RIP SinkingYachts.

![RIP Automod](/img/blog/automod.jpg)

## New Additions

But hey, its not all sad, as we added a few more QOL features.

### Error Handling

Our commands now have some beautiful error handling. In the unlikely event that an issue occurs, you now recieve a fancy embed displaying issues. For internal errors we also automatically forward the issue to ourselves.

Its a minor change but yet welcome.

### 🧊 Frozen Punishments

The most exciting new feature is frozen punishments.

When you create a punishment, it is considered unfrozen. This allows moderators to modify it (such as changing the reason, duration, etc). This can be useful as it allows for details to be added later.

However this also introduces the potential possibility for corruption and hiding tracks. Therefore, punishments can be frozen (presently by any moderator, however with [Permissions V2](/docs/concepts/PermissionsV2) this will change to administrators and above). We will also eventually roll out a setting which can freeze punishments on creation.

When a punishment is frozen, it cannot be edited, nor can it be "thawed". This effectively locks the punishment so it cannot be modified.

You can read more about frozen punishments over on [our documentation site](/docs/concepts/Punishments#FrozenPunishments)

### DX Changes

We also worked on improving our developer experience. While I won't go into the exact details, our code has been simplified and we have modularised key functions to reduce code duplication.

We are also working on building our [contribution guide](https://github.com/PenPow/Sentry/blob/main/.github/CONTRIBUTING.md) as it is now heavily out of date.