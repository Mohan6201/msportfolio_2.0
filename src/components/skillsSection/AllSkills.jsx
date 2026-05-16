import SingleSkill from "./SingleSkill";
import { FaAws, FaDocker, FaFire, FaJenkins } from "react-icons/fa";
import { SiGithubactions, SiKubernetes, SiLinux, SiPython, SiTerraform } from "react-icons/si";
import { FaReact } from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeIn } from "../../framerMotion/variants";
import { TbBrandAnsible, TbBrandDjango } from "react-icons/tb";
import { GiArtificialIntelligence } from "react-icons/gi";

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

const AllSkills = () => {
  return (
    <div>
      <div className="flex items-center justify-center relative gap-2 max-w-[1200px] mx-auto">
        {skills.map((item, index) => {
          return (
            <motion.div
              variants={fadeIn("up", `0.${index}`)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0 }}
              key={index}
            >
              <SingleSkill
                key={index}
                text={item.skill}
                imgSvg={<item.icon />}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AllSkills;
