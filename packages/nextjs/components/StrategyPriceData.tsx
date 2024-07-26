// // import React, { useEffect } from 'react';
// import { Strategy } from "~~/types/customTypes";
// import useFetchTokenPriceData from "~~/hooks/scaffold-eth/useFetchTokenPriceData";
// interface StrategyPriceDataProps {
//   strategy: Strategy;
//   index: number;
//   onDataFetched: (data: [number, number][], index: number) => void;
// }

// const StrategyPriceData: React.FC<StrategyPriceDataProps> = ({ strategy, index, onDataFetched }) => {
//   const { tokenData, loading, error } = useFetchTokenPriceData(strategy, (data: [number, number][]) => {
//     onDataFetched(data, index);
//   });

//   useEffect(() => {
//     if (!loading && tokenData) {
//       console.log(`Data fetched for strategy at index ${index}:`, tokenData);
//       onDataFetched(tokenData, index);
//     }
//   }, [tokenData, loading, index, onDataFetched]);

//   if (loading) {
//     return <div>Loading price data...</div>;
//   }

//   if (error) {
//     return <div>Error fetching price data: {error}</div>;
//   }

//   return null; // This component doesn't render anything visible
// };

// export default StrategyPriceData;

import React, { useEffect, useState } from 'react';
import { Strategy } from "~~/types/customTypes";
import useFetchTokenPriceData from '~~/hooks/scaffold-eth/useFetchTokenPriceData';

interface StrategyPriceDataProps {
  strategy: Strategy;
  index: number;
  onDataFetched: (data: [number, number][], index: number) => void;
}

const StrategyPriceData: React.FC<StrategyPriceDataProps> = ({ strategy, index, onDataFetched }) => {
  const [isLoading, setIsLoading] = useState(true);

  const { tokenData, loading, error } = useFetchTokenPriceData(strategy, (data: [number, number][]) => {
    onDataFetched(data, index);
  });

  useEffect(() => {
    if (!loading && tokenData) {
      // console.log(`Data fetched for strategy at index ${index}:`, tokenData);
      onDataFetched(tokenData, index);
    }
  }, [tokenData, loading, index, onDataFetched]);

  // if (error) {
  //   return <div>Error fetching price data: {error}</div>;
  // }

  if (loading) {
    return <div>Loading price data...</div>;
  }

  return null; // This component doesn't render anything visible
};

export default StrategyPriceData;