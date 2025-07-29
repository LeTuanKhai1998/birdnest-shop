'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HOME_CONSTANTS, ANIMATION_CONSTANTS } from '@/lib/constants';

export function HeroSection() {
  return (
    <section
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
        <div className="absolute top-[40%] left-1/2 -translate-y-1/2 -translate-x-[75%] 2xl:top-[45%] 2xl:-translate-x-[110%] z-10 w-[34.2vw] max-w-[495px] min-w-[108px]">
          <Image
            src="/images/yen_banner_1.png"
            alt="Yến Sào Kim Sang Left"
            width={495}
            height={495}
            className="object-contain w-full h-auto drop-shadow-2xl"
          />
          {/* Decor at top left of product image */}
          <div className="absolute -top-4 -left-4 z-20 w-20 md:w-32 animate-decor-slide drop-shadow-2xl">
            <Image
              src="/images/banner_decor_2.png"
              alt="Decor"
              width={125}
              height={125}
              className="object-contain w-full h-auto"
            />
          </div>
          {/* EN image at bottom left of product image */}
          <div className="absolute -bottom-16 -left-16 z-20 w-22 md:w-25 2xl:w-29 drop-shadow-2xl">
            <Image
              src="/images/en.png"
              alt="EN"
              width={101}
              height={101}
              className="object-contain w-full h-auto scale-x-[-1]"
            />
          </div>
        </div>

        {/* Main Content - Desktop positioning */}
        <div className="absolute top-[40%] left-1/2 -translate-y-1/2 translate-x-[20%] 2xl:top-[45%] z-20 flex flex-col items-center justify-center w-[411px] max-w-full py-12 md:py-20 text-white text-center px-4 bg-transparent">
          <h1
            className="text-glossy text-3xl md:text-5xl font-black italic"
            style={{
              fontWeight: 900,
              fontStyle: 'italic',
              fontFamily: 'Inter, sans-serif',
              fontSize: '3.3rem',
              padding: '20px',
            }}
          >
            {HOME_CONSTANTS.hero.title.split('\n').map((line, index) => (
              <span key={index} style={{ whiteSpace: 'nowrap', display: 'block' }}>
                {line}
              </span>
            ))}
          </h1>
          <p
            className="text-lg md:text-xl mb-4 font-medium italic"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#fff',
            }}
          >
            {HOME_CONSTANTS.hero.subtitle}
          </p>
          <div
            className="relative inline-block px-0 py-0 mb-3 drop-shadow-2xl"
            style={{ borderRadius: '16px' }}
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
                {HOME_CONSTANTS.shipping.message} <span className="text-yellow-300">MIỄN PHÍ</span>
              </div>
              <div className="text-white text-sm md:text-base mt-1">
                {HOME_CONSTANTS.shipping.subtitle}
              </div>
            </div>
            {/* Decor to the right of shipping info */}
            <div className="absolute -top-4 -right-45 z-20 w-16 md:w-24 animate-decor-slide drop-shadow-2xl">
              <Image
                src="/images/banner_decor_1.png"
                alt="Decor"
                width={96}
                height={96}
                className="object-contain w-full h-auto"
              />
            </div>
          </div>
          <Link
            href={HOME_CONSTANTS.hero.ctaLink}
            className="inline-block bg-glossy text-red-900 font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 hover:shadow-3xl animate-button-zoom mt-6 button-glow text-sm sm:text-base"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}
          >
            {HOME_CONSTANTS.hero.ctaText}
          </Link>
        </div>

        {/* Decor bottom left - Desktop positioning */}
        <div className="absolute left-10 bottom-8 z-20 w-16 md:w-24 drop-shadow-2xl">
          <Image
            src="/images/banner_decor_1.png"
            alt="Decor"
            width={96}
            height={96}
            className="object-contain w-full h-auto"
          />
        </div>
      </div>

      {/* Mobile Layout (Fluid Responsive) */}
      <div
        className="lg:hidden relative z-10 flex flex-col items-center justify-start px-[2vw] pt-[3vh] pb-[2vh]"
        style={{ minHeight: 'calc(100vh - 80px)', alignItems: 'center' }}
      >
        {/* Product Image Section - Mobile Only - Centered and Larger */}
        <div
          className="relative w-full max-w-[90vw] mb-[4vh]"
          style={{ height: 'clamp(180px, 38vw, 320px)' }}
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
          <div className="absolute -top-[3vw] left-[2vw] z-20 w-[15.6vw] min-w-[48px] max-w-[84px] animate-decor-slide drop-shadow-2xl">
            <Image
              src="/images/banner_decor_2.png"
              alt="Decor"
              width={72}
              height={72}
              className="object-contain w-full h-auto"
            />
          </div>
        </div>
        {/* Content Section - Mobile Only - Centered */}
        <div className="flex flex-col items-center text-white text-center w-full max-w-[96vw] px-[1vw] mt-[4vh]">
          <h1
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
          >
            {HOME_CONSTANTS.hero.title.split('\n').map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p
            className="font-medium italic"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: '#fff',
              fontSize: 'clamp(1.2rem, 4.5vw, 1.6rem)',
              marginBottom: 'clamp(0.5em, 2vw, 1em)',
            }}
          >
            {HOME_CONSTANTS.hero.subtitle}
          </p>
          {/* Shipping Info Box */}
          <div className="relative mb-[2vh] drop-shadow-2xl w-full flex justify-center">
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
                {HOME_CONSTANTS.shipping.message} <span className="text-yellow-300">MIỄN PHÍ</span>
              </div>
              <div
                className="text-white"
                style={{
                  fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)',
                  marginTop: '0.3em',
                }}
              >
                {HOME_CONSTANTS.shipping.subtitle}
              </div>
            </div>
          </div>
          {/* CTA Button and Decor Row */}
          <div className="flex flex-row items-center justify-center w-full max-w-[96vw] mt-[6vh] gap-[1.5vw] relative">
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
          </div>
          {/* Decor below button - left and right */}
          <div className="flex justify-between items-center w-full mt-[0.5vh] px-[2vw]">
            {/* EN image - left */}
            <div
              className="relative"
              style={{
                width: 'clamp(57px, 19.5vw, 90px)',
                height: 'clamp(57px, 19.5vw, 90px)',
              }}
            >
              <Image
                src="/images/en.png"
                alt="EN"
                fill
                className="object-contain w-full h-full scale-x-[-1] drop-shadow-2xl"
              />
            </div>
            {/* Decor - right */}
            <div
              className="relative"
              style={{
                width: 'clamp(38px, 13vw, 60px)',
                height: 'clamp(38px, 13vw, 60px)',
              }}
            >
              <Image
                src="/images/banner_decor_1.png"
                alt="Decor"
                fill
                className="object-contain w-full h-full animate-decor-slide drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
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
          animation: ${ANIMATION_CONSTANTS.decorSlide};
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
          animation: ${ANIMATION_CONSTANTS.shine};
        }

        .bg-glossy {
          background: linear-gradient(90deg, #ffda41, #fff9dd, #ffda41);
          background-size: 200% 100%;
          animation: ${ANIMATION_CONSTANTS.shine};
        }

        .animate-pulse-slow {
          animation: ${ANIMATION_CONSTANTS.pulseSlow};
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
          animation: ${ANIMATION_CONSTANTS.buttonZoom};
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

        .hover\:shadow-3xl:hover {
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