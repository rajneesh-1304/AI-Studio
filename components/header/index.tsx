import React from 'react'
import './style.scss'
import Image from 'next/image'
import Link from 'next/link'
import { Show, SignInButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
import { ArrowRight, Zap } from 'lucide-react'

const Header = async () => {
    // const user = await checkUser();
    return (
        <header className="header">
            <nav className="navbar">
                <Link href='/' className='logo-link'>
                    <Image
                        src="/main-logo.png"
                        alt="ai-studio"
                        width={100}
                        height={100}
                        className='logo-image'
                    />
                </Link>

                <div className="navbar-right">
                    <Show when="signed-in">
                        <Link href='/projects' className='projects'>
                            Projects
                        </Link>

                        {/* {user && (
                            <span className="credits">
                                <Zap className="zap-icon" />
                                {user.credits} credits
                            </span>
                        )} */}
                    </Show>

                    <Show when="signed-out">
                        <SignInButton mode='modal'>
                            <Button
                                variant="ghost"
                                className="sign-in-btn"
                            >Sign in</Button>
                        </SignInButton>
                        <SignInButton mode='modal'>
                            <Button
                                size="sm"
                                className="get-started-btn"
                            >Get Started
                                <ArrowRight className='arrow' />
                            </Button>
                        </SignInButton>
                    </Show>
                </div>
            </nav>
        </header>
    )
}

export default Header