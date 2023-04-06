import { CreateTransferResponseV1, UnsignedExchangeTransferRequest } from "types";
import { Signers } from "./types";
import { Configuration } from "@imtbl/config";
type TransfersWorkflowParams = {
    signers: Signers;
    request: UnsignedExchangeTransferRequest;
    config: Configuration;
};
export declare function exchangeTransfer({ signers, request, config, }: TransfersWorkflowParams): Promise<CreateTransferResponseV1>;
export {};
