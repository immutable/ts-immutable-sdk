import { keyframes } from '@emotion/react';

export const PULSE_SHADOW = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3);
    }
    50% {
        box-shadow: 0 0 10px 3px rgba(54, 210, 227, 0.3);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
`;
