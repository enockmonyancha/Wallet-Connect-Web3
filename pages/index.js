'use client'

import { useDisconnect, useAppKit, useAppKitNetwork, useWalletInfo } from '@reown/appkit/react'
import { networks } from '@/config'
import WalletBalance from '@/components/WalletBalance'

export default function Home() {
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const { switchNetwork } = useAppKitNetwork()
  const { walletInfo } = useWalletInfo();

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error("Failed to disconnect:", error)
    }
  }

  return (
    <>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BONK Dragon</title>
    <style
      dangerouslySetInnerHTML={{
        __html:
          "\n        body {\n            background: url('bg.png') no-repeat center center/cover;\n        }\n    "
      }}
    />
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* BONK Logo */}
      <div className="absolute top-5 flex items-center space-x-2">
        <img
          src="bonk-logo.png"
          alt="BONK Logo"
          width="250"
          height="100"
        />
      </div>
      {/* Header Text */}
      <h1 className="text-2xl mt-5 sm:text-3xl font-bold text-center text-yellow-300">
        BUILD YOUR BONKDRAGON
      </h1>
      <h2 className="text-xl sm:text-3xl mt-5 text-yellow-300">YEAR OF REWARDS</h2>

      <p className="mt-2 text-yellow-300">Year of the dragon has brought you fortune and prosperity.</p>
      <p className="mt-2 text-yellow-300">Connect your wallet to check and claim!</p>


      <WalletBalance />

      {/* Dragon Section */}
      <div className='mt-5'>
          <img src="temple4.png" alt="Dragon" width="210" />
        </div>

        <button onClick={() => open()} className="mt-5 px-4 sm:px-6 py-2 bg-yellow-300 text-red-600 font-bold rounded-lg shadow">
          SELECT WALLET
        </button>
     
    </div>
  </>
  
  )
}
