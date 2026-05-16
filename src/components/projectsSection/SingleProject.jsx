import { useState } from "react";
import { BsFillArrowUpRightCircleFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowDownLong } from "react-icons/fa6";
import { fadeIn } from "../../framerMotion/variants";

const SingleProject = ({ name, year, align, image, link, description }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  const handleDetailsClick = () => {
    if (!showDetails) {
      setShowArrow(true);
      setTimeout(() => {
        setShowDetails(true);
        setShowArrow(false);
      }, 600);
    } else {
      setShowDetails(false);
    }
  };

  return (
    <motion.div
      variants={fadeIn("top", 0)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.1 }}
      className={`flex w-full items-center gap-8 relative justify-end ${
        align === "left" ? "md:flex-row" : "md:flex-row-reverse"
      } sm:flex-col sm:flex-col-reverse`}
    >
      {/* Text Section */}
      <div className="flex-1 relative">
        <div
          className={`flex flex-col ${
            align === "left" ? "items-end text-right" : "items-start text-left"
          }`}
        >
          <h2 className="md:text-3xl sm:text-2xl text-orange">{name}</h2>
          <h2 className="text-xl font-thin text-white font-special sm:text-center mt-1">
            {year}
          </h2>

          {/* Buttons */}
          <div
            className={`flex gap-4 items-center mt-4 ${
              align === "left" ? "justify-end" : "justify-start"
            }`}
          >
            <a
              href={link}
              className="text-lg flex gap-2 items-center text-cyan hover:text-orange transition-all duration-500 cursor-pointer"
              target="_blank"
              rel="noopener noreferrer"
            >
              View <BsFillArrowUpRightCircleFill />
            </a>

            <button
              onClick={handleDetailsClick}
              className="text-lg flex gap-2 items-center text-cyan hover:text-orange transition-all duration-500 cursor-pointer"
            >
              Details <BsFillArrowUpRightCircleFill />
            </button>
          </div>
        </div>

        {/* Downward Arrow Animation */}
        <AnimatePresence>
          {showArrow && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute left-1/2 transform -translate-x-1/2 mt-8 z-10"
            >
              <FaArrowDownLong className="text-6xl text-orange" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description Expandable Section */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.6, ease: "easeInOut" },
                opacity: { duration: 0.4, ease: "easeInOut", delay: 0.2 },
              }}
              className="overflow-hidden mt-14"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="border-orange border-dashed border-2 rounded-xl p-5 shadow-lg bg-[#1e1e1e] w-full max-w-[500px] mx-auto"
              >
                <ul className="list-disc ml-5 mt-2 text-sm text-white space-y-1">
                  {description.responsibilities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Section */}
      <div className="flex-1 max-h-[220px] max-w-[400px] rounded-xl overflow-hidden hover:scale-110 transform transition-all duration-500 relative border border-white">
        <div className="w-full h-full bg-cyan opacity-50 absolute top-0 left-0 hover:opacity-0 transition-all duration-500 md:block sm:hidden"></div>
        <img
          src={image}
          alt={`${name} preview`}
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
};

export default SingleProject;
