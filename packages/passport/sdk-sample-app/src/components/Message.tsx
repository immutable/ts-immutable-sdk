import { Sticker } from '@biom3/react';
import React, { useEffect, useRef, useState } from 'react';
import { useStatusProvider } from '@/context/StatusProvider';
import CardStack from '@/components/CardStack';

const INITIAL_HEIGHT = 300;
const SCROLL_THRESHOLD = 20;
const HEIGHT_INCREMENT = 100;

function Message() {
  const { messages, clearMessages } = useStatusProvider();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(INITIAL_HEIGHT);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isBottom = Math.abs(
      container.scrollHeight - container.scrollTop - container.clientHeight,
    ) < SCROLL_THRESHOLD;
    setIsAtBottom(isBottom);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const shouldScrollToBottom = isAtBottom
      || messages.length > (parseInt(container.dataset.prevLength || '0', 10));

    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    container.dataset.prevLength = messages.length.toString();
  }, [messages, isAtBottom]);

  const handleExpand = () => setContainerHeight((prev) => prev + HEIGHT_INCREMENT);
  const handleShrink = () => setContainerHeight((prev) => Math.max(INITIAL_HEIGHT, prev - HEIGHT_INCREMENT));

  const baseIconStyles = {
    cursor: 'pointer',
    position: 'absolute',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease',
  };

  const arrowIconStyles = {
    ...baseIconStyles,
    bottom: '-24px',
    transform: 'translateX(-50%)',
    '&:hover': {
      transform: 'translateX(-50%) translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
  };

  return (
    <CardStack title="Message">
      <Sticker
        sx={{
          width: '100%',
          height: `${containerHeight}px`,
          padding: '16px',
          position: 'relative',
          backgroundColor: 'base.color.translucent.standard.100',
          transition: 'height 0.3s ease',
        }}
        position={{ x: 'right', y: 'top' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #E6E6E6',
          }}
        >
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              padding: '12px',
            }}
          >
            {messages.map((message, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                style={{
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontFamily: 'Monaco, monospace',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <Sticker.FramedIcon
            icon="ArrowUp"
            circularFrame
            emphasized
            sx={{
              ...arrowIconStyles,
              left: 'calc(50% - 24px)',
              opacity: containerHeight > INITIAL_HEIGHT ? 1 : 0.5,
              cursor: containerHeight > INITIAL_HEIGHT ? 'pointer' : 'not-allowed',
            }}
            onClick={handleShrink}
          />

          <Sticker.FramedIcon
            icon="ArrowDown"
            circularFrame
            emphasized
            sx={{
              ...arrowIconStyles,
              left: 'calc(50% + 24px)',
            }}
            onClick={handleExpand}
          />
        </div>

        <Sticker.FramedIcon
          icon="Close"
          circularFrame
          emphasized
          sx={{
            ...baseIconStyles,
            top: '16px',
            right: '16px',
            zIndex: 1,
            transform: 'translate(0, 0)',
            '&:hover': {
              transform: 'translate(0, -2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            },
          }}
          onClick={clearMessages}
        />
      </Sticker>
    </CardStack>
  );
}

export default Message;
