import React from "react";
import useStrategyProfit from "~~/hooks/scaffold-eth/useStrategyProfit";

interface StrategyProfitUpdaterProps {
    contractAddress: string;
    index: number;
    onProfitFetched: (index: number, profit: string, entryCost: string, percentProfit:string) => void;
  }
const StrategyProfitFetcher: React.FC<StrategyProfitUpdaterProps> =({contractAddress, index, onProfitFetched}) => {
    const { profit } = useStrategyProfit(contractAddress, (profit:string, entryCost:string, percentProfit:string) => {
        onProfitFetched(index, profit, entryCost, percentProfit);
      });
    
      return null
  };
  
  export default StrategyProfitFetcher;