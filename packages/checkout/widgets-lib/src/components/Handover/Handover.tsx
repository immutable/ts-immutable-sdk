import React from 'react';
import {
  Stack,
} from '@biom3/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHandover } from '../../lib/hooks/useHandover';
import { HandoverAnimation } from './HandoverAnimation';

const contentAnimation = {
  hidden: { y: 8, opacity: 0 },
  show: (i) => ({
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
  const { handover } = useHandover({ id });

  return (
    <>
      {children}
      {(handover?.children && (
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
          {(handover?.animationUrl && (
            <HandoverAnimation url={handover.animationUrl} />
          ))}
          <Stack
            sx={{
              px: 'base.spacing.x6',
              py: 'base.spacing.x10',
              textAlign: 'center',
              flex: 1,
            }}
            gap="base.spacing.x4"
          >
            <AnimatePresence>
              {React.Children.map(handover.children, (child, index) => (
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
      ))}
    </>
  );
}
