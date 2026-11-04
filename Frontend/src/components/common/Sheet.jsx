import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Slide-over Sheet / Drawer component adhering to modern shadcn / reui.io design
 * Full dark cinematic glassmorphism style for FLIX
 */
const Sheet = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  maxWidth = 'max-w-xl',
  className = '',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const slideVariants = {
    hidden: {
      x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
      y: side === 'bottom' ? '100%' : 0,
      opacity: 0.9,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 28, stiffness: 280 },
    },
    exit: {
      x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
      y: side === 'bottom' ? '100%' : 0,
      opacity: 0.8,
      transition: { duration: 0.25, ease: 'easeInOut' },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Slide-over panel */}
          <div
            className={`fixed inset-y-0 ${
              side === 'right' ? 'right-0' : 'left-0'
            } flex w-full ${maxWidth} pl-4 sm:pl-10`}
          >
            <motion.div
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              className={`relative flex w-full flex-col border-l border-white/10 bg-[#121215]/95 backdrop-blur-2xl text-white shadow-[0_0_80px_rgba(0,0,0,0.9)] ${className}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
                <div>
                  {title && (
                    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-xs text-white/60 sm:text-sm">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/15 hover:text-white active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable content body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-white/20">
                {children}
              </div>

              {/* Optional footer */}
              {footer && (
                <div className="border-t border-white/10 bg-[#0c0c0e]/90 px-6 py-4">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Sheet;
