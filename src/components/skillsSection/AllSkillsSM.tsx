"use client";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { skills } from "@/data/portfolio.config";

const AllSkillsSM = () => {
  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-12 my-12">
      {skills.map((item, index) => (
        <motion.div
          key={index}
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.7 }}
          className="flex flex-col items-center"
        >
          <item.icon className="text-7xl text-orange" />
          <p className="text-center mt-4">{item.skill}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default AllSkillsSM;
