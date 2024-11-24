import { Heading } from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react'
import { getTimeRemaining } from '../../utils/timer';

interface Countdown {
  endTime: number; // unix timestamp in seconds
  deadlineEventTopic: string;
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
function Countdown({
  endTime,
  deadlineEventTopic,
  size = 'xl'
}: Countdown) {

    const timerRef = useRef<ReturnType<typeof setTimeout>>();
 
    const [timer, setTimer] = useState("");

    const getDeadlineTime = useCallback(() => new Date(endTime * 1000), [endTime])
 
    const handleTimerUpdate = useCallback((deadline: Date) => {
        const { total, days, hours, minutes, seconds } = getTimeRemaining(deadline);
        if(total < 0) {
          // If total time remaining is less than 0, stop the countdown interval
          window.dispatchEvent(new CustomEvent(deadlineEventTopic))
          clearInterval(timerRef.current);
          return;
        } 

        // update the timer
        // check if less than 10 then we need to
        // add '0' at the beginning of the variable
        setTimer((days > 0 ? `${days} ${days > 1 ? "days" : "day"} ` : '') +
            (hours > 9 ? hours : "0" + hours) +
            ":" +
            (minutes > 9
                ? minutes
                : "0" + minutes) +
            ":" +
            (seconds > 9 ? seconds : "0" + seconds)
        );
    }, [deadlineEventTopic]);
 
    const createTimer = useCallback((deadline: Date) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => handleTimerUpdate(deadline), 1000);
    }, [handleTimerUpdate]);
 
    // Start the countdown timer logic
    useEffect(() => {
      createTimer(getDeadlineTime());
    }, [createTimer, getDeadlineTime]);
 
    return (
      <Heading size={size}>{timer}</Heading>
    );
}

export default Countdown