import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

// Check if we are in a non-production environment
const isLocal = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
if (!process.env.ARCJET_KEY && !isLocal) {
  throw new Error("ARCJET_KEY env is required");
}

const aj = arcjet({
  key: isLocal ? "ajkey_test_dummy" : process.env.ARCJET_KEY!,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: isLocal ? "DRY_RUN" : "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: isLocal ? "DRY_RUN" : "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
      mode: isLocal ? "DRY_RUN" : "LIVE",
      interval: "2s",
      max: 5,
    }),
  ],
});

export default aj;
