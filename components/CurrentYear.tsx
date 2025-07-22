// This component uses Date, so it should only be used in Client Components to avoid hydration mismatches.
"use client";
export default function CurrentYear() {
  return <>{new Date().getFullYear()}</>;
} 