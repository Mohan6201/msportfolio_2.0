import { GiHamburgerMenu } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { toggleMenu } from "../../state/menuSlice";

const NavbarToggler = () => {
  const dispatch = useDispatch();
  const menuOpen = useSelector((state) => state.menu.menuOpen);

  const setToggleMenu = () => {
    dispatch(toggleMenu());
  };

  return (
    <button
      onClick={setToggleMenu}
      aria-label="Toggle menu"
      className="text-2xl p-3 border border-orange rounded-full 
                 hover:bg-orange hover:text-black transition-colors duration-300 
                 flex items-center justify-center"
    >
      <GiHamburgerMenu
        className={`transition-transform duration-300 ${
          menuOpen ? "rotate-90" : ""
        }`}
      />
    </button>
  );
};

export default NavbarToggler;
