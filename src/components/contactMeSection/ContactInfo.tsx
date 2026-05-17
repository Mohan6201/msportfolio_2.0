import SingleInfo from "./SingleInfo";
import { contactDetails } from "@/data/portfolio.config";

const ContactInfo = () => {
  return (
    <div className="flex flex-col gap-4">
      {contactDetails.map((item, index) => (
        <SingleInfo key={index} text={item.text} Image={item.Icon} />
      ))}
    </div>
  );
};

export default ContactInfo;
