"use client";

import Image from "next/image";
import './style.scss'
import Works from '@/components/home/works'
import Features from "@/components/home/features";
import Pricing from "@/components/home/pricing";

export default function Home() {
  return (
    <main className="main-container">
      <Features />
      <Works />
      <Pricing />
    </main>
  );
}
