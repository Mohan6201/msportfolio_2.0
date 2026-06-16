"use client";
import { GiHamburgerMenu } from "react-icons/gi";
import { useMenuStore } from "@/domains/profile/state/useMenuStore";

const NavbarToggler = () => {
  const { menuOpen, toggleMenu } = useMenuStore();

  return (
    <button
      onClick={toggleMenu}
      aria-label="Toggle menu"
      className="text-2xl p-3 border border-orange rounded-full
                 hover:bg-orange hover:text-black transition-colors duration-300
                 flex items-center justify-center"
    >
      <GiHamburgerMenu
        className={`transition-transform duration-300 ${menuOpen ? "rotate-90" : ""}`}
      />
    </button>
  );
};

export default NavbarToggler;
