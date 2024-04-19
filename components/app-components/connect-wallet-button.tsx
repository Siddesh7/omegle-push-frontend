import {ConnectButton} from "@rainbow-me/rainbowkit";
import {Button} from "../ui/button";
const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({account, chain, openConnectModal, authenticationStatus, mounted}) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} variant="default">
                    Connect Wallet
                  </Button>
                );
              }
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectButton;
