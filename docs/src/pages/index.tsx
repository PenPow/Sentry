import React, { useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();

  useEffect(() => { process.env.NODE_ENV.toUpperCase() === "PRODUCTION" && (window.location.href = 'https://sentry.penpow.dev') }, [])

  return (
    <Layout
      title={siteConfig.title}
      description="Moderation made simple.">
    </Layout>
  );
}
