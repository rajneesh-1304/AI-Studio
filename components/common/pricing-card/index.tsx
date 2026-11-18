import React from 'react';
import './style.scss';
import { Button } from '@/components/ui/button';
import { BlueTitle } from '@/components/reusables/reusable';
import { Check } from 'lucide-react';

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
    const { key, label, description, price, featured, planId, active, features } = pricingProps;
    return (
        <div className='card'>
            <div className="">

            </div>

            <div className='pricing'>
                <div className='pricing-label'>
                    <p className='label'>{label}</p>
                    {active && <span className='active-btn'>Active</span>}
                </div>
                <p  className='description'>{description}</p>
            </div>

            <div>
                <BlueTitle>${price}</BlueTitle>
                <span>{price > 0 && ' /mo'}</span>
                <p>{price === 0 ? "Always free" : "Only billed monthly"}</p>
            </div>

            <div>
                {
                    features.map((feature) => (
                        <div>
                            <div className='inline-flex'>
                                <Check />
                                <p>{feature}</p>
                            </div>
                        </div>
                    ))
                }
            </div>

            <Button disabled={active}>
                {active ?
                    "Current Plan" :
                    "Get Started"
                }
            </Button>

        </div>
    )
}

export default PricingCard