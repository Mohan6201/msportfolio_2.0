"use client";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import type { Experience } from "@/data/portfolio.config";

interface SingleExperienceProps {
  experience: Experience;
}

const SingleExperience = ({ experience }: SingleExperienceProps) => {
  return (
    <motion.div
      variants={fadeIn("right", 0)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.7 }}
      className="md:h-[410px] md:w-[275px] sm:h-auto sm:w-full border-2 border-orange border-dashed rounded-2xl mt-12 p-4"
    >
      <p className="font-bold text-cyan">{experience.job}</p>
      <p className="text-orange">{experience.company}</p>
      <p className="text-lightGrey">{experience.date}</p>
      <ul className="list-disc mt-4 pl-4">
        {experience.responsibilities.map((resp, index) => (
          <li key={index}>{resp}</li>
        ))}
      </ul>
    </motion.div>
  );
};

export default SingleExperience;
