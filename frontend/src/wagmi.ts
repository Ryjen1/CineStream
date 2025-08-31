import { createConfig, http } from 'wagmi';
import { liskSepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [liskSepolia],
  transports: {
    [liskSepolia.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ projectId: 'YOUR_PROJECT_ID' }),
  ],
});