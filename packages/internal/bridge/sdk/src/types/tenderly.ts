/* eslint-disable @typescript-eslint/naming-convention */
export type TenderlySimulation = {
  network_id: string;
  estimate_gas: boolean;
  simulation_type: string;
  from: string;
  to: string;
  input: string;
  value?: string;
  state_objects?: Record<string, Record<string, Record<string, string>>>;
};
