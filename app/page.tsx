"use client";

import Image from "next/image";
import './style.scss'
import Works from '@/components/home/works'
import Features from "@/components/home/features";
import Pricing from "@/components/home/pricing";
import Hero from "@/components/home/hero";
import Footer from "@/components/home/footer";
import CTA from "@/components/home/cta";

export default function Home() {
  return (
    <main className="main-container">
      <Hero/>
      <Features />
      <Works />
      <Pricing />
      <CTA/>
      <Footer />
    </main>
  );
}
