"use client";
import {ethers} from "ethers";
import React, {createContext, useContext, useEffect, useState} from "react";

interface IGuestWallet {
  signer: ethers.Wallet | undefined;
  setSigner: (signer: ethers.Wallet | undefined) => void;
}

const GuestWalletContext = createContext<IGuestWallet | undefined>(undefined);

export const GuestWalletProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [signer, setSigner] = useState<ethers.Wallet | undefined>(undefined);

  return (
    <GuestWalletContext.Provider value={{signer, setSigner}}>
      {children}
    </GuestWalletContext.Provider>
  );
};

export const useGuestWallet = () => {
  const context = useContext(GuestWalletContext);
  if (context === undefined) {
    throw new Error("useGuestWallet must be used within a GuestWalletProvider");
  }
  return context;
};
