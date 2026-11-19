"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import "./style.scss";
import { BlueTitle, GrayTitle } from "@/components/reusables/reusable";
import { PRICING_PLANS } from "@/lib/constant";

interface PricingModalProps {
    children: React.ReactNode;
    reason?: "credits" | "upgrade";
}

export function PricingModal({
    children,
    reason = "upgrade",
}: PricingModalProps) {
    const { isSignedIn, has } = useAuth();

    const title =
        reason === "credits" ? "You're out of credits" : "Upgrade your plan";

    const description =
        reason === "credits"
            ? "You've used all your credits. Upgrade to keep building."
            : "Choose a plan that fits how much you build.";

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
        <Dialog>
            <DialogTrigger className="pricingTrigger">
                {children}
            </DialogTrigger>

            <DialogContent className="pricingContent">
                <DialogHeader className="pricingHeader">
                    <DialogTitle className="pricingTitle">
                        <BlueTitle className="pricingMainTitle">
                            {title}
                        </BlueTitle>
                    </DialogTitle>

                    <DialogDescription className="pricingDescription">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="pricingGrid">
                    {PRICING_PLANS.map((plan) => {
                        const isActive =
                            isSignedIn && activePlanKey === plan.key;

                        const isDowngrade =
                            isSignedIn &&
                            activePlanKey !== null &&
                            !isActive &&
                            planOrder[plan.key] < planOrder[activePlanKey];

                        return (
                            <div
                                key={plan.key}
                                className={`pricingCard ${
                                    plan.featured ? "featured" : ""
                                }`}
                            >
                                {plan.featured && (
                                    <div className="popularBadgeWrapper">
                                        <span className="popularBadge">
                                            Most popular
                                        </span>
                                    </div>
                                )}

                                <div className="planNameWrapper">
                                    <p className="planName">{plan.label}</p>

                                    {isActive && (
                                        <span className="activeBadge">
                                            Active
                                        </span>
                                    )}
                                </div>

                                <p className="planDescription">
                                    {plan.description}
                                </p>

                                <div className="planPriceWrapper">
                                    <span className="planPrice">
                                        {plan.price === 0 ? (
                                            <GrayTitle>$0</GrayTitle>
                                        ) : (
                                            <BlueTitle>
                                                ${plan.price}
                                            </BlueTitle>
                                        )}
                                    </span>

                                    {plan.price > 0 && (
                                        <span className="pricePeriod">
                                            /mo
                                        </span>
                                    )}
                                </div>

                                <p className="billingText">
                                    {plan.price === 0
                                        ? "Always free"
                                        : "Only billed monthly"}
                                </p>

                                <div className="planFeatures">
                                    {plan.features.map((feature) => (
                                        <div
                                            key={feature}
                                            className="featureItem"
                                        >
                                            <div className="featureCheck">
                                                <Check />
                                            </div>

                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="planButtonWrapper">
                                    {isActive ? (
                                        <Button
                                            disabled
                                            className="planButton disabledButton"
                                            variant="ghost"
                                        >
                                            ✓ Current plan
                                        </Button>
                                    ) : plan.price === 0 ? (
                                        isSignedIn ? (
                                            <Button
                                                disabled
                                                className="planButton disabledButton"
                                                variant="ghost"
                                            >
                                                Default plan
                                            </Button>
                                        ) : (
                                            <SignInButton mode="modal">
                                                <Button
                                                    className="planButton outlineButton"
                                                    variant="ghost"
                                                >
                                                    Get started free
                                                    <ArrowRight />
                                                </Button>
                                            </SignInButton>
                                        )
                                    ) : isSignedIn ? (
                                        <CheckoutButton
                                            planId={plan.planId}
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
                                                className={`planButton ${
                                                    plan.featured
                                                        ? "blueButton"
                                                        : "outlineButton"
                                                }`}
                                                variant="ghost"
                                            >
                                                {isDowngrade
                                                    ? "Downgrade"
                                                    : "Upgrade"}
                                                <ArrowRight />
                                            </Button>
                                        </CheckoutButton>
                                    ) : (
                                        <SignInButton mode="modal">
                                            <Button
                                                className={`planButton ${
                                                    plan.featured
                                                        ? "blueButton"
                                                        : "outlineButton"
                                                }`}
                                                variant="ghost"
                                            >
                                                Upgrade
                                                <ArrowRight />
                                            </Button>
                                        </SignInButton>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
