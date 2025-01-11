import { ethers } from "ethers";
import { useState } from "react";
import { Fingerprint } from "lucide-react";

interface TokenBalance {
  symbol: string;
  balance: string;
}

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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

      // ERC-20 tokens
      const tokens = [
        {
          address: "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0",
          name: "USDT",
        },
        {
          address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
          name: "LINK",
        },
      ];
      const ERC20_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
      ];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Fetch balances
      const balances = await Promise.all(
        tokens.map(async (token) => {
          try {
            const contract = new ethers.Contract(
              token.address,
              ERC20_ABI,
              signer
            );
            // console.log(contract);

            const balance = await contract.balanceOf(walletAddress);
            const symbol = await contract.symbol();
            const decimals = await contract.decimals();

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
    <section className=" ,relative min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center h-screen ">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="wrapper mx-auto max-w-7xl p-5">
        <header className="relative z-10">
          <nav className="ring-1 rounded-full ring-white/30 text-white text-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="nav-links-wrapper flex items-center justify-between h-16">
                <div className="flex items-center ">
                  <a href="#" className="text-3xl flex items-center gap-1">
                    <Fingerprint className="size-8" />
                    <span className="italic">print</span>
                  </a>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex space-x-16">
                    <a href="#" className=" ">
                      Swap
                    </a>
                    <a href="#" className=" ">
                      Earn
                    </a>
                    <a href="#" className=" ">
                      Add Liquidity
                    </a>
                  </div>
                </div>
                <div className="bg-fuchsia-500 px-4 py-2 rounded-full">
                  <a href="#">Connect Wallet</a>
                </div>
                <div className="md:hidden">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-white hover:text-gray-400 focus:outline-none"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={
                          isOpen
                            ? "M6 18L18 6M6 6l12 12"
                            : "M4 6h16M4 12h16M4 18h16"
                        }
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {isOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <a
                    href="#"
                    className="block hover:bg-gray-700 px-3 py-2 rounded-md"
                  >
                    Home
                  </a>
                  <a
                    href="#"
                    className="block hover:bg-gray-700 px-3 py-2 rounded-md"
                  >
                    About
                  </a>
                  <a
                    href="#"
                    className="block hover:bg-gray-700 px-3 py-2 rounded-md"
                  >
                    Services
                  </a>
                  <a
                    href="#"
                    className="block hover:bg-gray-700 px-3 py-2 rounded-md"
                  >
                    Contact
                  </a>
                </div>
              </div>
            )}
          </nav>
        </header>
        <main className="relative z-10 text-white p-4">
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
        </main>
      </div>
    </section>
  );
};

export default App;
