"use client";
import { Link } from "react-scroll";

const AboutMeText = () => {
  return (
    <div className="flex flex-col md:items-start sm:items-center md:text-left sm:text-center">
      <h2 className="text-6xl text-cyan mb-10">About Me</h2>
      <p>
        Hey there, this is Mohana Srinivasan, a DevOps Engineer with practical experience in deploying and managing
        cloud-based applications on Amazon Linux and AWS infrastructure. I specialize in automation,
        CI/CD pipeline implementation, and containerization to streamline software development and delivery.
        I have worked extensively with tools like Docker, GitHub Actions, and Supervisor, and have hands-on
        experience deploying Django, React, and MySQL-based applications in production environments.
        I&apos;m passionate about building reliable, scalable systems and continuously improving infrastructure performance.
        I enjoy continuous learning and sharing knowledge to inspire others to achieve their goals.
      </p>
      <button className="border border-orange rounded-full py-2 px-4 text-lg flex gap-2 items-center mt-10 hover:bg-orange transition-all duration-500 cursor-pointer md:self-start sm:self-center">
        <Link
          spy={true}
          smooth={true}
          duration={500}
          offset={-120}
          to="projects"
          className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
        >
          My Projects
        </Link>
      </button>
    </div>
  );
};

export default AboutMeText;
