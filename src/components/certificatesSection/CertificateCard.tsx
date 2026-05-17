"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { FaArrowDownLong } from "react-icons/fa6";
import { PiCertificateBold } from "react-icons/pi";
import { AiOutlineDown, AiOutlineUp, AiOutlineLink } from "react-icons/ai";
import { FaReact } from "react-icons/fa";
import CertificateLogo from "./CertificateLogo";
import { certificates } from "@/data/portfolio.config";
import type { ComponentType } from "react";

interface CertificateCardProps {
  iconComponent?: ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const CertificateCard = ({ iconComponent: IconComponent = PiCertificateBold }: CertificateCardProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleImage = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-col gap-10 relative border-l-4 border-orange ml-6 w-full">
      {certificates.map((cert, index) => (
        <div key={index}>
          <motion.div
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.7 }}
            className="relative pl-10"
          >
            <motion.div
              whileHover={{ scale: 1.3, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute -left-5 top-1 z-10 text-cyan"
            >
              <FaReact className="text-4xl hover:text-blue-400 transition-all duration-300" />
            </motion.div>

            <motion.div
              className="bg-[#1c1f24] rounded-xl p-5 shadow-xl transition-all duration-500 mx-auto w-full max-w-[900px]"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-left">
                <div className="flex items-start gap-4 w-full">
                  <div className="rounded-full flex items-center justify-center text-orange mt-1 text-[30px]">
                    <IconComponent />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-orange">{cert.title}</h3>
                    <div className="text-sm mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <span className="text-cyan flex items-center gap-2">
                        <CertificateLogo issuer={cert.issuer} />
                        {cert.issuer}
                      </span>
                      <span className="text-lightGrey">{new Date(cert.date).toDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{cert.description}</p>
                    {cert.link && (
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan hover:text-orange mt-2 text-sm inline-flex items-center gap-1"
                      >
                        <AiOutlineLink /> View Certificate
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <motion.div className="mt-4 flex justify-center w-full" layout>
                <div className="w-full max-w-3xl">
                  <motion.img
                    src={cert.image}
                    alt="Certificate Preview"
                    className="w-full h-auto rounded-md object-contain"
                    layout
                    initial={{ maxHeight: "8rem" }}
                    animate={{ maxHeight: expandedIndex === index ? "100%" : "8rem" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
              </motion.div>

              <div className="mt-2">
                <button
                  onClick={() => toggleImage(index)}
                  className="text-white text-sm flex items-center gap-1 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition-all"
                >
                  {expandedIndex === index ? (
                    <><AiOutlineUp /> Hide Certificate</>
                  ) : (
                    <><AiOutlineDown /> Show Certificate</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>

          {index < certificates.length - 1 && (
            <motion.div
              variants={fadeIn("up", 0.2)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.5 }}
              className="flex justify-center ml-4"
            >
              <FaArrowDownLong className="text-3xl text-orange" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CertificateCard;
