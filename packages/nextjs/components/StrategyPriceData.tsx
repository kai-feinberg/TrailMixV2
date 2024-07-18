import React from "react";
import useFetchTokenPriceData from "~~/hooks/scaffold-eth/useFetchTokenPriceData";
import { Strategy } from "../types/customTypes";

interface StrategyDataProps {
  strategy: Strategy;
  onDataFetched: (tokenData: [number, number][], index:number) => void;
}
const StrategyPriceData: React.FC<StrategyDataProps> = ({ strategy, onDataFetched }) => {
  useFetchTokenPriceData(strategy, (tokenData: [number, number][], index:number) => {
    onDataFetched(tokenData, index);
  });

  return null
};

export default StrategyPriceData;