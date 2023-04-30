import { MenuItem } from '@biom3/react';
import { Body, Box, ButtCon, Divider } from '@biom3/react';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();

  return (
    <>
      <MenuItem
        href="#/moo"
        emphasized
        size="medium"
        onClick={() => navigate('/connect')}
      >
        <MenuItem.IntentIcon icon="ArrowForward" />
        <MenuItem.Label>Connect</MenuItem.Label>
        <MenuItem.Caption>
          Manage connections, switch networks, and access vital wallet/SDK
          information. Monitor wallet balances, retrieve balance data, and
          manage allowed lists for networks, wallets, and tokens, providing a
          streamlined experience for your digital asset needs.
        </MenuItem.Caption>
      </MenuItem>
    </>
  );
}
