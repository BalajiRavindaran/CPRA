import React, { useState, useCallback } from "react";
import GlobeVisualization from "./GlobeVisualization";
import SimulationControls from "./SimulationControls";
import BlockchainTimeline from "./BlockchainTimeline";
import WalletDetailPopup from "./WalletDetailPopup";
import { useEffect } from "react";
import { Info, ChevronLeft, X } from "lucide-react";
import { Wallet, Transaction, SimulationParams } from '../utils/types';
import { api } from '../utils/api';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [params, setParams] = useState<SimulationParams>({
    walletCount: 100,
    riskyWalletCount: 10,
    transactionCount: 0,
  });

  // Initialize with some default data
  useEffect(() => {
    const defaultWallets: Wallet[] = [
      {
        id: "0x8f7d...e5a2",
        position: [20, 10, 0],
        riskScore: 78,
        color: "#ef4444",
      },
      {
        id: "0x3a9c...b7d1",
        position: [-30, 40, 0],
        riskScore: 45,
        color: "#f59e0b",
      },
      {
        id: "0x6e2b...c4f8",
        position: [0, -20, 0],
        riskScore: 25,
        color: "#22c55e",
      },
      {
        id: "0x1d7f...a3e9",
        position: [50, -10, 0],
        riskScore: 62,
        color: "#f59e0b",
      },
      {
        id: "0x9b4e...d2c5",
        position: [-40, -30, 0],
        riskScore: 85,
        color: "#ef4444",
      },
    ];

    const defaultTransactions = [
      {
        source: "0x8f7d...e5a2",
        target: "0x3a9c...b7d1",
        startTime: 0,
        endTime: 3000,
        color: "#ef4444",
      },
      {
        source: "0x3a9c...b7d1",
        target: "0x6e2b...c4f8",
        startTime: 1000,
        endTime: 4000,
        color: "#f59e0b",
      },
      {
        source: "0x6e2b...c4f8",
        target: "0x1d7f...a3e9",
        startTime: 2000,
        endTime: 5000,
        color: "#22c55e",
      },
      {
        source: "0x9b4e...d2c5",
        target: "0x8f7d...e5a2",
        startTime: 3000,
        endTime: 6000,
        color: "#ef4444",
      },
    ];

    setWallets(defaultWallets);
    setTransactions(defaultTransactions);
    setIsSimulating(true);
  }, []);

  // Store generated wallets for multi-step process
  const [generatedWallets, setGeneratedWallets] = useState<Wallet[]>([]);

  const handleSimulate = (params: SimulationParams) => {
    setParams(params);
    setIsLoading(true);

    // Simulate API call or calculation
    setTimeout(() => {
      // If transaction count is 0, we're just generating wallets (step 1)
      if (params.transactionCount === 0) {
        // Generate wallets based on parameters
        const newWallets: Wallet[] = [];
        for (let i = 0; i < params.walletCount; i++) {
          const isRisky = i < params.riskyWalletCount;
          const riskScore = isRisky
            ? 75 + Math.floor(Math.random() * 25)
            : Math.floor(Math.random() * 74);

          let color = "#22c55e"; // Green for low risk
          if (riskScore >= 75)
            color = "#ef4444"; // Red for high risk
          else if (riskScore >= 50) color = "#f59e0b"; // Amber for medium risk

          newWallets.push({
            id: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
            position: [
              Math.random() * 100 - 50, // x position
              Math.random() * 100 - 50, // y position
              Math.random() * 20 - 10, // z position
            ],
            riskScore,
            color,
          });
        }

        // Store the generated wallets for later use
        setGeneratedWallets(newWallets);
        setWallets(newWallets);
        setTransactions([]); // No transactions yet
        setIsSimulating(true);
        setIsLoading(false);
      } else {
        // Step 2 - Use the previously generated wallets and add transactions
        const walletsToUse =
          generatedWallets.length > 0 ? generatedWallets : wallets;

        // Generate transactions
        const newTransactions: Transaction[] = [];
        for (let i = 0; i < params.transactionCount; i++) {
          const sourceIndex = Math.floor(Math.random() * walletsToUse.length);
          let targetIndex = Math.floor(Math.random() * walletsToUse.length);

          // Ensure source and target are different
          while (targetIndex === sourceIndex) {
            targetIndex = Math.floor(Math.random() * walletsToUse.length);
          }

          const source = walletsToUse[sourceIndex];
          const target = walletsToUse[targetIndex];

          // Higher risk wallets have more transactions
          const startTime = Math.floor(Math.random() * 10000);

          newTransactions.push({
            source: source.id,
            target: target.id,
            startTime,
            endTime: startTime + 3000,
            color: source.color,
          });
        }

        setTransactions(newTransactions);
        setIsSimulating(true);
        setIsLoading(false);
      }
    }, 1500); // Simulate processing time
  };

  const handleTransactionClick = (transaction: any) => {
    console.log("Transaction clicked:", transaction);
    // Could show a detailed view or highlight related wallets
  };

  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedWalletDetails, setSelectedWalletDetails] =
    useState<Wallet | null>(null);

  const handleWalletSelect = useCallback((wallet: Wallet | null) => {
    setSelectedWalletDetails(wallet);
  }, []);

  // Find connected wallets for the selected wallet
  const connectedWalletIds = useCallback(() => {
    if (!selectedWalletDetails) return [];

    return transactions
      .filter(
        (t) =>
          t.source === selectedWalletDetails.id ||
          t.target === selectedWalletDetails.id,
      )
      .map((t) =>
        t.source === selectedWalletDetails.id ? t.target : t.source,
      );
  }, [selectedWalletDetails, transactions]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">
              {params.transactionCount === 0
                ? "Generating Wallets..."
                : "Simulating Transactions..."}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {params.transactionCount === 0
                ? "Creating wallet network"
                : "Processing transactions between wallets"}
            </p>
          </div>
        </div>
      )}

      {/* Info button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowInfoPopup(true)}
          className="bg-background/80 hover:bg-background p-2 rounded-full shadow-md"
        >
          <Info className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Info popup */}
      {showInfoPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowInfoPopup(false)}
        >
          <div
            className="bg-background p-6 rounded-lg shadow-lg max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              Wallet Risk Visualization
            </h2>
            <p className="mb-3">
              This interactive visualization displays cryptocurrency wallet risk
              scores using a PageRank-inspired algorithm.
            </p>
            <p className="mb-3">
              The 3D Markov chain model shows wallets as nodes and transactions
              as links between them. The color of each node indicates its risk
              level:
            </p>
            <ul className="mb-4 space-y-2">
              <li className="flex items-center">
                <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>{" "}
                <span>High risk (75-100)</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-amber-500 rounded-full mr-2"></span>{" "}
                <span>Medium risk (50-74)</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>{" "}
                <span>Low risk (0-49)</span>
              </li>
            </ul>
            <p className="mb-3">
              Use the simulation controls to adjust parameters and run new
              simulations.
            </p>
            <button
              className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90"
              onClick={() => setShowInfoPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main section - takes full viewport height */}
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Globe visualization (full width on mobile, 2/3 width on larger screens) */}
        <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black">
          <GlobeVisualization
            wallets={wallets}
            transactions={transactions}
            isSimulating={isSimulating}
            onWalletSelect={handleWalletSelect}
            selectedWalletId={selectedWalletDetails?.id}
            connectedWalletIds={
              selectedWalletDetails ? connectedWalletIds() : []
            }
          />
        </div>

        {/* Simulation controls or wallet details (full width on mobile, 1/3 width on larger screens) */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full">
          {selectedWalletDetails ? (
            <div className="h-full bg-background border-t md:border-t-0 md:border-l border-border">
              <div className="flex items-center h-14 px-4 border-b border-border">
                <h2 className="text-xl font-semibold flex-1">Wallet Details</h2>
                <button
                  onClick={() => {
                    setSelectedWalletDetails(null);
                    // Reset any wallet highlighting
                    handleWalletSelect(null);
                  }}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[calc(100%-3.5rem)] p-6 backdrop-blur-md bg-background/80">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-semibold">
                        Wallet Information
                      </h3>
                    </div>
                    <div className="p-4 border border-border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Wallet ID</span>
                        <span className="text-sm font-mono bg-background px-2 py-1 rounded">
                          {selectedWalletDetails.id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Current Risk Score
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${selectedWalletDetails.riskScore >= 75 ? "bg-red-500 text-white" : selectedWalletDetails.riskScore >= 50 ? "bg-amber-500 text-white" : "bg-green-500 text-white"}`}
                        >
                          {selectedWalletDetails.riskScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2.5 mt-2">
                        <div
                          className={`${selectedWalletDetails.riskScore >= 75 ? "bg-red-500" : selectedWalletDetails.riskScore >= 50 ? "bg-amber-500" : "bg-green-500"} h-2.5 rounded-full`}
                          style={{
                            width: `${selectedWalletDetails.riskScore}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Risk History</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Historical changes to this wallet's risk score based on
                      transactions.
                    </p>
                    <div className="border border-border rounded-lg overflow-hidden h-[200px]">
                      <div className="h-full overflow-y-auto custom-scrollbar p-1">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                                Date
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                                Score
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                                Change
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                                Transaction
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-border">
                              <td className="px-4 py-2 text-xs">
                                2023-06-15 14:32
                              </td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                                  78
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-red-500"
                                >
                                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                  <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                              </td>
                              <td className="px-4 py-2 text-right text-xs font-mono">
                                Tx0x45a2...b3c7
                              </td>
                            </tr>
                            <tr className="border-t border-border">
                              <td className="px-4 py-2 text-xs">
                                2023-06-14 09:17
                              </td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-white">
                                  65
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-red-500"
                                >
                                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                  <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                              </td>
                              <td className="px-4 py-2 text-right text-xs font-mono">
                                Tx0x72f1...a9d3
                              </td>
                            </tr>
                            <tr className="border-t border-border">
                              <td className="px-4 py-2 text-xs">
                                2023-06-12 18:45
                              </td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-white">
                                  52
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-gray-500"
                                >
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </td>
                              <td className="px-4 py-2 text-right text-xs font-mono">
                                Tx0x31e8...c4b2
                              </td>
                            </tr>
                            <tr className="border-t border-border">
                              <td className="px-4 py-2 text-xs">
                                2023-06-10 11:23
                              </td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-white">
                                  52
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-green-500"
                                >
                                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                                  <polyline points="17 18 23 18 23 12"></polyline>
                                </svg>
                              </td>
                              <td className="px-4 py-2 text-right text-xs font-mono">
                                Tx0x93a7...f1d5
                              </td>
                            </tr>
                            <tr className="border-t border-border">
                              <td className="px-4 py-2 text-xs">
                                2023-06-08 16:09
                              </td>
                              <td className="px-4 py-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-white">
                                  60
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-red-500"
                                >
                                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                  <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                              </td>
                              <td className="px-4 py-2 text-right text-xs font-mono">
                                Tx0x12d9...e7a4
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Connected Wallets
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Wallets that have direct transaction connections with this
                      wallet.
                    </p>
                    <div className="border border-border rounded-lg overflow-hidden h-[200px]">
                      <div className="h-full overflow-y-auto custom-scrollbar p-3 space-y-3">
                        {connectedWalletIds().map((id) => {
                          const connectedWallet = wallets.find(
                            (w) => w.id === id,
                          );
                          if (!connectedWallet) return null;

                          const riskColor =
                            connectedWallet.riskScore >= 75
                              ? "bg-red-500"
                              : connectedWallet.riskScore >= 50
                                ? "bg-amber-500"
                                : "bg-green-500";

                          return (
                            <div
                              key={id}
                              className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => {
                                const wallet = wallets.find((w) => w.id === id);
                                if (wallet) {
                                  handleWalletSelect(wallet);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full mr-2 ${riskColor}`}
                                  ></div>
                                  <span className="text-sm font-mono">
                                    {id}
                                  </span>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColor} text-white`}
                                >
                                  {connectedWallet.riskScore}/100
                                </span>
                              </div>
                              <div className="w-full bg-background rounded-full h-1.5">
                                <div
                                  className={`${riskColor} h-1.5 rounded-full`}
                                  style={{
                                    width: `${connectedWallet.riskScore}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}

                        {connectedWalletIds().length === 0 && (
                          <div className="p-4 border border-border rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                            No connected wallets found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <SimulationControls
              onSimulate={handleSimulate}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Blockchain timeline (below the main view, only visible when scrolling) */}
      <div className="h-[400px] md:h-[600px]">
        <BlockchainTimeline onTransactionClick={handleTransactionClick} />
      </div>
    </div>
  );
};

export default Home;
