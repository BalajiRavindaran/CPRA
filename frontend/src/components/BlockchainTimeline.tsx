import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "../utils/api";

interface Transaction {
  id: string;
  timestamp: string;
  fromWallet: string;
  toWallet: string;
  amount: number;
  riskScore: number;
  status: "" | "flagged";
}

interface BlockchainTimelineProps {
  transactions?: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

const BlockchainTimeline = ({ onTransactionClick = () => {} }: BlockchainTimelineProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"all" | "high-risk" | "flagged">("all");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.getTransactions();

        // Transform backend response to match BlockchainTimeline structure
        const formattedTransactions: Transaction[] = data.map((tx) => ({
          id: tx._id,
          timestamp: new Date(tx.timestamp).toLocaleString(),
          fromWallet: tx.sender_id,
          toWallet: tx.receiver_id,
          amount: tx.amount,
          riskScore: (tx.risk * 100).toFixed(),
          status: tx.flagged?"flagged":"",
        }));

        setTransactions(formattedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "high-risk") return tx.riskScore >= 75;
    if (filter === "flagged") return tx.status === "flagged";
    return true;
  });

  const getRiskColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-green-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-background border-t border-border">
      <div className="container mx-auto py-4 px-2 md:px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="p-1"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <h2 className="text-xl font-semibold">Blockchain Timeline</h2>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Tabs
              defaultValue="all"
              className="w-full max-w-[300px]"
              onValueChange={(value) => setFilter(value as any)}
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="high-risk">High Risk</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {expanded && (
          <Card className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Showing {filteredTransactions.length} transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4 custom-scrollbar">
                <div className="space-y-4">
                  {filteredTransactions.map((transaction, index) => (
                    <div key={transaction.id} className="relative">
                      {index > 0 && (
                        <div className="absolute left-6 top-0 h-full w-0.5 -mt-4 bg-border"></div>
                      )}
                      <div
                        className="flex items-start p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer relative z-10 bg-background"
                        onClick={() => onTransactionClick(transaction)}
                      >
                        <div className="flex-shrink-0 mr-4 bg-muted rounded-full p-2">
                          <Clock className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium">
                              {transaction.id}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {transaction.timestamp}
                              </span>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(transaction.status)}
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm mb-2">
                            <span className="font-mono text-xs truncate max-w-[120px]">
                              {transaction.fromWallet}
                            </span>
                            <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                            <span className="font-mono text-xs truncate max-w-[120px]">
                              {transaction.toWallet}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {transaction.amount} ETH
                            </span>
                            <Badge
                              className={`${getRiskColor(transaction.riskScore)} text-white text-xs`}
                            >
                              Risk: {transaction.riskScore}/100
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlockchainTimeline;
