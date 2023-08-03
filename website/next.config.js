const { withSentryConfig } = require("@sentry/nextjs");
const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
	poweredByHeader: false,
	productionBrowserSourceMaps: true,
	
	images: {
		domains: ['www.penpow.dev']
	}
}

module.exports = withContentlayer(withSentryConfig(
	nextConfig,
  {
    silent: true,

    org: "sentry-discord",
    project: "website",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
));
