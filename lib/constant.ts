
export const PLANS = {
  free: {
    label: "Free",
    credits: 10,
    price: 0,
  },
  starter: {
    label: "Starter",
    credits: 50,
    price: 9,
  },
  pro: {
    label: "Pro",
    credits: 150,
    price: 29,
  },
} as const;

export const CREDIT_COST_PER_GENERATION = 1;

export const MIN_CREDITS_TO_GENERATE = 1;

export const PRICING_PLANS = [
  {
    key: "free",
    label: "Free",
    description: "Explore AI-powered app development and bring your first ideas to life.",
    price: 0,
    featured: false,
    planId: null,
    active: true,
    features: [
      "10 AI generations per month",
      "Instant live preview",
      "Download project as ZIP",
    ],
  },
  {
    key: "starter",
    label: "Starter",
    description: "Everything you need to turn ideas into working applications.",
    price: 9,
    featured: true,
    planId: "cplan_3MJS0Ran1ikPGxXFfFTcHmuuY79",
    active: false,
    features: [
      "50 AI generations per month",
      "Screenshot and image uploads",
      "Real-time application preview",
      "Download complete source code",
      "AI-powered code improvements",
    ],
  },
  {
    key: "pro",
    label: "Pro",
    description: "Advanced capabilities for developers building and shipping faster.",
    price: 29,
    featured: false,
    planId: "cplan_3MJSGaC9AarfYCLEJNaPmQ4CqiZ",
    active: false,
    features: [
      "150 AI generations per month",
      "Priority AI processing",
      "Advanced live preview",
      "Complete source code export",
      "Screenshot and image uploads",
      "Access to Forge Pro Agent",
      "Advanced AI-powered code improvements",
    ],
  },
] as const;
