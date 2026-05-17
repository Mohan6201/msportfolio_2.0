import SingleContactSocial from "./SingleContactSocial";
import { socialLinks } from "@/data/portfolio.config";

const ContactSocial = () => {
  return (
    <div className="flex gap-4">
      {socialLinks.map((item, index) => (
        <SingleContactSocial
          key={index}
          Icon={item.Icon}
          link={item.link}
          target={item.target}
          rel={item.rel}
        />
      ))}
    </div>
  );
};

export default ContactSocial;
