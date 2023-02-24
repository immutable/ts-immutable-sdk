import { User as OIDCUser } from 'oidc-client-ts';

export type Networks = 'mainnet' | 'goerli';

// TODO: Exposed the whole OIDCUser for Demo purposes, we will revisit and define it for future usecase.
export type User = OIDCUser;
