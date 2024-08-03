// components/StrategyPriceData.tsx
"use client"
import React, { useEffect } from 'react';
import { Strategy } from "~~/types/customTypes";
import { useFetchTokenPriceData } from '~~/hooks/scaffold-eth/useFetchTokenPriceData';

interface StrategyPriceDataProps {
  strategy: Strategy;
  onDataFetched: (data: [number, number][], contractAddress: string) => void;
}

const StrategyPriceData: React.FC<StrategyPriceDataProps> = ({ strategy, onDataFetched }) => {
  const { data, isLoading, isError, error } = useFetchTokenPriceData(strategy);

  useEffect(() => {
    if (data) {
      onDataFetched(data, strategy.contractAddress);
    }
  }, [data, strategy.contractAddress, onDataFetched]);

  if (isError) {
    console.error(`Error fetching price data for ${strategy.contractAddress}:`, error);
  }

  return null;
};

export default StrategyPriceData;
// import React, { useEffect, useState } from 'react';
// import { Strategy } from "~~/types/customTypes";
// import useFetchTokenPriceData from '~~/hooks/scaffold-eth/useFetchTokenPriceData';

// interface StrategyPriceDataProps {
//   strategy: Strategy;
//   index: number;
//   onDataFetched: (data: [number, number][], index: number) => void;
// }

// const StrategyPriceData: React.FC<StrategyPriceDataProps> = ({ strategy, index, onDataFetched }) => {
//   const [isLoading, setIsLoading] = useState(true);

//   const { tokenData, loading, error } = useFetchTokenPriceData(strategy, (data: [number, number][]) => {
//     onDataFetched(data, index);
//   });

//   // useEffect(() => {
//   //   if (!loading && tokenData) {
//   //     // console.log(`Data fetched for strategy at index ${index}:`, tokenData);
//   //     onDataFetched(tokenData, index);
//   //   }
//   // }, [tokenData, loading, index, onDataFetched]);

//   // if (error) {
//   //   return <div>Error fetching price data: {error}</div>;
//   // }

//   // if (loading) {
//   //   return <div>Loading price data...</div>;
//   // }

//   return null; // This component doesn't render anything visible
// };

// export default StrategyPriceData;