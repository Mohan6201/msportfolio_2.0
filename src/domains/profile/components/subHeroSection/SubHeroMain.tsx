const ITEMS = ["Fast Learner", "Team Work", "Details Master"];

const SubHeroMain = () => {
  return (
    <div className="w-full border-y bg-brown border-lightGrey/40 text-lightGrey uppercase overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-around items-center gap-3 sm:gap-4 px-4 sm:px-6 py-6 sm:py-8 text-center">
        {ITEMS.map((item, i) => (
          <div key={item} className="flex items-center gap-3 sm:gap-0">
            <p className="text-lg sm:text-2xl md:text-2xl xl:text-4xl font-special tracking-wide whitespace-nowrap">
              {item}
            </p>
            {i < ITEMS.length - 1 && (
              <span className="hidden sm:inline text-cyan/40 mx-2">·</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubHeroMain;
