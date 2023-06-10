<div align="center">
	<br />
	<p>
		<a href="https://sentry.penpow.dev"><img src="https://cdn.penpow.dev/u/SentryTransparent.png" width="1638" alt="Sentry"/></a>
	</p>
	<h1>Contribution Guide</h1>
</div>

Thanks for taking the time to contribute!

This document sets out our general guidelines for contributing to Sentry. We ask that you follow them to ease the burden of maintaining Sentry.

#### Table of Contents

[Our Code of Conduct](#code-of-conduct)

[Project Structure](#explaining-our-tech-stack)

[How Can I Contribute?](#how-can-i-contribute)
- [Reporting Issues](#reporting-issues)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Code Contributions](#code-contributions)
- [Documentation](#documentation)

[Sentry's Style Guides](#style-guides)

[Our CLA](#our-cla)

### Code of Conduct

Sentry is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By contributing, you are expected to uphold the standards listed in it.

### Explaining our Tech Stack

We use [Sapphire](https://www.sapphirejs.dev/) as our framework to develop our bot, and we develop using [Docker Compose](https://docs.docker.com/compose/) in both production and development.

- **Database**: Postgresql (with [Prisma](https://www.prisma.io/) as our ORM)

#### Folder Structure

- `.git` > git tracking folder
- `.github` > Workflows + Development Documentation
- `.husky` > Our git hooks
- `.vscode` > VSCode setting patches
- `branding` > Sentry branding (logos)
  - All files located under this folder are licensed separately, view the license [here](../branding/LICENSE.md)
- `prisma` > Our database schema
- `src` > Our source code for Sentry

### How Can I Contribute?

#### Reporting Issues

If you think you have found a bug or issue with Sentry, please let us know so we can fix it and improve!

However, before opening an issue, please perform a quick search of all open and closed issues to see if this issue has already been reported.

#### Suggesting Enhancements

If you have a feature request or other enhancement for Sentry, then please open an issue after checking to ensure that this enhancement has not already been requested.

#### Code Contributions

To contribute code, please open a PR following our template.

Ensure your code follows our [style guidance](#style-guides), and ensure status checks are passing

If the checks fail due to an unrelated reason, just send a comment and we can investigate and fix the checks.

#### Documentation

We accept documentation/localisation improvements.

For documentation improvements, open a pull request modifying the documentation files.

For new localisations, please email me over at [josh@penpow.dev](mailto:josh@penpow.dev) or open an issue before contributing.

### Style Guides

#### Code

We use [eslint](https://eslint.org/) to lint and determine our style guidance. If importing built in node modules, please prefix them with the `node:` import resolver.

### Our CLA

We enforce the use of a CLA . You can view it [here](https://gist.github.com/PenPow/067b71595abffcce627016c6d309c7a0).