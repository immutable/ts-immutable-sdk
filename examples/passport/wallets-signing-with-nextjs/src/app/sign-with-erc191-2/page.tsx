"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { passportInstance } from "../utils";

export default async function PersonalSignWithERC191() {
  // #doc passport-wallets-personal-sign-erc191
  // fetch the Passport provider from the Passport instance
  const passportProvider = passportInstance.connectEvm();

  // calling eth_requestAccounts triggers the Passport login flow
  const accounts = await passportProvider.request({
    method: "eth_requestAccounts",
  });

  // get the account address
  const address = accounts[0];

  // set a message to sign
  const message = "Hello, Ethereum";

  // request for personal_sign RPC call
  const signature = await passportProvider.request({
    method: "personal_sign",
    params: [address, message],
  });

  console.log(signature); // 0x...
  // #enddoc passport-wallets-personal-sign-erc191

  return (
    <>
      <p>test</p>
    </>
  );
}
