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
import { Transaction } from "../utils/types";

interface BlockchainTimelineProps {
  transactions?: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

const BlockchainTimeline = ({ transactions = [], onTransactionClick = () => {} }: BlockchainTimelineProps) => {
  const [filter, setFilter] = useState<"all" | "high-risk" | "flagged">("all");
  const [expanded, setExpanded] = useState(true);

  const filteredTransactions = transactions.filter((tx) => {
    const riskScore = Number((tx.risk * 100).toFixed(0));
    if (filter === "high-risk") return riskScore >= 75;
    if (filter === "flagged") return tx.flagged;
    return true;
  });

  const getRiskColor = (risk: number) => {
    const riskScore = Number((risk * 100).toFixed(0));
    if (riskScore >= 75) return "bg-red-500";
    if (riskScore >= 50) return "bg-amber-500";
    return "bg-green-500";
  };

  const getStatusIcon = (flagged: boolean) => {
    if (flagged) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
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
                  {filteredTransactions.map((transaction, index) => {
                    const riskScore = Number((transaction.risk * 100).toFixed(0));
                    return (
                      <div key={transaction._id} className="relative">
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
                                {transaction._id}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(transaction.timestamp).toLocaleString()}
                                </span>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(transaction.flagged)}
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {transaction.flagged ? "Flagged" : "Normal"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center text-sm mb-2">
                              <span className="font-mono text-xs truncate max-w-[120px]">
                                {transaction.sender_id}
                              </span>
                              <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                              <span className="font-mono text-xs truncate max-w-[120px]">
                                {transaction.receiver_id}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {transaction.amount} ETH
                              </span>
                              <Badge
                                className={`${getRiskColor(transaction.risk)} text-white text-xs`}
                              >
                                Risk: {riskScore}/100
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
