"use client";
import Image from "next/image";
import Link from "next/link";
import {useTheme} from "next-themes";

import {MoonIcon, SunIcon} from "lucide-react";
import {Button} from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

import {useAccount, useDisconnect} from "wagmi";
import {useGuestWallet} from "@/app/providers/guest-mode";
import {truncateAddress} from "@/lib/utils";
import {useSocket} from "@/app/providers/socket-provider";

const Navbar = () => {
  const {setTheme, theme} = useTheme();
  const {address} = useAccount();
  const {signer, setSigner} = useGuestWallet();
  const {disconnect} = useDisconnect();
  const {socket} = useSocket();
  const logout = async () => {
    if (address) {
      await disconnect();
    } else {
      setSigner(undefined);
    }
    socket.emit("logout");
  };

  return (
    <div className="flex flex-row justify-between p-6 md:p-4 relative">
      <Link href="/">
        <Image
          src={theme === "light" ? "/dark.png" : "/light.png"}
          alt="Logo"
          className="md:m-4"
          width={100}
          height={100}
        />
      </Link>
      <div className="flex flex-row gap-2 items-center">
        {(address || signer?.address) && (
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>
                {address
                  ? truncateAddress(address)
                  : truncateAddress(signer?.address)}
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={logout}>Logout</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-[2.4rem] h-[2.4rem]"
            >
              <SunIcon className="h-[1.6rem] w-[1.6rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute h-[1.6rem] w-[1.6rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
