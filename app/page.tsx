"use client";

import {useGuestWallet} from "./providers/guest-mode";
import {useAccount} from "wagmi";

import LoggedInView from "@/components/logged-in-view";
import LoggedOutView from "@/components/logged-out-view";

export default function Home() {
  const {address} = useAccount();
  const {signer} = useGuestWallet();
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      {address || signer?.address ? <LoggedInView /> : <LoggedOutView />}
    </main>
  );
}
