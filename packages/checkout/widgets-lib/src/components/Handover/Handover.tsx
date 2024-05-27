import React from 'react';
import {
  Box,
  Stack,
} from '@biom3/react';
import {
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from '@rive-app/react-canvas-lite';
import { Checkout } from '@imtbl/checkout-sdk';
import { AnimatePresence, motion } from 'framer-motion';
// import { getRemoteImage } from '../../lib/utils';
import { useHandover } from '../../lib/hooks/useHandover';

export function Handover({ id, children, checkout }: { id: string, children?: React.ReactNode, checkout: Checkout }) {
  const { handover } = useHandover({ id });
  // const { environment } = checkout.config;

  let riveParams = {};
  if (handover.animationUrl) {
    riveParams = {
      src: handover.animationUrl,
      autoplay: true,
      layout: new Layout({ fit: Fit.Contain }),
      stateMachines: 'State',
    };
  }
  const { rive, RiveComponent } = useRive(riveParams);
  const riveAnimationState = useStateMachineInput(rive, 'State', 'mode', 0);
  // const [renderChildren, setRenderChildren] = useState<any[]>([]);
  console.log('Handover setup animation', id, riveAnimationState);

  const itemAnimation = {
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

  // useEffect(() => {
  //   setRenderChildren([
  //     <Heading
  //       sx={{ px: 'base.spacing.x6' }}
  //     >
  //       Open Passport to allow access to your coins for item purchase
  //     </Heading>,
  //     <Body
  //       size="small"
  //       sx={{
  //         mb: 'base.spacing.x4',
  //         c: 'base.color.text.body.secondary',
  //         px: 'base.spacing.x6',
  //       }}
  //     >
  //       Open popup window will appear shortly after
  //       <br />
  //       to allow access to your coins to pay with
  //     </Body>,
  //     <Button
  //       sx={{ mt: 'auto', width: '100%' }}
  //     >
  //       Open Passport
  //     </Button>,
  //   ]);
  //
  //   setTimeout(() => {
  //     setRenderChildren([
  //       <Button
  //         sx={{ mt: 'auto', width: '100%' }}
  //       >
  //         Close Passport
  //       </Button>,
  //     ]);
  //   }, 2000);
  //
  //   setTimeout(() => {
  //     setRenderChildren([
  //       <Button
  //         sx={{ mt: 'auto', width: '100%' }}
  //       >
  //         First Passport
  //       </Button>,
  //       <Button
  //         sx={{ mt: 'auto', width: '100%' }}
  //       >
  //         Second Passport
  //       </Button>,
  //     ]);
  //   }, 4000);
  // }, []);

  // const handover = {
  //   children: null,
  //   animationUrl: getRemoteImage(environment, '/handover.riv'),
  // };

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
          <Box
            sx={{
              h: '240px',
              flexShrink: 0,
            }}
            rc={<RiveComponent />}
          />
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
                  variants={itemAnimation}
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
