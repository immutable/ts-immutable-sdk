import React from 'react';
import {
  Col, Container, Row, Spinner, ToggleButton, ToggleButtonGroup,
} from 'react-bootstrap';
import { EnvironmentNames, EnvironmentPropsType } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import CardStack from '@/components/CardStack';
import { useStatusProvider } from '@/context/StatusProvider';

function Environment({ disabled }: EnvironmentPropsType) {
  const { isLoading } = useStatusProvider();
  const { environment, setEnvironment } = useImmutableProvider();

  const onClick = (name: EnvironmentNames) => {
    if (setEnvironment) {
      setEnvironment(name);
    }
  };

  return (
    <CardStack title="Environment">
      <Container fluid>
        <Row>
          <Col>
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
          </Col>
          {
            isLoading && <Spinner />
          }
        </Row>
      </Container>
    </CardStack>
  );
}

export default Environment;
