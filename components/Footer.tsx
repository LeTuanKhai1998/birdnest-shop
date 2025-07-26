"use client";
import { Instagram, Phone, Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

const quickLinks = [
  { label: "Delivery", href: "/delivery" },
  { label: "Purchase Policy", href: "/policy" },
  { label: "Return & Exchange", href: "/return" },
];

const contactLinks = [
  {
    label: "Zalo",
    href: "https://zalo.me/yourzalo",
    icon: (
      <Image
        src="/images/zalo-icon.png"
        alt="Zalo"
        width={20}
        height={20}
        className="w-5 h-5"
        aria-label="Zalo"
      />
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/yourinsta",
    icon: <Instagram className="w-5 h-5" aria-label="Instagram" />,
  },
  {
    label: "Phone",
    href: "tel:0123456789",
    icon: <Phone className="w-5 h-5" aria-label="Phone" />,
  },
  {
    label: "Email",
    href: "mailto:info@birdnestshop.com",
    icon: <Mail className="w-5 h-5" aria-label="Email" />,
  },
];

export default function Footer() {
  const [open, setOpen] = useState([false, false]);
  return (
    <footer className="w-full border-t bg-white/90 py-6 mt-8 text-gray-800">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Mobile: Accordions */}
        <div className="md:hidden">
          {/* Quick Links Accordion */}
          <div className="mb-2">
            <button
              className="w-full flex justify-between items-center py-3 font-semibold text-lg focus:outline-none"
              onClick={() => setOpen(o => [!o[0], o[1]])}
              aria-expanded={open[0]}
              aria-controls="footer-quick-links"
            >
              Quick Links
              <span>{open[0] ? "−" : "+"}</span>
            </button>
            <div
              id="footer-quick-links"
              className={`transition-all overflow-hidden ${open[0] ? "max-h-40" : "max-h-0"}`}
            >
              <ul>
                {quickLinks.map(link => (
                  <li key={link.label} className="py-3 border-b last:border-b-0">
                    <Link
                      href={link.href}
                      className="block text-base font-medium hover:text-red-700 transition px-2"
                      aria-label={link.label}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Contact & Social Accordion */}
          <div className="mb-2">
            <button
              className="w-full flex justify-between items-center py-3 font-semibold text-lg focus:outline-none"
              onClick={() => setOpen(o => [o[0], !o[1]])}
              aria-expanded={open[1]}
              aria-controls="footer-contact-social"
            >
              Contact & Social
              <span>{open[1] ? "−" : "+"}</span>
            </button>
            <div
              id="footer-contact-social"
              className={`transition-all overflow-hidden ${open[1] ? "max-h-40" : "max-h-0"}`}
            >
              <ul>
                {contactLinks.map(link => (
                  <li key={link.label} className="py-3 border-b last:border-b-0">
                    <a
                      href={link.href}
                      className="flex items-center gap-2 text-base font-medium hover:text-red-700 transition px-2"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      aria-label={link.label}
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Desktop: Columns */}
        <div className="hidden md:flex justify-between gap-8 py-4">
          <div>
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul>
              {quickLinks.map(link => (
                <li key={link.label} className="py-2">
                  <Link
                    href={link.href}
                    className="block text-base font-medium hover:text-red-700 transition"
                    aria-label={link.label}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Contact & Social</h3>
            <ul>
              {contactLinks.map(link => (
                <li key={link.label} className="py-2">
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-base font-medium hover:text-red-700 transition"
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={link.label}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Copyright */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2025 Birdnest Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 