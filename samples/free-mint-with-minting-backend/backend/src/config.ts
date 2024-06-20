import { config } from "@imtbl/sdk";
import { ServerConfig } from "./types";
require("dotenv").config();

//config.Environment.SANDBOX or config.Environment.PRODUCTION
export const environment = config.Environment.SANDBOX;

//Used for verification of the Passport JWTs
export const IMX_JWT_KEY_URL = "https://auth.immutable.com/.well-known/jwks.json?_gl=1*1g7a0qs*_ga*NDg1NTg3MDI3LjE2ODU1OTY1Mzg.*_ga_4JBHZ7F06X*MTY4ODUyNjkyNy4xNC4wLjE2ODg1MjY5MjcuMC4wLjA.*_ga_7XM4Y7T8YC*MTY4ODUyNjkyNy4yNy4wLjE2ODg1MjY5MjcuMC4wLjA.";

const serverConfig: ServerConfig = {
  [config.Environment.SANDBOX]: {
    API_URL: "https://api.sandbox.immutable.com",
    HUB_API_KEY: process.env.SANDBOX_HUB_IMMUTABLE_API_KEY!,
    RPS_API_KEY: process.env.SANDBOX_RPS_IMMUTABLE_API_KEY!,
    HOST_IP: "localhost",
    PORT: 3000,
    chainName: "imtbl-zkevm-testnet",
    collectionAddress: "",
    enableFileLogging: true, //Should logs be output to files or just console?
    maxTokenSupplyAcrossAllPhases: 1500,
    logLevel: "debug",
    eoaMintMessage: "Sign this message to verify your wallet address", //The message an EOA signs to verify their wallet address and mint
    mintPhases: [
      {
        name: "Guaranteed",
        startTime: 1715743355,
        endTime: 1735743376,
      },
      {
        name: "Waitlist",
        startTime: 1714916593,
        endTime: 1719292800,
      },
    ],
    metadata: {
      name: "Your NFT name",
      description: "Your NFT description",
      image: "https://image-url.png",
      animation_url: "https://video.mp4",
      attributes: [],
    },
  },
  [config.Environment.PRODUCTION]: {
    API_URL: "https://api.immutable.com",
    HUB_API_KEY: process.env.MAINNET_HUB_IMMUTABLE_API_KEY!,
    RPS_API_KEY: process.env.MAINNET_RPS_IMMUTABLE_API_KEY!,
    HOST_IP: "localhost",
    PORT: 3000,
    chainName: "imtbl-zkevm-mainnet",
    collectionAddress: "",
    enableFileLogging: true, //Should logs be output to files or just console?
    maxTokenSupplyAcrossAllPhases: 1500,
    logLevel: "debug",
    eoaMintMessage: "Sign this message to verify your wallet address", //The message an EOA signs to verify their wallet address and mint
    mintPhases: [
      {
        name: "Guaranteed",
        startTime: 1629913600,
        endTime: 1714623711,
      },
      {
        name: "Waitlist",
        startTime: 1714623712,
        endTime: 1719292800,
      },
    ],
    metadata: {
      name: "Your NFT name",
      description: "Your NFT description",
      image: "https://image-url.png",
      animation_url: "https://video.mp4",
      attributes: [],
    },
  },
};

export default serverConfig;
