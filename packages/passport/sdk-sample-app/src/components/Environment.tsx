import { Heading } from '@biom3/react';
import React from 'react';
import {
  Card, Stack, ToggleButton, ToggleButtonGroup,
} from 'react-bootstrap';
import { EnvironmentNames, EnvironmentPropsType } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';

function Environment({ disabled }: EnvironmentPropsType) {
  const { environment, setEnvironment } = useImmutableProvider();
  const onClick = (name: EnvironmentNames) => {
    if (setEnvironment) {
      setEnvironment(name);
    }
  };

  return (
    <Card>
      <Stack direction="horizontal" gap={3}>
        <Card.Title>
          <Heading size="small">Environment</Heading>
        </Card.Title>
        <Card.Body>
          <ToggleButtonGroup
            name="environment"
            value={environment}
            onChange={onClick}
            type="radio"
          >
            {Object.entries(EnvironmentNames).map(([key, value]) => (
              <ToggleButton
                key={key}
                id={`radio-${key}`}
                type="radio"
                variant="outline-dark"
                name="environment"
                value={value}
                disabled={disabled}
              >
                {value}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Card.Body>
      </Stack>
    </Card>
  );
}

export default Environment;
