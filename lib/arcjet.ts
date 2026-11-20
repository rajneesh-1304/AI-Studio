import arcjet, {
  tokenBucket,
  detectPromptInjection,
  sensitiveInfo,
} from "@arcjet/next";


export const aj = arcjet({
  key: (process.env.ARCJET_KEY || process.env.ARCJET_API_KEY)!,
  characteristics: ["userId"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 60,
      capacity: 5,
    }),

    detectPromptInjection({
      mode: "LIVE",
    }),

  ],
});
