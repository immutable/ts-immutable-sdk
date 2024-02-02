export const transactionsListStyle = (showPassportLink: boolean) => {
  let height = 440;

  if (showPassportLink) {
    height -= 20;
  }

  return {
    backgroundColor: 'base.color.neutral.800',
    px: 'base.spacing.x4',
    pt: 'base.spacing.x5',
    pb: 'base.spacing.x4',
    borderRadius: 'base.borderRadius.x6',
    h: `${height}px`,
    w: '100%',
    overflowY: 'scroll',
  };
};

export const containerStyles = {
  borderRadius: 'base.borderRadius.x4',
  display: 'flex',
  flexDirection: 'column',
  gap: 'base.spacing.x5',
};
