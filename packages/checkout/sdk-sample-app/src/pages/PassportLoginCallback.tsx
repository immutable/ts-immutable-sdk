import { useEffect } from 'react';
import { passport } from '../passport';

export function PassportLoginCallback() {
  useEffect(() => {
    passport?.loginCallback();
  }, [passport])
  return(<></>);
}
