import { SignUp } from "@clerk/nextjs";
import React, { Suspense } from "react";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignUp />
    </Suspense>
  );
}
