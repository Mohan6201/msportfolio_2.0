import { Link } from "react-scroll";

// ✅ Added import for Redux dispatch and action to close the menu
import { useDispatch } from "react-redux"; // <-- added
import { toggleMenu } from "../../state/menuSlice"; // <-- added

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
  // ✅ Added dispatch to allow closing the menu
  const dispatch = useDispatch(); // <-- added

  // ✅ Function to close the menu on link click (especially useful on mobile)
  const handleLinkClick = () => {
    dispatch(toggleMenu()); // <-- added
  };

  return (
    <ul className="flex lg:flex-row sm:flex-col gap-6 text-white font-body lg:relative sm:absolute sm:top-[120%] text-center left-[50%] -translate-x-[50%] lg:text-md sm:text-xl sm:bg-cyan/30 backdrop-blur-lg lg:bg-black sm:w-full py-4">
      {links.map((link, index) => {
        return (
          <li key={index} className="group">
            <Link
              spy={true}
              smooth={true}
              duration={500}
              offset={-130}
              to={link.section}
              onClick={handleLinkClick} // <-- added to close menu after clicking
              className="cursor-pointer text-white hover:text-cyan transition-all duration-500"
            >
              {link.link}
            </Link>
            <div className="mx-auto bg-cyan w-0 group-hover:w-full h-[1px] transition-all duration-500"></div>
          </li>
        );
      })}
    </ul>
  );
};

export default NavbarLinks;
