const AboutMeImage = () => {
  return (
    <div className="relative mx-auto w-[240px] h-[400px] sm:w-[280px] sm:h-[460px] md:w-[300px] md:h-[500px] max-w-full">
      <div className="absolute inset-0 rounded-[80px] sm:rounded-[100px] overflow-hidden">
        <img
          src="/images/profile/about.jpg"
          alt="About Me Image"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute bottom-[-20px] left-[-20px] sm:bottom-[-30px] sm:left-[-30px] w-[200px] h-[400px] sm:w-[230px] sm:h-[460px] md:w-[250px] md:h-[500px] bg-orange rounded-bl-[100px] sm:rounded-bl-[120px] rounded-tr-[100px] sm:rounded-tr-[120px] rounded-br-[20px] rounded-tl-[20px] -z-10" />
    </div>
  );
};

export default AboutMeImage;
