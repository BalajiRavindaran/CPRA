import React, { useState } from "react";
import GlobeVisualization from "./GlobeVisualization";
import SimulationControls from "./SimulationControls";
import BlockchainTimeline from "./BlockchainTimeline";
import { useEffect } from "react";
import { Info, ChevronLeft } from "lucide-react";

interface SimulationParams {
  walletCount: number;
  riskyWalletCount: number;
  transactionCount: number;
}

interface Wallet {
  id: string;
  position: [number, number, number];
  riskScore: number;
  color: string;
}

interface Transaction {
  source: string;
  target: string;
  startTime: number;
  endTime: number;
  color: string;
}

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
    const defaultWallets = [
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
          />
        </div>

        {/* Simulation controls (full width on mobile, 1/3 width on larger screens) */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full">
          <SimulationControls
            onSimulate={handleSimulate}
            isLoading={isLoading}
          />
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
