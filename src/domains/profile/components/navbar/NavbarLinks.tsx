"use client";
import { Link } from "react-scroll";
import NextLink from "next/link";
import { useMenuStore } from "@/domains/profile/state/useMenuStore";

const links = [
  { link: "About Me", section: "about" },
  { link: "Skills", section: "skills" },
  { link: "Experience", section: "experience" },
  { link: "Certificates", section: "certificates" },
  { link: "Projects", section: "projects" },
  { link: "Resume", section: "resume" },
  { link: "Contact", section: "contact" },
];

const NavbarLinks = () => {
  const closeMenu = useMenuStore((state) => state.closeMenu);

  return (
    <ul className="flex lg:flex-row sm:flex-col gap-6 text-white font-body lg:relative sm:absolute sm:top-[120%] text-center left-[50%] -translate-x-[50%] lg:text-md sm:text-xl sm:bg-cyan/30 backdrop-blur-lg lg:bg-black sm:w-full py-4">
      {links.map((item, index) => (
        <li key={index} className="group">
          <Link
            spy={true}
            smooth={true}
            duration={500}
            offset={-130}
            to={item.section}
            onClick={closeMenu}
            className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
          >
            {item.link}
          </Link>
          <div className="mx-auto bg-cyan w-0 group-hover:w-full h-[1px] transition-all duration-500" />
        </li>
      ))}
      <li className="group">
        <NextLink
          href="/blog"
          onClick={closeMenu}
          className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
        >
          Blog
        </NextLink>
        <div className="mx-auto bg-cyan w-0 group-hover:w-full h-[1px] transition-all duration-500" />
      </li>
      <li className="group">
        <NextLink
          href="/devops-toolkit"
          onClick={closeMenu}
          className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
        >
          Toolkit
        </NextLink>
        <div className="mx-auto bg-cyan w-0 group-hover:w-full h-[1px] transition-all duration-500" />
      </li>
      <li className="group">
        <NextLink
          href="/architecture"
          onClick={closeMenu}
          className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
        >
          Architecture
        </NextLink>
        <div className="mx-auto bg-cyan w-0 group-hover:w-full h-[1px] transition-all duration-500" />
      </li>
      <li className="group">
        <NextLink
          href="/services"
          onClick={closeMenu}
          className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
        >
          Services
        </NextLink>
        <div className="mx-auto bg-cyan w-0 group-hover:w-full h-[1px] transition-all duration-500" />
      </li>
      <li className="group">
        <NextLink
          href="/monitoring-demo"
          onClick={closeMenu}
          className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
        >
          Monitoring
        </NextLink>
        <div className="mx-auto bg-cyan w-0 group-hover:w-full h-[1px] transition-all duration-500" />
      </li>
      <li className="group">
        <NextLink
          href="/blueprints"
          onClick={closeMenu}
          className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
        >
          Blueprints
        </NextLink>
        <div className="mx-auto bg-cyan w-0 group-hover:w-full h-[1px] transition-all duration-500" />
      </li>
    </ul>
  );
};

export default NavbarLinks;
