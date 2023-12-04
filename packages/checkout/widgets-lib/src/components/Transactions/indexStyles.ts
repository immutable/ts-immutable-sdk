export const transactionsListStyle = (showExternalLink: boolean) => {
  let height = 486;

  if (showExternalLink) height -= 80;

  return {
    backgroundColor: 'base.color.neutral.800',
    px: 'base.spacing.x4',
    pt: 'base.spacing.x5',
    borderRadius: 'base.borderRadius.x6',
    h: `${height}px`,
    overflowY: 'scroll',
    mb: 'base.spacing.x2',
  };
};
