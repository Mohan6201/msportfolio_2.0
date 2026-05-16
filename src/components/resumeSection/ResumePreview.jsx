import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsFillFileEarmarkArrowDownFill } from 'react-icons/bs';

const ResumePreview = ({ file }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const previewRef = useRef(null);
  const hideTimeout = useRef(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const images = [
    '/images/Resume1.png',
    '/images/Resume2.png',
  ];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showButtonsTemporarily = () => {
    setShowButtons(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowButtons(false), 2000);
  };

  const handleMouseMove = (e) => {
    const deltaX = Math.abs(e.clientX - lastMousePosition.current.x);
    const deltaY = Math.abs(e.clientY - lastMousePosition.current.y);

    if (deltaX > 2 || deltaY > 2) {
      showButtonsTemporarily();
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  useEffect(() => {
    const currentRef = previewRef.current;
    if (currentRef) {
      currentRef.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('mousemove', handleMouseMove);
      }
      clearTimeout(hideTimeout.current);
    };
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file;
    link.download = "Mohan (Resume).pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      ref={previewRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.8,
        delay: 0.3,
      }}
      className="w-full flex items-center justify-center p-0 m-0 bg-gray-900"
    >
      <div className="relative w-full max-w-[420px] sm:max-w-[600px] aspect-[3/4] overflow-hidden bg-black rounded-lg shadow-lg mb-0 pb-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Resume ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-contain select-none"
            draggable={false}
          />
        </AnimatePresence>

        {/* Left Button */}
        <motion.button
          onClick={prevImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: showButtons ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:bg-orange transition-colors duration-300 z-20 select-none"
          aria-label="Previous Image"
        >
          <span className="text-2xl font-bold select-none">‹</span>
        </motion.button>

        {/* Right Button */}
        <motion.button
          onClick={nextImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: showButtons ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:bg-orange transition-colors duration-300 z-20 select-none"
          aria-label="Next Image"
        >
          <span className="text-2xl font-bold select-none">›</span>
        </motion.button>

        {/* Dots */}
        <div className="absolute bottom-2 w-full flex justify-center items-center gap-2">
          {images.map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-cyan-400 scale-110 shadow-lg'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Download Button */}
        <div className="absolute top-4 right-4 z-30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="px-4 py-2 bg-cyan text-white rounded-md flex items-center gap-2 hover:bg-orange transition-all duration-300 shadow-md text-sm"
          >
            <BsFillFileEarmarkArrowDownFill className="text-base" />
            Download
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumePreview;
