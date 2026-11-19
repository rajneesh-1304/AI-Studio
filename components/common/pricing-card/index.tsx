"use client";

import React from "react";
import { SignInButton } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { Button } from "@/components/ui/button";
import { BlueTitle, GrayTitle } from "@/components/reusables/reusable";
import { Check, ArrowRight } from "lucide-react";
import "./style.scss";

interface PricingPlan {
    key: string;
    label: string;
    description: string;
    price: number;
    featured: boolean;
    planId: string | null;
    active: boolean;
    features: readonly string[];
}

interface PricingProps {
    pricingProps: PricingPlan;
    isActive?: boolean;
    isDowngrade?: boolean;
    isSignedIn: boolean;
}

const PricingCard = ({
    pricingProps,
    isActive,
    isDowngrade,
    isSignedIn,
}: PricingProps) => {
    const {
        label,
        description,
        price,
        featured,
        planId,
        features,
    } = pricingProps;

    return (
        <div className={`pricing-card ${featured ? "pricing-card-featured" : ""}`}>
            {featured && (
                <div className="pricing-popular-wrapper">
                    <span className="pricing-popular-badge">
                        Most popular
                    </span>
                </div>
            )}

            <div className="pricing-card-header">
                <p className="pricing-card-label">{label}</p>

                {isActive && (
                    <span className="pricing-active-badge">
                        Active
                    </span>
                )}
            </div>

            <p className="pricing-card-description">
                {description}
            </p>

            <div className="pricing-card-price">
                <div className="pricing-card-price-value">
                    {price === 0 ? (
                        <GrayTitle>$0</GrayTitle>
                    ) : (
                        <BlueTitle>${price}</BlueTitle>
                    )}
                </div>

                {price > 0 && (
                    <span className="pricing-card-period">/mo</span>
                )}
            </div>

            <p className="pricing-card-billing">
                {price === 0 ? "Always free" : "Only billed monthly"}
            </p>

            <div className="pricing-card-features">
                {features.map((feature) => (
                    <div className="pricing-feature-row" key={feature}>
                        <div
                            className={`pricing-feature-icon-wrapper ${
                                featured
                                    ? "pricing-feature-icon-blue"
                                    : "pricing-feature-icon-gray"
                            }`}
                        >
                            <Check className="pricing-feature-icon" />
                        </div>

                        <span className="pricing-feature-name">
                            {feature}
                        </span>
                    </div>
                ))}
            </div>

            <div className="pricing-card-button-wrapper">
                {isActive ? (
                    <Button
                        disabled
                        className="pricing-card-button pricing-card-button-disabled"
                        variant="ghost"
                    >
                        ✓ Current plan
                    </Button>
                ) : price === 0 ? (
                    isSignedIn ? (
                        <Button
                            disabled
                            className="pricing-card-button pricing-card-button-disabled"
                            variant="ghost"
                        >
                            Default plan
                        </Button>
                    ) : (
                        <SignInButton mode="modal">
                            <Button
                                className="pricing-card-button pricing-card-button-outline"
                                variant="ghost"
                            >
                                Get started free
                                <ArrowRight className="pricing-card-arrow" />
                            </Button>
                        </SignInButton>
                    )
                ) : isSignedIn ? (
                    <CheckoutButton
                        planId={planId!}
                        planPeriod="month"
                        checkoutProps={{
                            appearance: {
                                elements: {
                                    drawerRoot: {
                                        zIndex: 2000,
                                    },
                                },
                            },
                        }}
                    >
                        <Button
                            className={`pricing-card-button ${
                                featured
                                    ? "pricing-card-button-featured"
                                    : "pricing-card-button-outline"
                            }`}
                            variant="ghost"
                        >
                            {isDowngrade ? "Downgrade" : "Get started"}
                            <ArrowRight className="pricing-card-arrow" />
                        </Button>
                    </CheckoutButton>
                ) : (
                    <SignInButton mode="modal">
                        <Button
                            className={`pricing-card-button ${
                                featured
                                    ? "pricing-card-button-featured"
                                    : "pricing-card-button-outline"
                            }`}
                            variant="ghost"
                        >
                            Get started
                            <ArrowRight className="pricing-card-arrow" />
                        </Button>
                    </SignInButton>
                )}
            </div>
        </div>
    );
};

export default PricingCard;
