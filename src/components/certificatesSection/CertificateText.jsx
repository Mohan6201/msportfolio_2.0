import { motion } from "framer-motion";

const CertificateText = () => {
  return (
    <motion.div
      className="flex flex-col items-center mt-[100px]"
      initial={{ x: -200, y: -100, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, duration: 1 }}
    >
      <h2 className="text-6xl text-cyan mb-10 text-center">Certificates</h2>
    </motion.div>
  );
};

export default CertificateText;
