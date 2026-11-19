"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import { SectionHeading, SectionLabel } from "@/components/reusables/reusable";
import "./style.scss";
import PricingCard from "@/components/common/pricing-card";
import { PRICING_PLANS } from "@/lib/constant";

const Pricing = () => {
    const { isSignedIn, has } = useAuth();

    const planOrder: Record<string, number> = {
        free: 0,
        starter: 1,
        pro: 2,
    };

    const activePlanKey = isSignedIn
        ? has?.({ plan: "pro" })
            ? "pro"
            : has?.({ plan: "starter" })
                ? "starter"
                : "free"
        : null;

    return (
        <section className="pricing-section">
            <div className="heading">
                <SectionLabel>Simple pricing</SectionLabel>

                <SectionHeading
                    grayTitle="Start free,"
                    blueTitle="scale when ready."
                />

                <p className="pricing-wrapper">
                    No credit card required. Upgrade or downgrade anytime.
                </p>
            </div>

            <div className="pricing-plan">
                {PRICING_PLANS.map((plan) => {
                    const isActive =
                        isSignedIn && activePlanKey === plan.key;

                    const isDowngrade =
                        isSignedIn &&
                        activePlanKey !== null &&
                        !isActive &&
                        planOrder[plan.key] < planOrder[activePlanKey];

                    return (
                        <PricingCard
                            key={plan.key}
                            pricingProps={plan}
                            isActive={isActive}
                            isDowngrade={isDowngrade}
                            isSignedIn={!!isSignedIn}
                        />
                    );
                })}
            </div>
        </section>
    );
};

export default Pricing;