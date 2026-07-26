import { Card, Stack } from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { CardStackPropsType } from '@/types';

function CardStack({ title, children }: CardStackPropsType) {
  return (
    <Card>
      <Stack direction="horizontal" gap={3}>
        <Card.Title style={{ width: '10vw', minWidth: '128px' }}>
          <Heading size="small">{title}</Heading>
        </Card.Title>
        <Card.Body>
          { children }
        </Card.Body>
      </Stack>
    </Card>
  );
}

export default CardStack;
