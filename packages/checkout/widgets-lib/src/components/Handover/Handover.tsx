import React, { Fragment } from 'react';
import {
  LoadingOverlay,
  Stack,
} from '@biom3/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHandover } from '../../lib/hooks/useHandover';
import { HandoverAnimation } from './HandoverAnimation';

const contentAnimation = {
  hidden: { y: 8, opacity: 0 },
  show: (i) => ({
    height: '100%',
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.2,
      ease: 'easeOut',
    },
  }),
  exit: { y: -8, opacity: 0 },
};

export function Handover({ id, children }: { id: string, children?: React.ReactNode }) {
  const { handover, loader } = useHandover({ id });

  let renderChildren: any = [];
  if (handover?.children) {
    if (React.isValidElement(handover.children) && handover.children.type === Fragment) {
      renderChildren = handover.children.props.children;
    } else {
      renderChildren = handover.children;
    }
  }

  return (
    <>
      {children}
      {loader && (
        <LoadingOverlay visible>
          <LoadingOverlay.Content>
            <LoadingOverlay.Content.LoopingText
              text={[...loader.text]}
              textDuration={loader.duration}
            />
          </LoadingOverlay.Content>
        </LoadingOverlay>
      )}
      {handover && (renderChildren || handover.animationUrl) && (
        <Stack
          sx={{
            backgroundColor: 'base.color.neutral.1000',
            position: 'absolute',
            zIndex: '1',
            textAlign: 'center',
            flex: 1,
            top: '0px',
            bottom: '0px',
            left: '0px',
            right: '0px',
          }}
        >
          {handover?.animationUrl?.length && (
            <HandoverAnimation
              key={handover.animationUrl}
              url={handover.animationUrl}
              inputValue={handover.inputValue}
            />
          )}
          <Stack
            sx={{
              height: '100%',
              px: 'base.spacing.x6',
              py: 'base.spacing.x10',
              textAlign: 'center',
              flex: 1,
            }}
            gap="base.spacing.x4"
          >
            <AnimatePresence>
              {React.Children.map(renderChildren, (child, index) => (
                <motion.div
                  key={(child as any)?.key ?? `Key${index}`} // Ensure each child has a unique key
                  variants={contentAnimation}
                  custom={index}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {child}
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>
        </Stack>
      )}
    </>
  );
}
