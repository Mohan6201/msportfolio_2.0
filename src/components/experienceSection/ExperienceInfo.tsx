interface ExperienceInfoProps {
  number: string;
  text: string;
}

const ExperienceInfo = ({ number, text }: ExperienceInfoProps) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <p className="font-bold text-6xl text-cyan">{number}</p>
      <p className="font-bold text-xl text-lightGrey uppercase -mt-4">{text}</p>
    </div>
  );
};

export default ExperienceInfo;
