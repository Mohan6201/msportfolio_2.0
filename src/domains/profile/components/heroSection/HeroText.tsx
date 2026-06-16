"use client";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { Link } from "react-scroll";
import { FiArrowRight, FiDownload } from "react-icons/fi";

const HeroText = () => {
  return (
    <div className="flex flex-col gap-5 h-full justify-center md:text-left sm:text-center">
      <motion.div
        variants={fadeIn("down", 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="flex items-center gap-3 md:justify-start sm:justify-center"
      >
        <span className="w-8 h-[2px] bg-cyan inline-block" />
        <span className="text-cyan uppercase tracking-[0.25em] text-sm font-semibold">
          AWS DevOps Engineer
        </span>
      </motion.div>

      <motion.h1
        variants={fadeIn("right", 0.3)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="md:text-[3rem] lg:text-[4rem] sm:text-4xl font-bold uppercase leading-tight"
      >
        <span className="text-white">Mohana</span>
        <br className="sm:hidden md:block" />
        <span
          style={{
            background: "linear-gradient(135deg, #fb9718 0%, #15d1e9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Srinivasan
        </span>
      </motion.h1>

      <motion.p
        variants={fadeIn("up", 0.5)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="text-lightGrey text-base leading-relaxed max-w-md md:mx-0 sm:mx-auto"
      >
        3.5 years automating cloud infrastructure, building zero-downtime CI/CD pipelines,
        and deploying containerised workloads on AWS — from EC2 to ECS to Terraform.
      </motion.p>

      <motion.div
        variants={fadeIn("up", 0.65)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="flex gap-4 md:justify-start sm:justify-center flex-wrap mt-2"
      >
        <Link
          to="contact"
          smooth={true}
          duration={600}
          offset={-120}
          className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-full bg-cyan text-black font-semibold text-sm hover:bg-darkCyan transition-colors duration-300 shadow-cyanShadow"
        >
          Hire Me <FiArrowRight className="w-4 h-4" />
        </Link>
        <a
          href="/assets/Mohana Srinivasan (Resume).pdf"
          download
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-orange text-orange font-semibold text-sm hover:bg-orange hover:text-black transition-colors duration-300"
        >
          Resume <FiDownload className="w-4 h-4" />
        </a>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        variants={fadeIn("up", 0.8)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0 }}
        className="flex gap-8 md:justify-start sm:justify-center mt-4 pt-4 border-t border-white/10"
      >
        {[
          { value: "3.5+", label: "Years Exp." },
          { value: "10+", label: "Projects" },
          { value: "AWS", label: "Certified" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-bold text-cyan">{value}</span>
            <span className="text-xs text-lightGrey uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default HeroText;
