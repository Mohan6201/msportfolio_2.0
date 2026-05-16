import SingleContactSocial from "./SingleContactSocial";
import { FaLinkedinIn } from "react-icons/fa";
import { FiGithub } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";

const ContactSocial = () => {
  return (
    <div className="flex gap-4">
      <SingleContactSocial link="https://www.linkedin.com/in/mohan6201"   target="_blank"  rel="noopener noreferrer"   Icon={FaLinkedinIn} />
      <SingleContactSocial link="https://github.com/Mohan6201" target="_blank"  rel="noopener noreferrer" Icon={FiGithub} />
      <SingleContactSocial link="#"  Icon={FaInstagram} />
    </div>
  );
};

export default ContactSocial;
