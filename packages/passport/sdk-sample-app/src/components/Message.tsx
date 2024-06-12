import { ButtCon, Sticker } from '@biom3/react';
import { Form } from 'react-bootstrap';
import React, { useEffect } from 'react';
import { useStatusProvider } from '@/context/StatusProvider';
import CardStack from '@/components/CardStack';

function Message() {
  const { messages, clearMessages } = useStatusProvider();

  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [messages]);

  return (
    <CardStack title="Message">
      <Sticker
        style={{ width: '100%' }}
        position={{ x: 'right', y: 'top' }}
      >
        <Form>
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
        <Sticker.FramedIcon
          icon="Close"
          circularFrame
          sx={{
            cursor: 'pointer',
          }}
          onClick={clearMessages}
        />
      </Sticker>
    </CardStack>
  );
}

export default Message;
