import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Settings,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import WalletDetailPopup from "./WalletDetailPopup";
import { motion, AnimatePresence } from "framer-motion";

interface SimulationControlsProps {
  onSimulate?: (params: SimulationParams) => void;
  isLoading?: boolean;
}

interface SimulationParams {
  walletCount: number;
  riskyWalletCount: number;
  transactionCount: number;
}

const SimulationControls = ({
  onSimulate = () => {},
  isLoading = false,
}: SimulationControlsProps) => {
  // Form state
  const [walletCount, setWalletCount] = useState(100);
  const [riskyWalletCount, setRiskyWalletCount] = useState(10);
  const [transactionCount, setTransactionCount] = useState(500);
  const [dampingFactor, setDampingFactor] = useState(0.85);
  const [iterations, setIterations] = useState(20);
  const [riskThreshold, setRiskThreshold] = useState(75);
  const [allowRiskDecay, setAllowRiskDecay] = useState(false);
  const [transactionWeight, setTransactionWeight] = useState(0.5);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [walletsGenerated, setWalletsGenerated] = useState(false);

  const handleGenerateWallets = () => {
    // First step - just generate wallets without transactions
    onSimulate({
      walletCount,
      riskyWalletCount,
      transactionCount: 0, // No transactions yet
    });
    setWalletsGenerated(true);
    setCurrentStep(2);
  };

  const handleSimulate = () => {
    // Final step - run the full simulation with transactions
    onSimulate({
      walletCount,
      riskyWalletCount,
      transactionCount,
    });
  };

  return (
    <div className="h-full bg-background border-t md:border-t-0 md:border-l border-border">
      <div className="flex items-center h-14 px-4 border-b border-border">
        <CardTitle className="text-xl flex-1">Simulation Controls</CardTitle>
      </div>

      <div className="h-[calc(100%-3.5rem)] overflow-auto">
        <div className="p-6 backdrop-blur-md bg-background/80 h-full">
          {/* Step indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  1
                </div>
                <div className="h-1 w-8 mx-1 bg-muted">
                  <div
                    className={`h-full bg-primary ${currentStep > 1 ? "w-full" : "w-0"} transition-all duration-300`}
                  ></div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  2
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of 2
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-xl font-semibold mb-3">
                    Wallet Network Simulation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by configuring your wallet network. This will create a
                    network of cryptocurrency wallets with varying risk
                    profiles.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      1
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Configure Network</p>
                      <p className="text-muted-foreground">
                        Set wallet count and risk distribution
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                      2
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-muted-foreground">
                        Configure Transactions
                      </p>
                      <p className="text-muted-foreground">
                        Set transaction parameters and algorithm settings
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Network Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <Label htmlFor="walletCount">
                              Number of Wallets
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px] text-xs">
                                    Total number of cryptocurrency wallets to
                                    simulate in the network
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="text-sm font-medium">
                            {walletCount}
                          </span>
                        </div>
                        <Slider
                          id="walletCount"
                          min={10}
                          max={500}
                          step={10}
                          value={[walletCount]}
                          onValueChange={(value) => setWalletCount(value[0])}
                          className="mb-2"
                        />
                        <Input
                          type="number"
                          id="walletCountInput"
                          value={walletCount}
                          onChange={(e) =>
                            setWalletCount(Number(e.target.value))
                          }
                          min={10}
                          max={500}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <Label htmlFor="riskyWalletCount">
                              Risky Wallets
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px] text-xs">
                                    Number of wallets with high initial risk
                                    scores (75-100)
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="text-sm font-medium">
                            {riskyWalletCount}
                          </span>
                        </div>
                        <Slider
                          id="riskyWalletCount"
                          min={0}
                          max={Math.min(100, walletCount)}
                          step={1}
                          value={[riskyWalletCount]}
                          onValueChange={(value) =>
                            setRiskyWalletCount(value[0])
                          }
                          className="mb-2"
                        />
                        <Input
                          type="number"
                          id="riskyWalletCountInput"
                          value={riskyWalletCount}
                          onChange={(e) =>
                            setRiskyWalletCount(Number(e.target.value))
                          }
                          min={0}
                          max={Math.min(100, walletCount)}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex items-center space-x-2 mt-4">
                        <input
                          type="checkbox"
                          id="allowRiskDecay"
                          checked={allowRiskDecay}
                          onChange={(e) => setAllowRiskDecay(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div className="flex items-center gap-1">
                          <Label
                            htmlFor="allowRiskDecay"
                            className="text-sm font-medium"
                          >
                            Allow Risk Decay
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">
                                  When enabled, risk scores can decrease over
                                  time if no new risky transactions occur
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 mt-8">
                  <Button
                    className="flex-1 gap-2"
                    size="lg"
                    onClick={handleGenerateWallets}
                    disabled={isLoading}
                  >
                    <ArrowRight className="h-5 w-5" />
                    {isLoading ? "Generating..." : "Generate Wallets"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-xl font-semibold mb-3">
                    Transaction Simulation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Now configure the transaction parameters and algorithm
                    settings to simulate risk propagation through the network.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                      1
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-muted-foreground">
                        Configure Network
                      </p>
                      <p className="text-muted-foreground">
                        Set wallet count and risk distribution
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      2
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Configure Transactions</p>
                      <p className="text-muted-foreground">
                        Set transaction parameters and algorithm settings
                      </p>
                    </div>
                  </div>
                </div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Transaction Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Label htmlFor="transactionCount">
                            Number of Transactions
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">
                                  Total number of transactions to simulate
                                  between wallets
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm font-medium">
                          {transactionCount}
                        </span>
                      </div>
                      <Slider
                        id="transactionCount"
                        min={50}
                        max={2000}
                        step={50}
                        value={[transactionCount]}
                        onValueChange={(value) => setTransactionCount(value[0])}
                        className="mb-2"
                      />
                      <Input
                        type="number"
                        id="transactionCountInput"
                        value={transactionCount}
                        onChange={(e) =>
                          setTransactionCount(Number(e.target.value))
                        }
                        min={50}
                        max={2000}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Algorithm Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-1">
                          <Label htmlFor="dampingFactor">Damping Factor</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">
                                  Controls how much risk is transferred between
                                  connected wallets (higher values = more
                                  transfer)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Slider
                            id="dampingFactor"
                            min={0.1}
                            max={0.9}
                            step={0.05}
                            value={[dampingFactor]}
                            onValueChange={(value) =>
                              setDampingFactor(value[0])
                            }
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-10 text-right">
                            {dampingFactor}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <Label htmlFor="iterations">Iterations</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">
                                  Number of times the algorithm runs to
                                  propagate risk through the network
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Slider
                            id="iterations"
                            min={5}
                            max={50}
                            step={5}
                            value={[iterations]}
                            onValueChange={(value) => setIterations(value[0])}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-10 text-right">
                            {iterations}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Risk Analysis Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-1">
                          <Label htmlFor="riskThreshold">
                            High Risk Threshold
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">
                                  Score at which a wallet is considered high
                                  risk (shown in red)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Slider
                            id="riskThreshold"
                            min={50}
                            max={90}
                            step={5}
                            value={[riskThreshold]}
                            onValueChange={(value) =>
                              setRiskThreshold(value[0])
                            }
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-10 text-right">
                            {riskThreshold}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <Label htmlFor="transactionWeight">
                            Transaction Weight
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-[200px] text-xs">
                                  How much each transaction contributes to risk
                                  propagation
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Slider
                            id="transactionWeight"
                            min={0.1}
                            max={1.0}
                            step={0.1}
                            value={[transactionWeight]}
                            onValueChange={(value) =>
                              setTransactionWeight(value[0])
                            }
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-10 text-right">
                            {transactionWeight}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    className="w-1/3"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="w-2/3 gap-2"
                    size="lg"
                    onClick={handleSimulate}
                    disabled={isLoading}
                  >
                    <Play className="h-5 w-5" />
                    {isLoading ? "Simulating..." : "Run Simulation"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6">
            <Button
              variant="ghost"
              className="text-sm text-muted-foreground w-full"
              onClick={() => setShowWalletPopup(true)}
            >
              View Sample Wallet Details
            </Button>
          </div>

          {showWalletPopup && (
            <WalletDetailPopup
              position={{ x: 250, y: 400 }}
              onClose={() => setShowWalletPopup(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
