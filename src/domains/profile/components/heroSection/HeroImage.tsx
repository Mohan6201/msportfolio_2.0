import { PiHexagonThin } from "react-icons/pi";

const HeroImage = () => {
  return (
    <div className="relative self-end h-full w-full items-center justify-center overflow-hidden">
      <div className="h-full w-full">
        <img
          src="/icons/icon-512.png"
          alt="MS Logo"
          className="w-auto h-auto max-w-[180px] sm:max-w-[240px] md:max-w-[320px] absolute bottom-0 z-10 left-1/2 -translate-x-1/2 opacity-80"
        />
        <div className="w-full h-full absolute bottom-[-20%] -z-10 flex justify-center items-center rotate-90">
          <PiHexagonThin className="h-[80%] min-h-[320px] sm:min-h-[450px] md:min-h-[600px] md:h-[90%] w-auto text-orange opacity-70 animate-[spin_20s_linear_infinite]" />
        </div>
        <div className="w-full h-full absolute bottom-[-20%] -z-10 flex justify-center items-center rotate-90">
          <PiHexagonThin className="h-[80%] blur-lg min-h-[320px] sm:min-h-[450px] md:min-h-[600px] md:h-[90%] w-auto text-orange opacity-70 animate-[spin_20s_linear_infinite]" />
        </div>
        <div className="w-full h-full absolute bottom-[-20%] -z-10 flex justify-center items-center">
          <PiHexagonThin className="h-[80%] min-h-[320px] sm:min-h-[450px] md:min-h-[600px] md:h-[90%] w-auto text-cyan opacity-70 animate-[spin_20s_linear_infinite]" />
        </div>
        <div className="w-full h-full absolute bottom-[-20%] -z-10 flex justify-center items-center">
          <PiHexagonThin className="h-[80%] min-h-[320px] sm:min-h-[450px] md:min-h-[600px] md:h-[90%] w-auto text-cyan opacity-70 blur-lg animate-[spin_20s_linear_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default HeroImage;
