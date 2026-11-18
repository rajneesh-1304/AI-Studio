import React from 'react';
import './style.scss';
import { SectionHeading, SectionLabel } from '@/components/reusables/reusable';
import { STEPS } from '@/lib/data';

const Works = () => {
    return (
        <div className='px-4 pb-32'>
            <div className='heading'>
                <SectionLabel>How it works</SectionLabel>
                <SectionHeading
                    grayTitle="Four steps"
                    blueTitle="to a working app."
                />
            </div>
            <div className="steps-container">
                {STEPS.map((step, i) => (
                    <div key={step.number} className="step-row">
                        <div className="step-indicator">
                            <div className="step-number">
                                <span>{step.number}</span>
                            </div>

                            {i < STEPS.length - 1 && (
                                <div className="step-line" />
                            )}
                        </div>

                        <div className="step-content">
                            <p className="step-label">
                                {step.label}
                            </p>

                            <p className="step-description">
                                {step.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Works