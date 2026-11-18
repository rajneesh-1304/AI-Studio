
import React from 'react';
import './style.scss';
import { Button } from '@/components/ui/button';
import { BlueTitle, GrayTitle } from '@/components/reusables/reusable';
import { Check, ArrowRight } from 'lucide-react';

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
}

const PricingCard = ({ pricingProps }: PricingProps) => {
    const {
        label,
        description,
        price,
        featured,
        active,
        features
    } = pricingProps;

    return (
        <div className={`pricing-card ${featured ? 'pricing-card-featured' : ''}`}>

            {featured && (
                <div className="pricing-popular-wrapper">
                    <span className="pricing-popular-badge">
                        Most popular
                    </span>
                </div>
            )}

            <div className="pricing-card-header">
                <p className="pricing-card-label">{label}</p>

                {active && (
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
                {price === 0 ? 'Always free' : 'Only billed monthly'}
            </p>

            <div className="pricing-card-features">
                {features.map((feature) => (
                    <div className="pricing-feature-row" key={feature}>
                        <div className={`pricing-feature-icon-wrapper ${featured ? 'pricing-feature-icon-blue' : 'pricing-feature-icon-gray'}`}>
                            <Check className="pricing-feature-icon" />
                        </div>

                        <span className="pricing-feature-name">
                            {feature}
                        </span>
                    </div>
                ))}
            </div>

            <Button
                disabled={active}
                className={`pricing-card-button ${featured ? 'pricing-card-button-featured' : ''}`}
                variant="ghost"
            >
                {active ? '✓ Current plan' : 'Get started'}

                {!active && (
                    <ArrowRight className="pricing-card-arrow" />
                )}
            </Button>

        </div>
    );
};

export default PricingCard;
