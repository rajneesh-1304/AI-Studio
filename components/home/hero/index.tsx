
import React from 'react';
import styles from './style.module.scss';
import { HoleBackground } from '@/components/animate-ui/backgrounds/hole';
import { SectionHeading } from '@/components/reusables/reusable';

const Hero = () => {
    return (
        <div className='hero'>
            <HoleBackground
                style={{
                    maskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
                }}
                className={`absolute inset-0 h-full w-full blur-md ${styles.holeBackground}`} 
                strokeColor="rgba(255,255,255,0.05)"
            />

            <div className='hero-container'>
                <div className='hero-heading'>
                    <span></span>
                    <p>Powered by Agentic AI</p>
                </div>

                <div >
                    <SectionHeading
                        grayTitle='Forge your dream'
                        blueTitle='from a single prompt.'
                    >
                    </SectionHeading>
                </div>

                <p>Describe what you want to build. AI writes the code, picks the packages, and renders a live preview all inside your browser.</p>

                <div>
                    <div>
                        <textarea name="" placeholder='A task manager ' id=""></textarea>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Hero;
