// This component uses Date, so it should only be used in Client Components to avoid hydration mismatches.
"use client";
import { useEffect, useState } from "react";

export default function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  if (year === null) return null;
  return <>{year}</>;
} 