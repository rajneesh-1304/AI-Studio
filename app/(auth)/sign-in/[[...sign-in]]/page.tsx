import { SignIn } from "@clerk/nextjs";
import React, { Suspense } from "react";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignIn />
    </Suspense>
  );
}
