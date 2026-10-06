// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://84a85b982168d7d8b0629c7b2f2f2045@o4511542990471168.ingest.de.sentry.io/4511542998532176",

  // No Session Replay. It recorded one visit in ten, and every visit that
  // hit an error, and kept its session id in sessionStorage. Recording
  // someone's visit is not strictly necessary to provide the service, so
  // under PECR it needs consent, and the cookie policy tells visitors that
  // everything we store is strictly necessary and that there is no banner
  // because there is nothing to agree to. Adding Replay back means adding a
  // consent banner and rewriting app/cookies/page.tsx first.

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Off: see sentry.server.config.ts. In the browser it would add the
  // visitor's IP address to every event.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
