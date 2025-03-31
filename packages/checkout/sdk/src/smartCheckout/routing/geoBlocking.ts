import { AvailabilityService } from '../../availability';

export const isOnRampAvailable = async (): Promise<boolean> => true;

export const isSwapAvailable = async (
  availability: AvailabilityService,
): Promise<boolean> => {
  try {
    return await availability.checkDexAvailability();
  } catch {
    return false;
  }
};
