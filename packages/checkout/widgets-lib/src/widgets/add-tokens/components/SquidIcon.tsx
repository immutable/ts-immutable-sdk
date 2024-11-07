import { DeeplyNestedSx, SvgIcon } from '@biom3/react';
import merge from 'ts-deepmerge';

export function SquidIcon({
  sx = {},
  className,
}: {
  sx?: DeeplyNestedSx;
  className?: string;
}) {
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      sx={merge({ w: '100%' }, sx)}
      className={className}
    >
      <rect width="24" height="24" fill="#E6FA36" />
      <path
        // eslint-disable-next-line max-len
        d="M15.8578 18.914C16.2 17.4428 15.972 15.9524 15.3869 14.5432C14.3851 12.1302 13.0541 11.3752 13.0099 9.28092C12.9955 8.59164 13.0479 7.21788 12 7.3182C11.0079 7.41324 11.1307 8.5398 11.3467 9.23772C11.6818 10.3206 12.5578 11.2364 13.3795 12.6467C13.9949 13.7022 14.4024 14.475 14.4893 15.6539C14.5795 16.8774 14.245 18.2161 13.5312 19.286C12.8693 20.2782 11.4471 21.2147 9.99313 20.5336C9.46321 20.2854 9.13969 19.8265 8.98753 19.3316C8.51089 17.7784 9.12961 16.2606 9.28513 14.3512C9.54433 11.1716 7.40017 6.80988 3.27649 8.82876C1.95217 9.47724 0.916332 11.1726 0.475692 12.747C0.315372 13.3196 0.254412 13.9326 0.272652 14.5523C0.523212 15.7081 0.939852 16.802 1.49665 17.8076C1.34593 17.2888 1.26433 16.7017 1.21969 15.9424C1.14769 14.7188 1.60273 12.806 2.36449 11.7577C3.06769 10.79 4.65409 9.87708 6.16561 10.683C6.96385 11.1088 7.81921 12.7364 6.86161 16.1507C6.34369 17.9968 6.09553 20.0732 7.36849 21.8339C8.43889 23.3147 10.3973 23.6934 12.0883 23.2316C14.2032 22.6532 15.3768 20.9843 15.8578 18.914Z"
        fill="black"
      />
      <path
        // eslint-disable-next-line max-len
        d="M23.7183 11.2782C23.8008 10.984 23.8565 10.6787 23.8891 10.3676C23.8891 10.3691 23.8896 10.371 23.8896 10.371C23.7207 9.12732 23.3616 7.94412 22.8423 6.85164C22.9051 7.21308 22.9464 7.61484 22.9738 8.08236C23.0458 9.30588 22.5907 11.2187 21.829 12.267C21.1258 13.2347 19.5394 14.1476 18.0279 13.3417C17.2296 12.916 16.3743 11.2883 17.3319 7.87404C17.8498 6.02796 18.0979 3.95148 16.825 2.19084C15.7546 0.710036 13.7962 0.331317 12.1051 0.793076C9.99025 1.37052 8.81665 3.03948 8.33569 5.10972C7.99345 6.58092 8.22145 8.07132 8.80657 9.4806C9.80833 11.8936 11.1394 12.6486 11.1835 14.7428C11.1979 15.4321 11.1456 16.8059 12.1935 16.7056C13.1856 16.6105 13.0627 15.484 12.8467 14.7865C12.5117 13.7036 11.6357 12.7878 10.8139 11.3776C10.1986 10.322 9.79105 9.54924 9.70369 8.37036C9.61345 7.14684 9.94801 5.80812 10.6618 4.7382C11.3237 3.74604 12.7459 2.80956 14.1999 3.49068C14.7298 3.73884 15.0533 4.19772 15.2055 4.6926C15.6821 6.24588 15.0634 7.76364 14.9079 9.67308C14.6487 12.8526 16.7928 17.2144 20.9165 15.1955C22.2413 14.548 23.2776 12.8521 23.7183 11.2782Z"
        fill="black"
      />
    </SvgIcon>
  );
}