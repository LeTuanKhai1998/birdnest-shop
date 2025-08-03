'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HOME_CONSTANTS } from '@/lib/constants';
import { useFreeShippingThreshold } from '@/lib/settings-context';
import { formatCurrency } from '@/lib/shipping-utils';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef as React.RefObject<Element>, { once: true, amount: 0.3 });
  const freeShippingThreshold = useFreeShippingThreshold();

  return (
    <section
      ref={heroRef}
      className="relative w-full bg-[#a10000] overflow-hidden lg:bg-[#a10000] bg-gradient-to-b from-[#a10000] to-[#fbd8b0]"
      style={{ minHeight: '600px' }}
    >
      {/* Background Image - Desktop */}
      <Image
        src="/images/bg_banner_top.jpg"
        alt="Banner Background"
        fill
        className="object-cover w-full h-full hidden lg:block"
        priority
        quality={100}
        sizes="100vw"
        style={{ zIndex: 0, objectPosition: 'center 30%' }}
      />

      {/* Background Image - Mobile */}
      <Image
        src="/images/bg_banner_top_mobile.jpg"
        alt="Banner Background Mobile"
        fill
        className="object-contain sm:object-cover md:object-cover w-full h-full lg:hidden"
        priority
        quality={100}
        sizes="100vw"
        style={{ zIndex: 0, objectPosition: 'center top' }}
      />

      {/* Desktop Layout */}
      <div
        className="hidden lg:block relative z-10"
        style={{ minHeight: '600px' }}
      >
        {/* Left Product Image - Desktop positioning */}
        <div 
          className="absolute top-[40%] left-1/2 -translate-y-1/2 -translate-x-[75%] 2xl:top-[45%] 2xl:-translate-x-[110%] z-10 w-[34.2vw] max-w-[495px] min-w-[108px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -100 }}
            animate={isHeroInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: -100 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Image
              src="/images/yen_banner_1.png"
              alt="Yến Sào Kim Sang Left"
              width={495}
              height={495}
              className="object-contain w-full h-auto drop-shadow-2xl"
            />
            {/* Decor at top left of product image */}
            <div className="absolute -top-4 -left-4 z-20 w-20 md:w-32 animate-decor-slide drop-shadow-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              >
                <Image
                  src="/images/banner_decor_2.png"
                  alt="Decor"
                  width={125}
                  height={125}
                  className="object-contain w-full h-auto"
                />
              </motion.div>
            </div>
            {/* EN image at bottom left of product image */}
            <div className="absolute -bottom-16 -left-16 z-20 w-22 md:w-25 2xl:w-29 drop-shadow-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={isHeroInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.5, rotate: -10 }}
                transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
              >
                <Image
                  src="/images/en.png"
                  alt="EN"
                  width={101}
                  height={101}
                  className="object-contain w-full h-auto scale-x-[-1]"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Main Content - Desktop positioning */}
        <div 
          className="absolute top-[40%] left-1/2 -translate-y-1/2 translate-x-[20%] 2xl:top-[45%] z-20 flex flex-col items-center justify-center w-[411px] max-w-full py-12 md:py-20 text-white text-center px-4 bg-transparent"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.h1
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              className="text-glossy text-3xl md:text-5xl font-black italic"
              style={{
                fontWeight: 900,
                fontStyle: 'italic',
                fontFamily: 'Inter, sans-serif',
                fontSize: '3.3rem',
                padding: '20px',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              {HOME_CONSTANTS.hero.title.split('\n').map((line, index) => (
                <span key={index} style={{ whiteSpace: 'nowrap', display: 'block' }}>
                  {line}
                </span>
              ))}
            </motion.h1>
            <motion.p
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              className="text-lg md:text-xl mb-4 font-medium italic"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                color: '#fff',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            >
              {HOME_CONSTANTS.hero.subtitle}
            </motion.p>
            <div
              className="relative inline-block px-0 py-0 mb-3 drop-shadow-2xl"
              style={{ borderRadius: '16px' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px',
                    padding: '2px',
                    background: '#F0B000',
                    WebkitMask:
                      'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
                <div
                  className="relative z-10 flex flex-col items-center justify-center bg-[#a10000] rounded-[16px] px-6 py-3 border-2 border-[#F0B000]"
                  style={{ minWidth: '260px' }}
                >
                  <div
                    className="font-bold text-white text-lg md:text-2xl"
                    style={{ lineHeight: 1.2 }}
                  >
                    {HOME_CONSTANTS.shipping.message}
                  </div>
                  <div className="text-white text-sm md:text-base mt-1">
                    Đơn hàng từ {formatCurrency(freeShippingThreshold)} trở lên
                  </div>
                </div>
                {/* Decor to the right of shipping info */}
                <motion.div 
                  className="absolute -top-4 -right-45 z-20 w-16 md:w-24 animate-decor-slide drop-shadow-2xl"
                  initial={{ opacity: 0, scale: 0.5, x: 20 }}
                  animate={isHeroInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.5, x: 20 }}
                  transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
                >
                  <Image
                    src="/images/banner_decor_1.png"
                    alt="Decor"
                    width={96}
                    height={96}
                    className="object-contain w-full h-auto"
                  />
                </motion.div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
            >
              <Link
                href={HOME_CONSTANTS.hero.ctaLink}
                className="inline-block bg-glossy text-red-900 font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom mt-6 button-glow text-sm sm:text-base"
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}
              >
                {HOME_CONSTANTS.hero.ctaText}
              </Link>
            </motion.div>
          </motion.div>

          {/* Decor bottom left - Desktop positioning */}
          <motion.div 
            className="absolute left-10 bottom-8 z-20 w-16 md:w-24 drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.5, x: -20 }}
            animate={isHeroInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.5, x: -20 }}
            transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
          >
            <Image
              src="/images/banner_decor_1.png"
              alt="Decor"
              width={96}
              height={96}
              className="object-contain w-full h-auto"
            />
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout (Fluid Responsive) */}
      <div
        className="lg:hidden relative z-10 flex flex-col items-center justify-start px-[2vw] pt-[3vh] pb-[2vh]"
        style={{ minHeight: 'calc(100vh - 80px)', alignItems: 'center' }}
      >
        {/* Product Image Section - Mobile Only - Centered and Larger */}
        <motion.div
          className="relative w-full max-w-[90vw] mb-[4vh]"
          style={{ height: 'clamp(180px, 38vw, 320px)' }}
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={isHeroInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image
            src="/images/yen_banner_1.png"
            alt="Yến Sào Kim Sang"
            fill
            className="object-contain w-full h-full drop-shadow-2xl"
            sizes="90vw"
            priority
          />
          {/* Decor at top left of product image */}
          <motion.div 
            className="absolute -top-[3vw] left-[2vw] z-20 w-[15.6vw] min-w-[48px] max-w-[84px] animate-decor-slide drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <Image
              src="/images/banner_decor_2.png"
              alt="Decor"
              width={72}
              height={72}
              className="object-contain w-full h-auto"
            />
          </motion.div>
        </motion.div>
        {/* Content Section - Mobile Only - Centered */}
        <motion.div 
          className="flex flex-col items-center text-white text-center w-full max-w-[96vw] px-[1vw] mt-[4vh]"
          initial={{ opacity: 0, y: 50 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.h1
            className="text-glossy font-black italic"
            style={{
              fontWeight: 900,
              fontStyle: 'italic',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(2.2rem, 8.5vw, 3.2rem)',
              lineHeight: 1.1,
              padding: 'clamp(0.3em, 2vw, 0.7em) 0',
              marginBottom: 'clamp(0.2em, 1.5vw, 0.5em)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            {HOME_CONSTANTS.hero.title.split('\n').map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </motion.h1>
          <motion.p
            className="font-medium italic"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#fff',
              fontSize: 'clamp(1.2rem, 4.5vw, 1.6rem)',
              marginBottom: 'clamp(0.5em, 2vw, 1em)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            {HOME_CONSTANTS.hero.subtitle}
          </motion.p>
          {/* Shipping Info Box */}
          <motion.div 
            className="relative mb-[2vh] drop-shadow-2xl w-full flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
          >
            <div
              className="relative bg-[#a10000] rounded-[1.2em] px-[3vw] py-[2vw] border-2 border-[#F0B000] min-w-[65vw] max-w-[95vw]"
              style={{ boxSizing: 'border-box' }}
            >
              <div
                className="font-bold text-white"
                style={{
                  lineHeight: 1.2,
                  fontSize: 'clamp(1.1rem, 4.2vw, 1.4rem)',
                }}
              >
                {HOME_CONSTANTS.shipping.message}
              </div>
              <div
                className="text-white"
                style={{
                  fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)',
                  marginTop: '0.3em',
                }}
              >
                Đơn hàng từ {formatCurrency(freeShippingThreshold)} trở lên
              </div>
            </div>
          </motion.div>
          {/* CTA Button and Decor Row */}
          <motion.div 
            className="flex flex-row items-center justify-center w-full max-w-[96vw] mt-[6vh] gap-[1.5vw] relative"
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
          >
            {/* Button - center */}
            <Link
              href={HOME_CONSTANTS.hero.ctaLink}
              className="inline-block bg-glossy text-red-900 font-bold rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom button-glow"
              style={{
                fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                padding: 'clamp(0.7em, 3vw, 1.2em) clamp(2.2em, 7vw, 3em)',
                margin: 0,
                marginTop: '-2vh',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              }}
            >
              {HOME_CONSTANTS.hero.ctaText}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes decor-slide {
          0% {
            transform: translateX(-20px);
          }
          50% {
            transform: translateX(20px);
          }
          100% {
            transform: translateX(-20px);
          }
        }

        .animate-decor-slide {
          animation: decor-slide 4s ease-in-out infinite;
        }

        @keyframes shine {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .text-glossy {
          background: linear-gradient(90deg, #ffda41, #fff9dd, #ffda41);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shine 3s ease-in-out infinite;
        }

        .bg-glossy {
          background: linear-gradient(90deg, #ffda41, #fff9dd, #ffda41);
          background-size: 200% 100%;
          animation: shine 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .animate-button-zoom {
          animation: button-zoom 2s ease-in-out infinite;
        }

        @keyframes button-zoom {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.12);
          }
        }

        .button-glow {
          position: relative;
          overflow: hidden;
        }

        .button-glow::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.5s;
        }

        .button-glow:hover::before {
          left: 100%;
        }

        .hover\\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        }

        /* Mobile touch optimizations */
        @media (max-width: 640px) {
          .button-glow {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          .animate-button-zoom {
            animation: button-zoom 1.5s ease-in-out infinite;
          }

          .animate-decor-slide {
            animation: decor-slide 4s ease-in-out infinite;
          }
        }

        /* Ensure smooth scrolling on mobile */
        html {
          scroll-behavior: smooth;
        }

        /* Optimize for mobile performance */
        @media (max-width: 640px) {
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
      `}</style>
    </section>
  );
}
             