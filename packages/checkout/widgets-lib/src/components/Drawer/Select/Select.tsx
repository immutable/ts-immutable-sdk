import {
  BottomSheet, Box,
} from '@biom3/react';
import { ReactElement } from 'react';
import { ISelectDrawerOption } from './Option';
import { selectOptionsContainerStyles } from './styles';

type SelectDrawerProps = {
  onCloseBottomSheet?: () => void;
  heading: string;
  options: Array<ReactElement<ISelectDrawerOption>>;
  children: any;
};

export function SelectDrawer({
  heading, options, children, onCloseBottomSheet,
}: SelectDrawerProps) {
  return (
    <BottomSheet headerBarTitle={heading} size="full" onCloseBottomSheet={onCloseBottomSheet}>
      <BottomSheet.Target>
        {children}
      </BottomSheet.Target>
      <BottomSheet.Content>
        <Box sx={selectOptionsContainerStyles}>
          {options}
        </Box>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
