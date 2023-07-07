import { Card, Stack } from 'react-bootstrap';
import React from 'react';
import { Heading } from '@biom3/react';
import { useStatusProvider } from '@/context/StatusProvider';

function Message() {
  const { message } = useStatusProvider();
  return (
    <Card>
      <Stack direction="horizontal" gap={3}>
        <Card.Title><Heading size="small">Message</Heading></Card.Title>
        <Card.Body style={{ display: 'flex', alignItems: 'center', minHeight: '5rem' }} className="text-dark">
          <p style={{ }}>
            { message }
          </p>
        </Card.Body>
      </Stack>
    </Card>
  );
}

export default Message;
