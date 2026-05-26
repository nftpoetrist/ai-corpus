"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect={true}
        dappConfig={{ network: Network.TESTNET }}
        onError={(error) => {
          console.error("[Wallet Adapter Error]", error);
        }}
      >
        {children}
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}
