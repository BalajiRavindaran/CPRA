import React, { useState, useCallback } from "react";
import GlobeVisualization from "./GlobeVisualization";
import SimulationControls from "./SimulationControls";
import BlockchainTimeline from "./BlockchainTimeline";
import WalletDetailPopup from "./WalletDetailPopup";
import { useEffect } from "react";
import { Info, ChevronLeft, X, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Wallet, Transaction, SimulationParams } from "../utils/types";
import { api } from "../utils/api";

// Mapping functions to convert between GlobeVisualization interfaces and our types
const mapWalletToGlobeWallet = (wallet: Wallet) => ({
  id: wallet.id,
  position: wallet.position,
  riskScore: wallet.risk_score,
  color: wallet.color,
});

const mapTransactionToGlobeTransaction = (transaction: Transaction) => {
  const riskScore = convertRiskScore(transaction.risk);
  const color = transaction.flagged
    ? "#ef4444"
    : riskScore >= 75
    ? "#ef4444"
    : riskScore >= 50
    ? "#f59e0b"
    : "#22c55e";

  return {
    source: transaction.sender_id,
    target: transaction.receiver_id,
    startTime: transaction.startTime || 0,
    endTime: transaction.endTime || 3000,
    color: color,
  };
};

const mapGlobeWalletToWallet = (globeWallet: any): Wallet => ({
  _id: globeWallet.id,
  id: globeWallet.id,
  position: globeWallet.position,
  risk_score: globeWallet.riskScore,
  color: globeWallet.color,
  balance: 0,
  flagged: false,
  allowRiskDecay: true,
  transaction_history: [],
  connected_wallets: [],
  risk_score_history: [globeWallet.riskScore],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Add this utility function at the top of the file, after the imports
const convertRiskScore = (score: any): number => {
  // Handle null, undefined, or invalid values
  if (score === null || score === undefined || isNaN(score)) {
    return 0; // Default to 0 if the value is invalid
  }

  // Convert to number and ensure it's between 0 and 100
  const numScore = Number(score);
  if (isNaN(numScore)) {
    return 0; // Fallback to 0 if conversion fails
  }

  return Math.min(100, Math.max(0, Number((numScore * 100).toFixed(0))));
};

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
        _id: "1",
        id: "0x8f7d...e5a2",
        position: [20, 10, 0],
        risk_score: 78,
        color: "#ef4444",
        balance: 1000,
        flagged: true,
        allowRiskDecay: true,
        transaction_history: [],
        connected_wallets: [],
        risk_score_history: [
          {
            _id: "1",
            timestamp: new Date().toISOString(),
            previous_risk_score: 70,
            risk_score: 78,
            change: "up",
            transaction_id: "tx1",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "2",
        id: "0x3a9c...b7d1",
        position: [-30, 40, 0],
        risk_score: 52,
        color: "#f59e0b",
        balance: 2000,
        flagged: false,
        allowRiskDecay: true,
        transaction_history: [],
        connected_wallets: [],
        risk_score_history: [
          {
            _id: "2",
            timestamp: new Date().toISOString(),
            previous_risk_score: 40,
            risk_score: 45,
            change: "up",
            transaction_id: "tx2",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "3",
        id: "0x6e2b...c4f8",
        position: [0, -20, 0],
        risk_score: 25,
        color: "#22c55e",
        balance: 3000,
        flagged: false,
        allowRiskDecay: true,
        transaction_history: [],
        connected_wallets: [],
        risk_score_history: [
          {
            _id: "3",
            timestamp: new Date().toISOString(),
            previous_risk_score: 30,
            risk_score: 25,
            change: "down",
            transaction_id: "tx3",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "4",
        id: "0x1d7f...a3e9",
        position: [50, -10, 0],
        risk_score: 62,
        color: "#f59e0b",
        balance: 1500,
        flagged: true,
        allowRiskDecay: true,
        transaction_history: [],
        connected_wallets: [],
        risk_score_history: [
          {
            _id: "4",
            timestamp: new Date().toISOString(),
            previous_risk_score: 55,
            risk_score: 62,
            change: "down",
            transaction_id: "tx4",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "5",
        id: "0x9b4e...d2c5",
        position: [-40, -30, 0],
        risk_score: 85,
        color: "#ef4444",
        balance: 500,
        flagged: true,
        allowRiskDecay: true,
        transaction_history: [],
        connected_wallets: [],
        risk_score_history: [
          {
            _id: "5",
            timestamp: new Date().toISOString(),
            previous_risk_score: 80,
            risk_score: 85,
            change: "up",
            transaction_id: "tx5",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const defaultTransactions: Transaction[] = [
      {
        _id: "67e36193211d675936b4700c",
        sender_id: "0x8f7d...e5a2",
        receiver_id: "0x3a9c...b7d1",
        amount: 5,
        risk: 0.78,
        flagged: true,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: "#ef4444",
        startTime: 0,
        endTime: 3000,
      },
      {
        _id: "67e36193211d675936b4700d",
        sender_id: "0x3a9c...b7d1",
        receiver_id: "0x6e2b...c4f8",
        amount: 10,
        risk: 0.45,
        flagged: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: "#f59e0b",
        startTime: 1000,
        endTime: 4000,
      },
      {
        _id: "67e36193211d675936b4700e",
        sender_id: "0x6e2b...c4f8",
        receiver_id: "0x1d7f...a3e9",
        amount: 15,
        risk: 0.25,
        flagged: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: "#22c55e",
        startTime: 2000,
        endTime: 5000,
      },
      {
        _id: "67e36193211d675936b4700f",
        sender_id: "0x9b4e...d2c5",
        receiver_id: "0x8f7d...e5a2",
        amount: 30,
        risk: 0.85,
        flagged: true,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: "#ef4444",
        startTime: 3000,
        endTime: 6000,
      },
    ];

    setWallets(defaultWallets);
    setTransactions(defaultTransactions);
    setIsSimulating(true);
  }, []);

  // Store generated wallets for multi-step process
  const [generatedWallets, setGeneratedWallets] = useState<Wallet[]>([]);

  const handleSimulate = async (params: SimulationParams) => {
    setParams(params);
    setIsLoading(true);

    try {
      if (params.transactionCount === 0) {
        const response = await api.createWallets({
          walletCount: params.walletCount,
          riskyWalletCount: params.riskyWalletCount,
          allowRiskDecay: params.allowRiskDecay,
        });

        const transformedWallets: Wallet[] = response.map((wallet: any) => {
          const riskScore = convertRiskScore(wallet.risk_score);

          const transformedHistory =
            wallet.risk_score_history?.map((history: any) => ({
              ...history,
              risk_score: convertRiskScore(history.risk_score),
              previous_risk_score: convertRiskScore(
                history.previous_risk_score
              ),
            })) || [];

          return {
            ...wallet,
            position: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 20 - 10,
            ],
            risk_score: riskScore,
            risk_score_history: transformedHistory,
            color: wallet.flagged
              ? "#ef4444"
              : riskScore >= 75
              ? "#ef4444"
              : riskScore >= 50
              ? "#f59e0b"
              : "#22c55e",
          };
        });

        setWallets(transformedWallets);
        setGeneratedWallets(transformedWallets);
        setTransactions([]); // No transactions yet
        setIsSimulating(true);
      } else {
        const validatedParams = {
          ...params,
          walletCount: Number(params.walletCount) || 0,
          riskyWalletCount: Number(params.riskyWalletCount) || 0,
          transactionCount: Number(params.transactionCount) || 0,
          dampingFactor: Number(params.dampingFactor) || 0.85,
          iterations: Number(params.iterations) || 20,
          riskThreshold: Number(params.riskThreshold) || 75,
          transactionWeight: Number(params.transactionWeight) || 0.5,
        };

        const response = await api.simulateTransactions(validatedParams);

        console.log("Raw API Response:", response);

        if (response.message === "Simulation completed successfully") {
          const [walletsResponse, transactionsResponse] = await Promise.all([
            api.getAllWallets(),
            api.getTransactions(),
          ]);

          const transformedWallets: Wallet[] = walletsResponse.map(
            (wallet: any) => {
              const riskScore = convertRiskScore(wallet.risk_score);

              const transformedHistory =
                wallet.risk_score_history?.map((history: any) => ({
                  ...history,
                  risk_score: convertRiskScore(history.risk_score),
                  previous_risk_score: convertRiskScore(
                    history.previous_risk_score
                  ),
                })) || [];

              return {
                ...wallet,
                position: [
                  Math.random() * 100 - 50,
                  Math.random() * 100 - 50,
                  Math.random() * 20 - 10,
                ],
                risk_score: riskScore,
                risk_score_history: transformedHistory,
                color: wallet.flagged
                  ? "#ef4444"
                  : riskScore >= 75
                  ? "#ef4444"
                  : riskScore >= 50
                  ? "#f59e0b"
                  : "#22c55e",
              };
            }
          );

          setWallets(transformedWallets);
          setTransactions(transactionsResponse);
          setIsSimulating(true);
        } else {
          throw new Error("Simulation failed");
        }
      }
    } catch (error) {
      console.error("Failed to simulate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionClick = (transaction: any) => {
    console.log("Transaction clicked:", transaction);
    // Could show a detailed view or highlight related wallets
  };

  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedWalletDetails, setSelectedWalletDetails] =
    useState<Wallet | null>(null);

  const handleWalletSelect = useCallback(async (wallet: Wallet | null) => {
    if (wallet) {
      try {
        // Fetch detailed wallet information
        const walletDetails = await api.getWalletDetails(wallet.id);

        // Transform the wallet details to match our Wallet type
        const transformedWallet: Wallet = {
          ...walletDetails,
          position: wallet.position, // Keep the existing position
          risk_score: convertRiskScore(walletDetails.risk_score),
          color: walletDetails.flagged
            ? "#ef4444"
            : walletDetails.risk_score >= 0.75
            ? "#ef4444"
            : walletDetails.risk_score >= 0.5
            ? "#f59e0b"
            : "#22c55e",
          risk_score_history: walletDetails.risk_score_history.map(
            (history: any) => ({
              ...history,
              risk_score: convertRiskScore(history.risk_score),
              previous_risk_score: convertRiskScore(
                history.previous_risk_score
              ),
            })
          ),
        };

        setSelectedWalletDetails(transformedWallet);
      } catch (error) {
        console.error("Failed to fetch wallet details:", error);
      }
    } else {
      setSelectedWalletDetails(null);
    }
  }, []);

  // Find connected wallets for the selected wallet
  const connectedWalletIds = useCallback(() => {
    if (!selectedWalletDetails) return [];

    return transactions
      .filter(
        (t) =>
          t.sender_id === selectedWalletDetails.id ||
          t.receiver_id === selectedWalletDetails.id
      )
      .map((t) =>
        t.sender_id === selectedWalletDetails.id ? t.receiver_id : t.sender_id
      );
  }, [selectedWalletDetails, transactions]);

  // Map wallets and transactions for GlobeVisualization
  const globeWallets = wallets.map(mapWalletToGlobeWallet);
  const globeTransactions = transactions.map(mapTransactionToGlobeTransaction);

  const getStatusIcon = (flagged: boolean) => {
    if (flagged) return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

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
            className="bg-background p-6 rounded-lg shadow-lg max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Wallet Risk Visualization
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Formula and How It Works */}
              <div>
                <h3 className="text-lg font-semibold mb-2">How It Works</h3>
                <p className="mb-3">
                  Wallet risk scores are calculated using a PageRank-inspired
                  algorithm that propagates risk through transaction networks.
                  The formula incorporates incoming and outgoing transaction
                  risks, logarithmic scaling of transaction amounts, and
                  neighbor normalization.
                </p>
                <p className="mb-3">
                  The formula for updating a wallet's risk score is:
                </p>
                <div className="overflow-x-auto">
                  <div className="bg-muted p-3 rounded-md text-sm whitespace-nowrap">
                    Sᵢ = (1 - d)/N + d × [Σⱼ (senderRiskScoreⱼ × log(txAmountⱼ)
                    × w / outDegreeⱼ) + Σₖ (receiverRiskScoreₖ × log(txAmountₖ)
                    × w / inDegreeₖ)]
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 mb-3">
                  (Scroll horizontally to view the full formula)
                </p>
                <p className="text-sm">
                  Where:
                  <ul className="list-disc list-inside text-sm">
                    <li>
                      <strong>
                        S<sub>i</sub>
                      </strong>
                      : Risk score of wallet i.
                    </li>
                    <li>
                      <strong>d</strong>: Damping factor (controls network
                      effects).
                    </li>
                    <li>
                      <strong>N</strong>: Total number of wallets in the
                      network.
                    </li>
                    <li>
                      <strong>
                        S<sub>j</sub>
                      </strong>
                      : Risk score of wallet j sending funds to wallet i.
                    </li>
                    <li>
                      <strong>
                        S<sub>k</sub>
                      </strong>
                      : Risk score of wallet k receiving funds from wallet i.
                    </li>
                    <li>
                      <strong>A</strong>: Transaction amount (logarithmically
                      scaled).
                    </li>
                    <li>
                      <strong>w</strong>: Transaction weight (adjusts impact of
                      transaction amounts).
                    </li>
                    <li>
                      <strong>
                        O<sub>j</sub>
                      </strong>
                      : Number of outgoing transactions from wallet j.
                    </li>
                    <li>
                      <strong>
                        I<sub>k</sub>
                      </strong>
                      : Number of incoming transactions to wallet k.
                    </li>
                  </ul>
                </p>
              </div>

              {/* Right Column: System Functionality */}
              <div>
                <h3 className="text-lg font-semibold mb-2">System Features</h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Clamping:</strong> Risk scores are clamped between 0
                    and 1 to ensure valid values.
                  </li>
                  <li>
                    <strong>Neighbor Normalization:</strong> Non-flagged
                    wallets' scores are smoothed by averaging with connected
                    neighbors.
                  </li>
                  <li>
                    <strong>Risk Thresholds:</strong> Wallets are categorized as
                    low, medium, or high risk based on predefined thresholds.
                  </li>
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
                  <li>
                    <strong>Historical Tracking:</strong> Changes in risk scores
                    are logged with timestamps and linked to triggering
                    transactions.
                  </li>
                  <li>
                    <strong>Interactive Controls:</strong> Adjust parameters
                    like damping factor, iterations, and risk thresholds to
                    simulate new scenarios.
                  </li>
                  <li>
                    <strong>Wallet Selection:</strong> Click on a wallet to view
                    detailed information and connected wallets.
                  </li>
                  <li>
                    <strong>Blockchain Timeline:</strong> Scroll down to view
                    the blockchain timeline, which shows all transactions and
                    their associated risk scores.
                  </li>
                </ul>
              </div>
            </div>
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
            wallets={globeWallets}
            transactions={globeTransactions}
            isSimulating={isSimulating}
            onWalletSelect={(wallet) =>
              handleWalletSelect(wallet ? mapGlobeWalletToWallet(wallet) : null)
            }
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
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedWalletDetails.flagged)}
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {selectedWalletDetails.flagged
                              ? "FLAGGED WALLET"
                              : "SAFE WALLET"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Current Risk Score
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedWalletDetails.risk_score >= 75
                              ? "bg-red-500 text-white"
                              : selectedWalletDetails.risk_score >= 50
                              ? "bg-amber-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {selectedWalletDetails.risk_score}/100
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2.5 mt-2">
                        <div
                          className={`${
                            selectedWalletDetails.risk_score >= 75
                              ? "bg-red-500"
                              : selectedWalletDetails.risk_score >= 50
                              ? "bg-amber-500"
                              : "bg-green-500"
                          } h-2.5 rounded-full`}
                          style={{
                            width: `${selectedWalletDetails.risk_score}%`,
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
                                Previous Score
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
                            {selectedWalletDetails?.risk_score_history.map(
                              (history, index) => {
                                const riskColor =
                                  history.risk_score >= 75
                                    ? "bg-red-500"
                                    : history.risk_score >= 50
                                    ? "bg-amber-500"
                                    : "bg-green-500";

                                const changeIcon =
                                  history.change === "up" ? (
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
                                  ) : history.change === "down" ? (
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
                                  ) : (
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
                                      <line
                                        x1="5"
                                        y1="12"
                                        x2="19"
                                        y2="12"
                                      ></line>
                                    </svg>
                                  );

                                return (
                                  <tr
                                    key={history._id}
                                    className="border-t border-border"
                                  >
                                    <td className="px-4 py-2 text-xs">
                                      {new Date(
                                        history.timestamp
                                      ).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColor} text-white`}
                                      >
                                        {history.previous_risk_score}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColor} text-white`}
                                      >
                                        {history.risk_score}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">{changeIcon}</td>
                                    <td className="px-4 py-2 text-right text-xs font-mono">
                                      {history.transaction_id.slice(0, 4)}...
                                      {history.transaction_id.slice(-4)}
                                    </td>
                                  </tr>
                                );
                              }
                            )}
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
                    <div className="border border-border rounded-lg overflow-hidden h-[400px]">
                      <div className="h-full overflow-y-auto custom-scrollbar p-3 space-y-3">
                        {selectedWalletDetails?.connected_wallets.map((id) => {
                          const connectedWallet = wallets.find(
                            (w) => w.id === id
                          );
                          if (!connectedWallet) return null;

                          const riskColor =
                            connectedWallet.risk_score >= 75
                              ? "bg-red-500"
                              : connectedWallet.risk_score >= 50
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
                                  {connectedWallet.risk_score}/100
                                </span>
                              </div>
                              <div className="w-full bg-background rounded-full h-1.5">
                                <div
                                  className={`${riskColor} h-1.5 rounded-full`}
                                  style={{
                                    width: `${connectedWallet.risk_score}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}

                        {(!selectedWalletDetails?.connected_wallets ||
                          selectedWalletDetails.connected_wallets.length ===
                            0) && (
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
        <BlockchainTimeline
          transactions={transactions}
          onTransactionClick={handleTransactionClick}
        />
      </div>
    </div>
  );
};

export default Home;
