"use client";
import SingleSkill from "./SingleSkill";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { skills } from "@/data/portfolio.config";

const AllSkills = () => {
  return (
    <div>
      <div className="flex items-center justify-center relative gap-2 max-w-[1200px] mx-auto">
        {skills.map((item, index) => (
          <motion.div
            key={index}
            variants={fadeIn("up", Number(`0.${index}`))}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0 }}
          >
            <SingleSkill text={item.skill} imgSvg={<item.icon />} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AllSkills;
