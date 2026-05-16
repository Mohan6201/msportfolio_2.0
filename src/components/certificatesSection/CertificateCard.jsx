import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "../../framerMotion/variants";
import { FaArrowDownLong } from "react-icons/fa6";
import { PiCertificateBold } from "react-icons/pi";
import { AiOutlineDown, AiOutlineUp, AiOutlineLink } from "react-icons/ai";
import { FaReact } from "react-icons/fa";
import CertificateLogo from "./CertificateLogo";

const CertificateCard = ({
  icon: IconComponent = PiCertificateBold,
  iconSize = "5rem", // Increased icon size
  sectionWidth = "100%", // Full width section
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleImage = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const certificates = [
    {
      title: "DevOps Certified Expert (In-Progress)",
      issuer: "Guvi",
      date: "2025-05-17",
      description: "This program includes hands-on training with top tools like Git, Jenkins, Docker, Ansible, Terraform and Kubernetes.",
      image: "images/blank.png",
    },
    {
      title: "Amazon Solution Architect Associate",
      issuer: "RedSys9 Tech Pvt Ltd",
      date: "2025-04-21",
      description: "Acquired skills to design scalable, secure, and reliable AWS cloud architectures using core services like EC2, S3, and VPC.",
      image: "images/ASA Certificate.jfif",
    },
    {
      title: "Warehouse Advantage Certified Associate",
      issuer: "Korber Supply Chain",
      date: "2023-09-09",
      description: "Handled real-time projects on warehouse operations and inventory management to improve efficiency and Developed skills to enhance supply chain efficiency",
      link: "https://www.credly.com/badges/e12dca0f-078f-40ab-b8e9-647121ddf599/linked_in_profile",
      image: "images/Korber.png",
    },
    {
      title: "Full Stack Developer",
      issuer: "3Edge Solutions Pvt Ltd",
      date: "2022-12-27",
      description: "Learned to build complete web applications with front-end and back-end technologies.",
      link: "https://www.credly.com/badges/e12dca0f-078f-40ab-b8e9-647121ddf599/linked_in_profile",
      image: "images/3Edge.png",
    },
  ];

  return (
    <div
      className="flex flex-col gap-10 relative border-l-4 border-orange ml-6"
      style={{ width: sectionWidth }}
    >
      {certificates.map((cert, index) => (
        <React.Fragment key={index}>
          {/* === Certificate Box === */}
          <motion.div
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.7 }}
            className="relative pl-10"
          >
            {/* React Logo Floating */}
            <motion.div
              whileHover={{ scale: 1.3, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute -left-5 top-1 z-10 text-cyan"
            >
              <FaReact className="text-4xl hover:drop-shadow-glow hover:text-blue-400 transition-all duration-300" />
            </motion.div>

            {/* Certificate Content */}
            <motion.div
              className="bg-[#1c1f24] rounded-xl p-5 shadow-xl  transition-all duration-500 mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                width: "100%",
                maxWidth: "900px", // Increased and centered
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-left">
                <div className="flex items-start gap-4 w-full">
                  {/* Icon */}
                  <div
                    className="rounded-full flex items-center justify-center text-orange mt-1"
                    style={{ fontSize: '30px' }}
                  >
                    <IconComponent />
                  </div>

                  {/* Certificate Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-orange">
                      {cert.title}
                    </h3>

                    <div className="text-sm mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <span className="text-cyan flex items-center gap-2">
                        <CertificateLogo issuer={cert.issuer} />
                        {cert.issuer}
                      </span>
                      <span className="text-lightGrey">
                        {new Date(cert.date).toDateString()}
                      </span>
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

              {/* === Preview Image === */}
              <motion.div className="mt-4 flex justify-center w-full" layout>
                <div className="w-full max-w-3xl">
                  <motion.img
                    src={cert.image}
                    alt="Certificate Preview"
                    className="w-full h-auto rounded-md object-contain"
                    layout
                    initial={{ height: "auto", maxHeight: "8rem" }}
                    animate={{
                      maxHeight: expandedIndex === index ? "100%" : "8rem",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
              </motion.div>

              {/* === Toggle Button === */}
              <div className="mt-2">
                <button
                  onClick={() => toggleImage(index)}
                  className="text-white text-sm flex items-center gap-1 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition-all"
                >
                  {expandedIndex === index ? (
                    <>
                      <AiOutlineUp />
                      Hide Certificate
                    </>
                  ) : (
                    <>
                      <AiOutlineDown />
                      Show Certificate
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* === Down Arrow (Except Last) === */}
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
        </React.Fragment>
      ))}
    </div>
  );
};

export default CertificateCard;
