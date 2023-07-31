// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/vsDark');

const a11yEmoji = require('@fec/remark-a11y-emoji');

module.exports = async function configCreatorAsync() {
    const remarkGfm = (await import("remark-gfm")).default
    const remarkGithub = (await import("remark-github")).default
    const math = (await import("remark-math")).default
    const katex = (await import("rehype-katex")).default

    /** @type {import('@docusaurus/types').Config} */
    const config = {
        title: 'Sentry Discord Bot',
        tagline: 'Customizable, Forever Free, No Exceptions.',
        favicon: 'img/favicon.ico',

        // Set the production url of your site here
        url: 'https://sentry.penpow.dev',
        // Set the /<baseUrl>/ pathname under which your site is served
        // For GitHub pages deployment, it is often '/<projectName>/'
        baseUrl: '/',

        plugins: [
            [
                '@docusaurus/plugin-ideal-image',
                {
                    quality: 70,
                    max: 1030, // max resized image's size.
                    min: 640, // min resized image's size. if original is lower, use that size.
                    steps: 2, // the max number of images generated between min and max (inclusive)
                    disableInDev: false,
                },
            ]
        ],

        // GitHub pages deployment config.
        // If you aren't using GitHub pages, you don't need these.
        organizationName: 'PenPow', // Usually your GitHub org/user name.
        projectName: 'Sentry', // Usually your repo name.

        onBrokenLinks: 'throw',
        onBrokenMarkdownLinks: 'warn',

        // Even if you don't use internalization, you can use this field to set useful
        // metadata like html lang. For example, if your site is Chinese, you may want
        // to replace "en" with "zh-Hans".
        i18n: {
            defaultLocale: 'en',
            locales: ['en'],
        },

        presets: [
            [
                'classic',
                /** @type {import('@docusaurus/preset-classic').Options} */
                ({
                    docs: {
                        sidebarPath: require.resolve('./sidebars.js'),
                        remarkPlugins: [remarkGfm, [remarkGithub, {
                            repository: 'PenPow/Sentry'
                        }], a11yEmoji, math],
						rehypePlugins: [katex],
                        // Please change this to your repo.
                        // Remove this to remove the "edit this page" links.
                        editUrl: 'https://github.com/PenPow/Sentry/tree/main/website',
                    },
                    blog: {
                        showReadingTime: true,
                        remarkPlugins: [remarkGfm, [remarkGithub, {
                            repository: 'PenPow/Sentry'
                        }], a11yEmoji, math],
						rehypePlugins: [katex],
                        // Please change this to your repo.
                        // Remove this to remove the "edit this page" links.
                        editUrl: 'https://github.com/PenPow/Sentry/tree/main/website',
                    },
                    theme: {
                        customCss: require.resolve('./src/css/custom.css'),
                    },
                }),
            ],
        ],

		stylesheets: [{
			href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
			type: 'text/css',
			integrity:
			'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
			crossorigin: 'anonymous',
		}],

		themes: ['@docusaurus/theme-mermaid'],
		markdown: {
			mermaid: true
		},

        themeConfig:
            /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
            ({
                // Replace with your project's social card
                image: 'img/docusaurus-social-card.jpg',
				colorMode: {
					respectPrefersColorScheme: true,
				},
				announcementBar: {
					id: 'new-docs',
					content: '🚀&nbsp;&nbsp;&nbsp;Welcome to our new documentation site',
					isCloseable: false,
					backgroundColor: '#4856F0',
					textColor: '#FFF'
				},
                navbar: {
					title: 'Sentry',
                    logo: {
                        alt: 'Sentry Logo',
						href: 'https://sentry.penpow.dev',
                        src: 'img/logo.png',
                    },
                    items: [{
                            type: 'docSidebar',
                            sidebarId: 'docsSidebar',
                            position: 'left',
                            label: 'Documentation',
                        },
                        {
                            to: '/blog',
                            label: 'Blog',
                            position: 'left'
                        },
                        {
                            href: 'https://github.com/PenPpow/Sentry',
                            label: 'GitHub',
                            position: 'right',
                        },
                    ],
                },
                footer: {
                    style: 'light',
                    links: [],
					logo: {
						alt: 'Sentry Logo',
						href: 'https://sentry.penpow.dev',
                        src: 'img/social-card.png',
					},
                    copyright: `Copyright © ${new Date().getFullYear()} Joshua Clements`,
                },
                prism: {
                    theme: lightCodeTheme,
                    darkTheme: darkCodeTheme,
                    additionalLanguages: [
                        "javascript",
                        "bash",
                        "diff",
                        "docker",
                        "ignore",
                        "jsstacktrace",
                        "json",
                        "markdown",
                        "mermaid",
                        "powershell",
                        "regex",
                        "shell-session",
                        "typescript",
                        "yaml"
                    ]
                },
            }),
    };

    return config;
}