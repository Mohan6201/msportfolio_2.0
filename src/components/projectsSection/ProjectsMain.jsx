import ProjectsText from "./ProjectsText";
import SingleProject from "./SingleProject";
import { motion } from "framer-motion";
import { fadeIn } from "../../framerMotion/variants";

const projects = [
  {
    name: "React Portfolio Web App",
    year: "April2025",
    align: "right",
    image: "/images/Reactp2.png",
    link: "https://ms-portfolio-caee4.web.app/",
    description: {
      responsibilities: [
        "Implemented CI/CD pipeline with GitHub Actions for Firebase Hosting, enabling automated deployments and preview channels for pull requests.",
        "Built a personal portfolio web app using React to showcase skills, projects, and experience.",
        "Added smooth animations and interactive transitions using Framer Motion for enhanced user experience.",
        "Integrated project cards, skill badges, and animated sections for dynamic presentation.",
        "Optimized for performance and mobile responsiveness across all screen sizes.",
        "Structured the app with reusable components and clean code architecture for scalability.",
        "Deployed the app on a cloud platform using firebase hosting",
      ],
    },
  },
  {
    name: "Txenia Web App",
    year: "Nov2023",
    align: "left",
    image: "/images/Txenia.png",
    link: "https://txenia.ai/",
    description: {
      responsibilities: [
        "Developed the web application using Django (backend) and React (frontend).",
        "Automated service management using Supervisor and Python shell scripts.",
        "Integrated MLflow for live model prediction metrics and experiment tracking.",
        "Used Apache Superset for database visualization and model result dashboards.",
        "Configured Route 53 with load balancer DNS for production-ready access.",
        "Set up virtual environments for isolated service deployments and model execution.",
        "Designed the system to support warehouse management operations end-to-end.",
      ],
    },
  },
  {
    name: "Good Eggs",
    year: "Jan2023",
    align: "right",
    image: "/images/Goodeggs.png",
    link: "https://www.goodeggs.com/",
    description: {
      responsibilities: [
        "Migrated Page Editor, Advantage Architect, Bartender, and SSMS from HighJump to Korber across DEV, UAT, and PROD environments.",
        "Modified application URLs in Page Editor and configured IIS Manager for hosting the Korber Core app.",
        "Managed the Good Eggs ticketing portal to resolve order-related issues and reported bugs.",
        "Documented solutions and support workflows using Confluence and facilitated communication via Slack.",
      ],
    },
  },
  {
    name: "Dr.Max",
    year: "June2023",
    align: "left",
    image: "/images/dr.max.png",
    link: "https://www.drmax.eu/en/default",
    description: {
      responsibilities: [
        "Executed end-to-end warehouse operations, covering all processes from receiving to shipping.",
        "Configured Bartender software and modified stored procedures to align with deployment requirements.",
        "Performed sanity testing to validate deployments and ensure system stability for DEV, UAT, and PROD Environments.",
        "Set up initial printer configurations and configured remote printers on servers and tested it for DEV, UAT, and PROD Environments",
        "Migrated and deployed stored procedures, applications, and databases across DEV, UAT, and PROD environments."
      ],
    },
  },
];

const ProjectsMain = () => {
  return (
    <div id="projects" className="max-w-[1200px] mx-auto px-4">
      <motion.div
        variants={fadeIn("top", 0)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.7 }}
      >
        <ProjectsText />
      </motion.div>
      <div className="flex flex-col gap-20 max-w-[900px] mx-auto mt-12">
        {projects.map((project, index) => (
          <SingleProject
            key={index}
            name={project.name}
            year={project.year}
            align={project.align}
            image={project.image}
            link={project.link}
            description={project.description}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectsMain;
