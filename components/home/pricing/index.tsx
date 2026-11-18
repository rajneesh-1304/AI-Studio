import { SectionHeading, SectionLabel } from '@/components/reusables/reusable'
import React from 'react'
import './style.scss';
import PricingCard from '@/components/common/pricing-card';
import { PRICING_PLANS } from '@/lib/constant';

const Pricing = () => {
    return (
        <div className='px-4 pb-32'>
            <div className="heading">
                <SectionLabel>
                    Simple pricing
                </SectionLabel>
                <SectionHeading
                    grayTitle='Start free,'
                    blueTitle='scale when ready.'
                >
                </SectionHeading>
                <p className='pricing-wrapper'>No credit card required. Upgrade or downgrade anytime.</p>
            </div>

            <div>
                {PRICING_PLANS.map((plan) => (
                    <PricingCard key={plan.key} pricingProps={plan}/>
                ))} 
            </div>
        </div>
    )
}

export default Pricing