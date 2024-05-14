import React from "react";
import useStrategyProfit from "~~/hooks/scaffold-eth/useStrategyProfit";

interface StrategyProfitUpdaterProps {
    contractAddress: string;
    index: number;
    onProfitFetched: (index: number, profit: string) => void;
  }
const StrategyProfitFetcher: React.FC<StrategyProfitUpdaterProps> =({contractAddress, index, onProfitFetched}) => {
    const { profit } = useStrategyProfit(contractAddress, (profit:any) => {
        onProfitFetched(index, profit);
      });
    
      return null
  };
  
  export default StrategyProfitFetcher;