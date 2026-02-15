import { Variants } from "framer-motion";

  export const overlay: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.18,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.16,
        ease: [0.4, 0, 1, 1],
      },
    },
  };

  export const modal: Variants = {
    hidden: {
      opacity: 0,
      y: 14,
      scale: 0.985,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.99,
      transition: {
        duration: 0.18,
        ease: [0.4, 0, 1, 1],
      },
    },
  };

export const toast: Variants = {
    hidden: { opacity: 0, y: -8, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.18,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.98,
      transition: {
        duration: 0.16,
        ease: [0.4, 0, 1, 1],
      },
    },
  };