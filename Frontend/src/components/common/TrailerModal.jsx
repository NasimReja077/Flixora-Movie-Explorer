import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TrailerModal = ({ isOpen, onClose, trailerKey, title }) => {
  if (!trailerKey && isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1A1111] p-8 rounded-2xl border border-white/10 text-center"
          >
            <h2 className="text-xl font-bold text-white mb-2">Trailer Unavailable</h2>
            <p className="text-gray-400 mb-6">Sorry, we couldn't find a trailer for this title.</p>
            <button
              onClick={onClose}
              className="bg-brand-red text-white px-6 py-2 rounded-full font-bold hover:bg-[#F40612] transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-brand-red rounded-full text-white transition-colors border border-white/10 backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Title Overlay (Temporary on load) */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute inset-0 z-10 flex items-end p-8 bg-linear-to-t from-black/80 to-transparent pointer-events-none"
            >
              <h2 className="text-white text-2xl font-bold">{title} - Official Trailer</h2>
            </motion.div>

            {/* Trailer Iframe */}
            <iframe
              src={`https://www.youtube.com/embed/${(() => {
                if (!trailerKey) return '';
                const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                const match = trailerKey.match(regExp);
                return (match && match[7].length === 11) ? match[7] : trailerKey;
              })()}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrailerModal;