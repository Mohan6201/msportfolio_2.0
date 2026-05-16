import SingleExperience from "./SingleExperience";
import { FaArrowRightLong } from "react-icons/fa6";
import { motion } from "framer-motion";
import { fadeIn } from "../../framerMotion/variants";

const experiences = [
  {
    job: "Trainee Consultant",
    company: "Enterprise SoftLabs Pvt Ltd",
    date: "APR2022 - DEC2022",
    responsibilities: [
      "Managing Supply Chain Management change requests for Maersk.",
      "Analyzed and modified SQL stored procedures using SSMS.",
      "Troubleshot Azure and Cisco VPN Connectivity and Server Network Issues.",
      "Handling product installation and configuration.",
      "Administering Windows Active Directory.",
    ],
  },
  {
    job: "Staff Consultant",
    company: "Enterprise SoftLabs Pvt Ltd",
    date: "DEC2022 - JUL2023",
    responsibilities: [
      "Migrated projects from HighJump to Körber (DB, apps, configs, Bartender, IIS, Remote Printers) for all three Environments(Dev, Uat, Prod).",
      "Managed Wms deployments across all environments with High Scalability.",
      "Installed and configured Windows Server 2022 on a physical machine for organizational use.",
    ],
  },
  {
    job: "Aws Dev-Ops Engineer",
    company: "Enterprise SoftLabs Pvt Ltd",
    date: "JUL2023 - AUG2025",
    responsibilities: [
      "Built CI/CD for Txenia AI/ML WMS app using CodePipeline and GitHub Actions.",
      "Managed AWS (EC2, S3, IAM, Route 53) for scalable infrastructure.",
      "Monitored app with CloudWatch and set up custom alerts.",
      "Deployed Dockerized services like prediction, data sync, and reporting via ECS.",
    ],
  },
];

const AllExperiences = () => {
  return (
    <div className="flex md:flex-row sm:flex-col items-center justify-between">
      {experiences.map((experience, index) => {
        return (
          <>
            <SingleExperience key={index} experience={experience} />
            {index < 2 ? (
              <motion.div
                variants={fadeIn("right", 0)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.7 }}
              >
                <FaArrowRightLong className="text-6xl text-orange lg:block sm:hidden" />
              </motion.div>
            ) : (
              ""
            )}
          </>
        );
      })}
    </div>
  );
};

export default AllExperiences;
