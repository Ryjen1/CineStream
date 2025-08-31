import { useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [status, setStatus] = useState<string>("Connect wallet to start");

  // Your contract
  const CONTRACT_ADDRESS = "0x90C0a87808608bb656dBBe9508B32F5bD071a7a3";
  const CHAIN_ID_HEX = "0x106a"; // Lisk Sepolia (4202)

  // Minimal ABI
  const ABI = [
    "function addMovie(string _title, string _description, string _url)",
    "function watchMovie(string _title)",
    "function balanceOf(address) view returns (uint256)",
    "function hasWatched(address, string) view returns (bool)"
  ] as const;

  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus("Install MetaMask");
      return;
    }

    try {
      // Switch to Lisk Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_ID_HEX }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added — add it
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: CHAIN_ID_HEX,
              chainName: "Lisk Sepolia",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia-api.lisk.com"],
              blockExplorerUrls: ["https://sepolia.lisk.com"],
            },
          ],
        });
      } else {
        setStatus("Failed to switch network");
        return;
      }
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      setAccount(addr);
      setStatus("✅ Connected!");

      // Load balance
      const provider = new (await import("ethers")).BrowserProvider(window.ethereum);
      const contract = new (await import("ethers")).Contract(CONTRACT_ADDRESS, ABI, provider);
      const bal = await contract.balanceOf(addr);
      setBalance((await import("ethers")).formatUnits(bal, 18));
    } catch (err: any) {
      setStatus("Connection rejected");
    }
  };

  const watchMovie = async (title: string) => {
    if (!window.ethereum) {
      setStatus("MetaMask not installed");
      return;
    }

    try {
      const provider = new (await import("ethers")).BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new (await import("ethers")).Contract(CONTRACT_ADDRESS, ABI, signer);

      // Check if already watched
      const alreadyWatched = await contract.hasWatched(await signer.getAddress(), title);
      if (alreadyWatched) {
        setStatus("You already watched this movie!");
        return;
      }

      setStatus(`📺 Watching "${title}"...`);
      const tx = await contract.watchMovie(title);
      setStatus("⏳ Confirm transaction in MetaMask...");
      await tx.wait();

      // Update balance
      const bal = await contract.balanceOf(await signer.getAddress());
      setBalance((await import("ethers")).formatUnits(bal, 18));

      setStatus(`🎉 Success! You earned 10 CINE tokens for watching "${title}"`);
    } catch (err: any) {
      if (err.code === 'ACTION_REJECTED') {
        setStatus("User denied transaction");
      } else {
        setStatus(`Error: ${err.message.slice(0, 100)}...`);
      }
    }
  };

  // Featured movies with local images
  const featuredMovies = [
    {
      title: "Quantum Heist",
      desc: "A thrilling sci-fi adventure through time and space.",
      poster: "./assets/quantum.jpg",
      reward: "10 CINE"
    },
    {
      title: "Mystic Forest",
      desc: "An enchanting journey through magical realms.",
      poster: "./assets/forest.jpg",
      reward: "10 CINE"
    },
    {
      title: "Neon City",
      desc: "A cyberpunk thriller in a neon-lit metropolis.",
      poster: "./assets/city.jpg",
      reward: "10 CINE"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="py-6 px-8 flex justify-between items-center border-b border-purple-800">
        <div className="flex items-center space-x-3">
          <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h1 className="text-2xl font-bold">🎥 CineStream</h1>
        </div>
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition"
        >
          {account ? `${account.slice(0,6)}...` : "Connect Wallet"}
        </button>
      </header>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Experience the future of entertainment on Lisk Sepolia.</h2>
        <p className="text-gray-300 mb-6">Watch amazing movies and earn CINE tokens with every view.</p>
        <div className="bg-purple-900/50 backdrop-blur-sm p-4 rounded-xl max-w-md mx-auto">
          <p className="text-sm text-gray-300">Connect your wallet to start watching movies and earning tokens!</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">CINE Balance</h3>
            <span className="text-yellow-400 text-sm">{balance} CINE</span>
          </div>
          <p className="text-3xl font-bold">{balance} CINE</p>
          <p className="text-gray-300 text-sm mt-1">You earn 10 CINE per movie watched.</p>
        </div>
      </div>

      {/* Featured Movies */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Movies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMovies.map((movie) => (
            <div key={movie.title} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition">
              <img src={movie.poster} alt={movie.title} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold">{movie.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{movie.desc}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-yellow-400 text-sm">{movie.reward}</span>
                  <button
                    onClick={() => watchMovie(movie.title)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition"
                  >
                    Watch & Earn
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      {status && (
        <div className="max-w-6xl mx-auto px-6 mb-6 p-4 bg-gray-800 rounded-lg text-center text-sm text-gray-300 border border-gray-700">
          {status}
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        Built on Lisk Sepolia | Hackathon 2025
      </footer>
    </div>
  );
}