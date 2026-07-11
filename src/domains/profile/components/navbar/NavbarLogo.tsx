"use client";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const NavbarLogo = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-2 group">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20">
        {!reduceMotion && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full bg-cyan-400 z-0"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 1.8, repeat: Infinity, repeatType: "loop", ease: "easeOut" }}
              style={{ filter: "blur(30px)" }}
            />
            {/* Cyan pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-full bg-cyan z-0"
              initial={{ opacity: 0.35, scale: 1 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{ duration: 2.4, repeat: Infinity, repeatType: "loop", ease: "easeOut" }}
              style={{ filter: "blur(26px)" }}
            />
          </>
        )}
        {/* Glow underlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-55">
          <Image
            src="/icons/Actual_Logo.ico"
            alt=""
            aria-hidden="true"
            fill
            sizes="80px"
            className="object-contain drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]"
          />
        </div>
        {/* Main logo — spins 360° on hover */}
        <Image
          src="/icons/Actual_Logo.ico"
          alt="MS Logo"
          fill
          sizes="80px"
          priority
          className="object-contain transition-transform duration-700 ease-in-out group-hover:rotate-[360deg] relative z-10"
        />
      </div>
      <p className="text-white text-2xl hidden md:block">Mohana Srinivasan</p>
    </div>
  );
};

export default NavbarLogo;
