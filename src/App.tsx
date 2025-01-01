import React, { useState } from "react";
import { ethers } from "ethers";

interface TokenBalance {
  symbol: string;
  balance: string;
}

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("");
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [error, setError] = useState<string>("");

  // ERC-20 token contract ABI
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ];

  const connectWallet = async (): Promise<void> => {
    try {
      if (!window.ethereum) {
        setError("MetaMask not detected!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);

      // Fetch ETH balance
      const balance = await provider.getBalance(accounts[0]);
      setEthBalance(ethers.utils.formatEther(balance));
      setError("");
    } catch (err) {
      setError("Failed to connect wallet.");
      console.error(err);
    }
  };

  const fetchTokenBalances = async (): Promise<void> => {
    try {
      if (!walletAddress) {
        setError("Connect a wallet first!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Example ERC-20 tokens (add more as needed)
      const tokens = [
        { address: "0x6b175474e89094c44da98b954eedeac495271d0f", name: "DAI" }, // DAI
        { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", name: "USDC" }, // USDC
      ];

      const balances = await Promise.all(
        tokens.map(async (token) => {
          const contract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            provider
          );
          const balance = await contract.balanceOf(walletAddress);
          const decimals = await contract.decimals();
          const symbol = await contract.symbol();
          return {
            symbol,
            balance: ethers.utils.formatUnits(balance, decimals),
          };
        })
      );

      setTokenBalances(balances);
      setError("");
    } catch (err) {
      setError("Failed to fetch token balances.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Wallet Info Dashboard</h1>

      {/* Connect Wallet Button */}
      <button
        onClick={connectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Connect Wallet
      </button>

      {/* Wallet Info */}
      {walletAddress && (
        <div className="bg-white shadow-md rounded p-4 w-full max-w-md">
          <h2 className="text-lg font-bold">Wallet Address:</h2>
          <p className="truncate">{walletAddress}</p>
          <h2 className="text-lg font-bold mt-4">ETH Balance:</h2>
          <p>{ethBalance} ETH</p>
        </div>
      )}

      {/* Fetch Token Balances Button */}
      {walletAddress && (
        <button
          onClick={fetchTokenBalances}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        >
          Fetch Token Balances
        </button>
      )}

      {/* Token Balances */}
      {tokenBalances.length > 0 && (
        <div className="bg-white shadow-md rounded p-4 w-full max-w-md mt-4">
          <h2 className="text-lg font-bold mb-2">Token Balances:</h2>
          {tokenBalances.map((token, index) => (
            <p key={index}>
              {token.symbol}: {token.balance}
            </p>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default App;
