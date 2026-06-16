"use client";
import { motion } from "framer-motion";

const NavbarLogo = () => {
  return (
    <div className="flex items-center gap-2 group">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20">
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
        {/* Glow underlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-55">
          <img
            src="/icons/logo.svg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]"
          />
        </div>
        {/* Main logo — spins 360° on hover */}
        <img
          src="/icons/logo.svg"
          alt="MS Logo"
          className="w-full h-full object-contain transition-transform duration-700 ease-in-out group-hover:rotate-[360deg] relative z-10"
        />
      </div>
      <h1 className="text-white text-2xl hidden md:block">Mohana Srinivasan</h1>
    </div>
  );
};

export default NavbarLogo;
