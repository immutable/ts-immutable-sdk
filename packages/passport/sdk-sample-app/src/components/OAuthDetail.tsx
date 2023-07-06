import React from 'react';
import { Accordion } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';

function OAuthDetail() {
  const { idToken, accessToken } = usePassportProvider();
  return (
    <Accordion className="pe-0">
      <Accordion.Item eventKey="0" className="p-0">
        <Accordion.Header>OAuth Detail</Accordion.Header>
        <Accordion.Body>
          <ul>
            <li>
              <p>
                {`ID Token: ${idToken}`}
              </p>
            </li>
            <li>
              <p>
                {`Access Token: ${accessToken}`}
              </p>
            </li>
          </ul>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
export default OAuthDetail;
