import type { ComponentType } from "react";

interface SingleContactSocialProps {
  Icon: ComponentType<{ className?: string }>;
  link: string;
  target?: string;
  rel?: string;
}

const SingleContactSocial = ({ Icon, link, target, rel }: SingleContactSocialProps) => {
  return (
    <div className="text-2xl h-12 w-12 border border-orange text-orange rounded-full p-3 flex items-center justify-center">
      <a href={link} target={target} rel={rel} className="cursor-pointer">
        <Icon />
      </a>
    </div>
  );
};

export default SingleContactSocial;
