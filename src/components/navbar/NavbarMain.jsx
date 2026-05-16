import NavbarLogo from "./NavbarLogo";
import NavbarLinks from "./NavbarLinks";
import NavbarBtn from "./NavbarBtn";
import NavbarToggler from "./NavbarToggler";
import { useSelector } from "react-redux";

const NavbarMain = () => {
  const menuOpen = useSelector((state) => state.menu.menuOpen);

  return (
    <nav className="w-full fixed top-0 z-20 px-4">
      {/* MAIN NAVBAR */}
      <div className="flex items-center justify-between bg-black border mt-3 border-orange rounded-full px-4 py-3 max-w-[1300px] mx-auto">
        {/* Left: Logo */}
        <NavbarLogo />

        {/* Center: Nav Links for Desktop */}
        <div className="hidden lg:block">
          <NavbarLinks />
        </div>

        {/* Right: Button + Toggler */}
        <div className="flex items-center gap-3">
          <NavbarBtn />
          <div className="lg:hidden">
            <NavbarToggler />
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {menuOpen && (
        <div className="lg:hidden max-w-[1300px] mx-auto px-4 py-2">
          <NavbarLinks />
        </div>
      )}
    </nav>
  );
};

export default NavbarMain;
