import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const isTest = process.env.NODE_ENV === "test";
if (!process.env.ARCJET_KEY && !isTest) {
  throw new Error("ARCJET_KEY env is required");
}

const aj = arcjet({
  key: isTest ? "ajkey_test_dummy" : process.env.ARCJET_KEY!,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: isTest ? "DRY_RUN" : "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: isTest ? "DRY_RUN" : "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
      mode: isTest ? "DRY_RUN" : "LIVE",
      interval: "2s",
      max: 5,
    }),
  ],
});

export default aj;
