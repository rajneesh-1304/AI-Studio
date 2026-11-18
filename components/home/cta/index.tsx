
import React from 'react';
import './style.scss';
import { HoleBackground } from '@/components/animate-ui/backgrounds/hole';
import { SectionHeading } from '@/components/reusables/reusable';
import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const CTA = () => {
    return (
        <section className="cta-section">
            <HoleBackground
                strokeColor="rgba(255,255,255,0.05)"
                numberOfLines={36}
                numberOfDiscs={36}
                particleRGBColor={[147, 197, 253]}
                className="cta-background"
                style={{
                    maskImage:
                        "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                }}
            />

            <div className="cta-content">
                <SectionHeading
                    grayTitle="Start building,"
                    blueTitle="for free."
                />

                <p className="cta-description">
                    Get 10 free generations on sign up. No credit card required.
                    <br />
                    Upgrade when you&apos;re ready.
                </p>

                <SignInButton mode="modal">
                    <Button
                        size="lg"
                        className="cta-button"
                    >
                        Get started free
                        <ChevronRight className="cta-icon" />
                    </Button>
                </SignInButton>
            </div>
        </section>
    );
};

export default CTA;
