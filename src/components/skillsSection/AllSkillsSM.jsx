import { FaAws, FaDocker, FaFire, FaJenkins } from "react-icons/fa";
import { SiGithubactions, SiKubernetes, SiLinux, SiPython, SiTerraform } from "react-icons/si";
import { FaReact } from "react-icons/fa";
import { TbBrandAnsible, TbBrandDjango } from "react-icons/tb";
import { GiArtificialIntelligence } from "react-icons/gi";
import { motion } from "framer-motion";
import { fadeIn } from "../../framerMotion/variants";

const skills = [
  {
    skill: "Aws Services",
    icon: FaAws,
  },
  {
    skill: "Firebase",
    icon: FaFire,
  },
  {
    skill: "Docker",
    icon: FaDocker,
  },
  {
    skill: "Kubernetes",
    icon: SiKubernetes,
  },
  {
    skill: "Github Actions",
    icon: SiGithubactions,
  },
  {
    skill: "Python Shell Scripting",
    icon: SiPython,
  },
  {
      skill: "Django Framework",
      icon: TbBrandDjango,
  },
  {
    skill: "ReactJS",
    icon: FaReact,
  },
  {
    skill: "Ansible",
    icon: TbBrandAnsible,
  },
  {
    skill: "Terraform",
    icon: SiTerraform,
  },
  {
    skill: "Jenkins",
    icon: FaJenkins,
  },
  {
    skill: "AI-ML Model Deployments",
    icon: GiArtificialIntelligence,
  },
  {
    skill: "Linux",
    icon: SiLinux,
  },
];

const AllSkillsSM = () => {
  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-12 my-12">
      {skills.map((item, index) => {
        return (
          <motion.div
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.7 }}
            key={index}
            className="flex flex-col items-center"
          >
            <item.icon className="text-7xl text-orange" />
            <p className="text-center  mt-4">{item.skill}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AllSkillsSM;
