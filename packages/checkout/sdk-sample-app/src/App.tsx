import { Box, Button } from '@biom3/react';
import { Link, useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();

  return (
    <Box>
      <Button onClick={() => navigate('/connect')}>Connect</Button>
    </Box>
  );
}
