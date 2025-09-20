import { z } from "zod";

const BillingProviderSchema = z.enum(["stripe", "lemon-squeezy", "paddle"]);

const LineItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number(),
  type: z.enum(["flat", "per_seat", "metered"]),
});

const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  paymentType: z.enum(["one_time", "recurring"]),
  interval: z.enum(["month", "year"]).optional(),
  lineItems: LineItemSchema.array(),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  currency: z.string(),
  badge: z.string().optional(),
  highlighted: z.boolean().optional(),
  plans: PlanSchema.array(),
  features: z.string().array(),
});

const BillingConfigSchema = z.object({
  provider: BillingProviderSchema,
  products: ProductSchema.array(),
});

// Sample billing configuration - replace with your actual configuration
const billingConfig = BillingConfigSchema.parse({
  provider: (process.env.NEXT_PUBLIC_BILLING_PROVIDER as any) ?? "stripe",
  products: [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for getting started",
      currency: "USD",
      badge: "Popular",
      plans: [
        {
          id: "starter-monthly",
          name: "Starter Monthly",
          paymentType: "recurring",
          interval: "month",
          lineItems: [
            {
              id: "starter-base",
              name: "Base",
              cost: 9.99,
              type: "flat",
            },
          ],
        },
        {
          id: "starter-yearly",
          name: "Starter Yearly",
          paymentType: "recurring",
          interval: "year",
          lineItems: [
            {
              id: "starter-base-yearly",
              name: "Base",
              cost: 99.99,
              type: "flat",
            },
          ],
        },
      ],
      features: ["Up to 5 projects", "Basic analytics", "Email support", "10GB storage"],
    },
    {
      id: "pro",
      name: "Pro",
      description: "For growing businesses",
      currency: "USD",
      badge: "Best Value",
      highlighted: true,
      plans: [
        {
          id: "pro-monthly",
          name: "Pro Monthly",
          paymentType: "recurring",
          interval: "month",
          lineItems: [
            {
              id: "pro-base",
              name: "Base",
              cost: 29.99,
              type: "flat",
            },
          ],
        },
        {
          id: "pro-yearly",
          name: "Pro Yearly",
          paymentType: "recurring",
          interval: "year",
          lineItems: [
            {
              id: "pro-base-yearly",
              name: "Base",
              cost: 299.99,
              type: "flat",
            },
          ],
        },
      ],
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "Priority support",
        "100GB storage",
        "AI features",
        "Team collaboration",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      currency: "USD",
      plans: [
        {
          id: "enterprise-monthly",
          name: "Enterprise Monthly",
          paymentType: "recurring",
          interval: "month",
          lineItems: [
            {
              id: "enterprise-base",
              name: "Base",
              cost: 99.99,
              type: "flat",
            },
          ],
        },
      ],
      features: [
        "Everything in Pro",
        "Custom integrations",
        "Dedicated support",
        "Unlimited storage",
        "Advanced security",
        "Custom branding",
        "SLA guarantee",
      ],
    },
  ],
});

export default billingConfig;
export { BillingProviderSchema };
