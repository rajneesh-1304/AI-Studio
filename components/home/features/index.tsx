import React from 'react'
import './style.scss'
import { SectionHeading, SectionLabel } from '@/components/reusables/reusable'
import { FEATURES } from '@/lib/data'

const Features = () => {
    return (
        <div className='px-4 pb-32'>
            <div className="heading">
                <SectionLabel>Everything you need</SectionLabel>
                <SectionHeading
                    grayTitle="From prompt"
                    blueTitle="to production."
                />
            </div>

            <div className="features-wrapper">
                {FEATURES.map(({ icon: Icon, label, desc }) => (
                    <div
                        key={label}
                        className='feature'
                    >
                        <div className='icon-wrapper'>
                            <Icon className='icon' />
                        </div>
                        <p className='label'>{label}</p>
                        <p className='description'>{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Features