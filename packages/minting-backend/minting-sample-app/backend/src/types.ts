import { FastifyRequest } from "fastify";
import { Signature } from "viem";

export interface MintPhase {
  name: string;
  startTime: number;
  endTime: number;
}

export interface ExtendedMintPhase extends MintPhase {
  totalMinted?: number;
}

interface EnvironmentConfig {
  API_URL: string;
  HUB_API_KEY: string;
  RPS_API_KEY: string;
  HOST_IP: string;
  PORT: number;
  chainName: string;
  collectionAddress: string;
  mintRequestURL: (chainName: string, collectionAddress: string, referenceId: string) => string;
  maxTokenSupplyAcrossAllPhases: number; // Optional for generalization
  enableFileLogging: boolean;
  logLevel: string;
  eoaMintMessage: string;
  mintPhases: MintPhase[];
  metadata: NFTMetadata;
}

export interface ServerConfig {
  [key: string]: EnvironmentConfig; // Dynamic keys based on possible environments
}

export type PassportIDToken = {
  header: { alg: "RS256"; typ: "JWT"; kid: "3aaYytdwwe032s1r3TIr9" };
  payload: {
    passport: {
      zkevm_eth_address: string;
      zkevm_user_admin_address: string;
    };
    given_name: string;
    family_name: string;
    nickname: string;
    name: string;
    picture: string;
    locale: string;
    updated_at: string;
    email: string;
    email_verified: boolean;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
    sub: string;
    sid: string;
  };
  signature: string;
};

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  attributes: Attribute[];
}

export interface Attribute {
  trait_type: string;
  value: string;
}

export interface eoaMintRequest extends FastifyRequest {
  body: {
    signature: `0x${string}` | Uint8Array | Signature;
    // Add other properties as necessary
  };
}
