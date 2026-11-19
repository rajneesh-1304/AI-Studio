
'use client';

import React, { useEffect, useRef, useState } from 'react';
import './style.scss';
import { HoleBackground } from '@/components/animate-ui/backgrounds/hole';
import { SectionHeading } from '@/components/reusables/reusable';
import { PLACEHOLDERS, SUGGESTIONS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const Hero = () => {
    const { isSignedIn, has } = useAuth();
    const router = useRouter();
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [prompt, setPrompt] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isFocused || prompt) return;

        const interval = setInterval(() => {
            setSuggestionIndex(
                (prev) => (prev + 1) % PLACEHOLDERS.length
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [isFocused, prompt]);

    useEffect(() => {
        const textarea = textareaRef.current;

        if (!textarea) return;

        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }, [prompt]);

    const handleGenerate = () => {
        if (!prompt.trim() || !isSignedIn) return;
        router.push(`/workspace?prompt=${encodeURIComponent(prompt.trim())}`);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const handleSuggestion = (suggestion: string) => {
        setPrompt(suggestion);
        textareaRef.current?.focus();
    };

    return (
        <section className="hero">
            <HoleBackground
                style={{
                    maskImage:
                        'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                    WebkitMaskImage:
                        'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                }}
                className="holeBackground"
                strokeColor="rgba(255,255,255,0.05)"
            />

            <div className="heroContainer">
                <div className="heroHeading">
                    <span className="pulseDot"></span>
                    <p>Powered by Agentic AI</p>
                </div>

                <div className="headingWrapper">
                    <SectionHeading
                        grayTitle="Forge your dream"
                        blueTitle="from a single prompt."
                    />
                </div>

                <p className="heroDescription">
                    Describe what you want to build. AI writes the code,
                    picks the packages, and renders a live preview all
                    inside your browser.
                </p>

                <div className="textWrapper">
                    <div className={`textAreaContainer ${isFocused ? 'focused' : ''}`}>
                        <textarea
                            ref={textareaRef}
                            name="text-area"
                            placeholder={PLACEHOLDERS[suggestionIndex]}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={1}
                            className="textArea"
                            style={{
                                minHeight: 56,
                                maxHeight: 200,
                            }}
                        />

                        <div className="textAreaFooter">
                            <p className="suggestionsHeading">
                                Press ⏎ to generate · Shift+⏎ for new line
                            </p>

                            {isSignedIn ? 
                            <Button 
                                className="generateBtn" 
                                disabled={!prompt.trim()}
                                onClick={handleGenerate}
                            >
                                Generate
                                <ArrowRightIcon />
                            </Button> :

                                <SignInButton mode="modal">
                                    <Button className="generateBtn">
                                        Generate
                                        <ArrowRightIcon />
                                    </Button>
                                </SignInButton>
                            }
                        </div>
                    </div>

                    <div className="suggestions">
                        {SUGGESTIONS.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSuggestion(suggestion)}
                                className="suggestionButton"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="heroBottomText">
                    No credit card required · 10 free generations on sign up
                </p>
            </div>
        </section>
    );
};

export default Hero;
