import { Divider, Heading } from '@biom3/react';
import React, { useState } from 'react';
import { Accordion, Stack } from 'react-bootstrap';
import { RequestExampleAccordionProps } from '@/types';
import { RequestArguments } from '@imtbl/passport';

function RequestExampleAccordion({ disabled, examples, handleExampleSubmitted }: RequestExampleAccordionProps) {
  const [activeAccordionKey, setActiveAccordionKey] = useState<string | string[] | undefined | null>('');

  const handleAccordionSelect = (eventKey: string | string[] | undefined | null) => {
    setActiveAccordionKey(eventKey);
  };

  return (
    <Stack gap={3} style={{ marginTop: '24px' }}>
      <Divider />
      <Heading
        rc={<h2 />}
        size="medium"
      >
        Examples
      </Heading>
      <Accordion activeKey={activeAccordionKey} onSelect={handleAccordionSelect}>
        {
          examples?.map((component) => (
            React.createElement(component, {
              key: component.name,
              handleExampleSubmitted: (request: RequestArguments, onSuccess?: (result?: any) => Promise<void>) => {
                setActiveAccordionKey('');
                return handleExampleSubmitted(request, onSuccess);
              },
              disabled,
            })
          ))
        }
      </Accordion>
    </Stack>
  );
}

export default RequestExampleAccordion;
