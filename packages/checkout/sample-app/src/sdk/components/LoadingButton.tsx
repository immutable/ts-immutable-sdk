import { Button, Icon } from '@biom3/react';

type LoadingButtonProps = {
  loading: boolean;
  onClick: () => {};
  children: React.ReactNode;
};

const LoadingButton = ({ loading, onClick, children }: LoadingButtonProps) => {
  return (
    <Button onClick={onClick} size="small" disabled={loading}>
      {children}{' '}
      {loading && <Icon icon="Loading" sx={{ fill: 'base.color.brand.2' }} />}
    </Button>
  );
};

export default LoadingButton;
