export const useAnimation = () => {
  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  const listItemVariants = {
    hidden: { y: 8, opacity: 0 },
    show: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.2,
        ease: 'easeOut',
      },
    }),
  };

  return {
    listVariants,
    listItemVariants,
  };
};
