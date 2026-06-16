const HeroGradient = () => {
  return (
    <div className="hidden md:block">
      <div className="shadow-cyanMediumShadow absolute top-0 right-[400px] -z-10 animate-pulse" />
      <div className="shadow-cyanMediumShadow absolute top-[5%] left-0 -z-10 opacity-50" />
      <div className="shadow-orangeMediumShadow absolute top-0 right-0 -z-10 animate-pulse" />
    </div>
  );
};

export default HeroGradient;
