// TODO:

import { ethers } from "ethers";
import { client } from "./db-client";

// REMOVE THIS
export const createWallet = async (userId: string) => {
    // Generate a new Ethereum wallet
    const wallet = ethers.Wallet.createRandom();
  
    // Extract the address
    const address = wallet.address;
  
    console.log(wallet.address, wallet.privateKey);
  
    // save the wallet addres and user id into user_wallet table
    const userWallet = {
      user_id: userId,
      wallet_address: address,
    };
  
    await client.query(
      `
        INSERT INTO user_wallet (user_id, wallet_address) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING
      `,
      [userWallet.user_id, userWallet.wallet_address]
    );
  
    return userWallet;
  };
  
export const getUserWalletByUserId = async (userId: string) => {
  const res = await client.query(
    `
      SELECT * FROM user_wallet WHERE user_id = $1
    `,
    [userId]
  );
  return res.rows[0];
};
// END of removing this