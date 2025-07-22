"use client";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";
import CurrentYear from "@/components/CurrentYear";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white/90 py-6 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-700">
          <Link href="/policy" className="hover:text-red-700 transition">Purchase Policy</Link>
          <Link href="/delivery" className="hover:text-red-700 transition">Delivery</Link>
          <Link href="/return" className="hover:text-red-700 transition">Return & Exchange</Link>
        </div>
        <div className="flex gap-4 items-center">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Facebook className="w-5 h-5 text-blue-600 hover:text-red-700 transition" />
          </a>
          <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" aria-label="Zalo">
            <Image src="/images/zalo-icon.png" alt="Zalo" width={20} height={20} className="w-5 h-5 hover:opacity-80 transition" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="w-5 h-5 text-pink-500 hover:text-red-700 transition" />
          </a>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-4">&copy; <CurrentYear /> Birdnest Shop. All rights reserved.</div>
    </footer>
  );
} 