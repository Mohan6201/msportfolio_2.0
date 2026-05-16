import ResumeText from "./ResumeText";
import { motion } from "framer-motion";
import { fadeIn } from "../../framerMotion/variants";
import ResumePreview from "./ResumePreview";

const ResumeMain = () => {
  const resumeFile = "/assets/Mohana Srinivasan (Resume).pdf"; // Make sure this path is correct

  return (
    <div
      id="resume"
      className="max-w-screen-xl mx-auto px-3 sm:px-6 py-6 sm:py-12 !mb-0"
    >
      <ResumeText />

      <motion.div
        variants={fadeIn("top", 0.2)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.5 }}
        className="mt-12 flex flex-col items-center gap-8"
      >
        <ResumePreview file={resumeFile} />
      </motion.div>
    </div>
  );
};

export default ResumeMain;
