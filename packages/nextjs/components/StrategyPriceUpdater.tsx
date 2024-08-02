"use client"
import React, { useEffect, useCallback, useState } from 'react';
import { useGlobalState } from "~~/services/store/store";
import StrategyPriceData from "~~/components/StrategyPriceData";
import { Strategy } from "~~/types/customTypes";

const StrategyPriceUpdater: React.FC = () => {
  const { strategies, setStrategies } = useGlobalState();
  const [updatedStrategies, setUpdatedStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    setUpdatedStrategies(strategies);
  }, [strategies]);

  const updateStrategyData = useCallback((tokenData: [number, number][], index: number) => {
    // console.log("updateStrategyData called for index", index, tokenData);
    setUpdatedStrategies(prevStrategies =>
      prevStrategies.map((s, i) =>
        i === index ? { ...s, priceData: tokenData } : s
      )
    );
  }, []);

  useEffect(() => {
    // console.log("Updated strategies:", updatedStrategies);
    if (updatedStrategies.length > 0) {
      setStrategies(updatedStrategies);
      // console.log(updatedStrategies)
    }
  }, [updatedStrategies]);

  // console.log("Rendering StrategyPriceUpdater, strategies count:", strategies.length);

  const filteredStrategies = updatedStrategies.filter(strategy => 
          strategy.contractState === "Active" || strategy.contractState === "Claimable")

  return (
    <>
      {filteredStrategies.map((strategy, index) => (
        <StrategyPriceData
          key={`${strategy.contractAddress}-${index}`}
          strategy={strategy}
          index={index}
          onDataFetched={updateStrategyData}
        />
      ))}
    </>
  );
};

export default StrategyPriceUpdater;