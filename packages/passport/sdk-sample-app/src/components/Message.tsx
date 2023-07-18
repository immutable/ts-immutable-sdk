import { Form } from 'react-bootstrap';
import React, { useEffect } from 'react';
import { useStatusProvider } from '@/context/StatusProvider';
import CardStack from '@/components/CardStack';

function Message() {
  const { messages } = useStatusProvider();

  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [messages]);

  return (
    <CardStack title="Message">
      <Form style={{ width: '100%' }}>
        <Form.Group>
          <Form.Control
            as="textarea"
            rows={6}
            value={`\n\n\n\n\n${messages.join('\n')}`}
            readOnly
            style={{
              fontSize: '0.8rem',
            }}
          />
        </Form.Group>
      </Form>
    </CardStack>
  );
}

export default Message;
