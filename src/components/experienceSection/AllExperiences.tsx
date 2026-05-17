"use client";
import SingleExperience from "./SingleExperience";
import { FaArrowRightLong } from "react-icons/fa6";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { experiences } from "@/data/portfolio.config";
import { Fragment } from "react";

const AllExperiences = () => {
  return (
    <div className="flex md:flex-row sm:flex-col items-center justify-between">
      {experiences.map((experience, index) => (
        <Fragment key={index}>
          <SingleExperience experience={experience} />
          {index < experiences.length - 1 && (
            <motion.div
              variants={fadeIn("right", 0)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.7 }}
            >
              <FaArrowRightLong className="text-6xl text-orange lg:block sm:hidden" />
            </motion.div>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default AllExperiences;
