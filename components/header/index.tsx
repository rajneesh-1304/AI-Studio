import './style.scss'
import Image from 'next/image'
import Link from 'next/link'
import { Show, SignInButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
import { ArrowRight, Zap } from 'lucide-react'
import { PricingModal } from '../common/pricing-modal'
import { checkUser } from '@/lib/checkUser'
import { HeaderUserButton } from './user-button'

const Header = async () => {
    const user = await checkUser();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/6 bg-white/7 backdrop-blur-md">
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

                        {
                            user && (
                                <PricingModal>
                                    <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70">
                                        <Zap className="h-3 w-3 fill-white/70" />
                                        {user.credits} credits
                                    </span>
                                </PricingModal>
                            )
                        }

                        <HeaderUserButton />
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