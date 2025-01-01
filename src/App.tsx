import { ethers } from "ethers";
import { useState } from "react";

interface TokenBalance {
  symbol: string;
  balance: string;
}

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  const connectWallet = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        setError("MetaMask not detected!");
        setLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      console.log(await provider.getBlockNumber());
      console.log(await provider.listAccounts());

      if (accounts.length === 0) {
        setError("No wallet connected!");
        setLoading(false);
        return;
      }
      setWalletAddress(accounts[0]);

      // Fetch ETH balance
      const balance = await provider.getBalance(accounts[0]);
      setEthBalance(ethers.formatEther(balance));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect wallet."
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchTokenBalances = async (): Promise<void> => {
    try {
      if (!walletAddress) {
        setError("Connect a wallet first!");
        return;
      }

      // ERC-20 tokens and ABI
      const tokens = [
        {
          address: "0x1234567890abcdef1234567890abcdef12345678",
          name: "Mock DAI",
        }, // Replace with real Sepolia addresses if available
        {
          address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
          name: "Mock USDC",
        }, // Replace with real Sepolia addresses if available
      ];
      const ERC20_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
      ];

      // Initialize provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Ensure wallet is connected

      // Fetch balances
      const balances = await Promise.all(
        tokens.map(async (token) => {
          try {
            const contract = new ethers.Contract(
              token.address,
              ERC20_ABI,
              signer
            );

            const network = await provider.getNetwork();
            console.log("Connected network:", network.chainId);
            // Fetch balance, decimals, and symbol
            const balance = await contract.balanceOf(walletAddress);
            const decimals = await contract.decimals();
            const symbol = await contract.symbol();
            // console.log(balance, decimals, symbol);
            console.log(`${symbol}:`);
            console.log("Raw Balance:", balance.toString());
            console.log("Decimals:", decimals);

            return {
              symbol,
              balance: ethers.formatUnits(balance, decimals), // Format balance
            };
          } catch (err) {
            console.error(`Failed to fetch data for token: ${token.name}`, err);
            return { symbol: token.name, balance: "Error" };
          }
        })
      );

      // Set state with fetched token balances
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
        className={`${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
        } text-white px-4 py-2 rounded mb-4`}
        disabled={loading}
      >
        {ethBalance
          ? "Disconnected"
          : loading
          ? "Connecting..."
          : "Connect Wallet"}
      </button>

      {/* Wallet Info */}
      {walletAddress && (
        <div className="bg-white shadow-md rounded p-4 w-full max-w-md">
          <h2 className="text-lg font-bold">Wallet Address:</h2>
          <p className="truncate">{walletAddress}</p>
          <h2 className="text-lg font-bold mt-4">ETH Balance:</h2>
          <p>{ethBalance ? `${ethBalance} ETH` : "Fetching balance..."}</p>
        </div>
      )}
      {/* Fetch Token Balances Button */}
      {walletAddress && (
        <button
          onClick={fetchTokenBalances}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4 "
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
