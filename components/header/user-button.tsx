"use client";

import dynamic from "next/dynamic";

export const HeaderUserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />,
  }
);
