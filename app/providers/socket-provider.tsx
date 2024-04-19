"use client";
import {createContext, useContext, useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";

interface ISocketContext {
  socket: Socket;
}
const initialSocketContext: ISocketContext = {
  socket: {} as Socket,
};
const SocketContext = createContext<ISocketContext>(initialSocketContext);
export const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  useEffect(() => {
    setSocket(
      io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001")
    );

    console.log("socket", socket);
  }, []);

  return (
    <SocketContext.Provider value={{socket: socket!}}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
