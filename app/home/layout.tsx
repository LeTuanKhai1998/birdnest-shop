"use client";

import React from "react";
// import Footer from "@/components/Footer";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* <MainNavbar /> removed to avoid double navbar */}
      <main className="flex-1 container mx-auto px-2 py-6">{children}</main>
      {/* <Footer /> */}
    </div>
  );
}
