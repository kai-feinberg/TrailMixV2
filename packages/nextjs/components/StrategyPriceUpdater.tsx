"use client"
import React from 'react';
import { useGlobalState } from "~~/services/store/store";
import StrategyPriceData from "~~/components/StrategyPriceData";
import { Strategy } from "~~/types/customTypes";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

const StrategyPriceUpdater: React.FC = () => {
  const { strategies, setStrategies } = useGlobalState();
  const updateStrategyData = (tokenData: [number, number][], i: number) => {
    console.log("setting token data", tokenData)
    setStrategies((prevStrategies: Strategy[] | undefined) => {
      // Ensure prevStrategies is an array

      const currentStrategies = Array.isArray(prevStrategies) ? prevStrategies : [];

        // Update existing strategy
        return currentStrategies.map((s, index) =>
          index ===  i ? { ...s, priceData: tokenData } : s
        );
      
    });
  };

  return (
    <>
      {strategies?.map((strategy, index) => (
        <StrategyPriceData
          key={strategy.contractAddress}
          strategy={strategy}
          onDataFetched={(tokenData) => updateStrategyData(tokenData, index)}
        />
      ))}
    </>
  );
};

export default StrategyPriceUpdater;