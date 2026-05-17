import type { ComponentType } from "react";

interface SingleInfoProps {
  text: string;
  Image: ComponentType<{ className?: string }>;
}

const SingleInfo = ({ text, Image }: SingleInfoProps) => {
  return (
    <div className="flex gap-4 items-center justify-start">
      <Image className="text-3xl" />
      <p>{text}</p>
    </div>
  );
};

export default SingleInfo;
