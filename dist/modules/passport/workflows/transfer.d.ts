import { CreateTransferResponseV1, StarkSigner, TransfersApi, UnsignedTransferRequest } from '@imtbl/core-sdk';
import { UserWithEtherKey } from '../types';
type TrasferRequest = {
    request: UnsignedTransferRequest;
    user: UserWithEtherKey;
    starkSigner: StarkSigner;
    transferApi: TransfersApi;
};
declare const transfer: ({ request, transferApi, starkSigner, user, }: TrasferRequest) => Promise<CreateTransferResponseV1>;
export default transfer;
