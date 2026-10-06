// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://84a85b982168d7d8b0629c7b2f2f2045@o4511542990471168.ingest.de.sentry.io/4511542998532176",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Off. On the server this attaches each request's cookies, headers and IP
  // address to every event, and the cookies include the httpOnly session
  // token, which would then sit in a third party's logs for the whole
  // retention period. The privacy policy promises Sentry "technical error
  // details", not that.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});
