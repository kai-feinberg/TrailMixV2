// "use client"
// import React from 'react';
// import { useEffect } from 'react';
// import { useGlobalState } from "~~/services/store/store";
// import StrategyPriceData from "~~/components/StrategyPriceData";
// import { Strategy } from "~~/types/customTypes";
// import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
// import { useAccount } from "wagmi";

// const StrategyPriceUpdater: React.FC = () => {
//   const { strategies, setStrategies } = useGlobalState();
//   const updateStrategyData = (tokenData: [number, number][], i: number) => {
//     console.log("setting token data", tokenData)
//     setStrategies((prevStrategies: Strategy[] | undefined) => {
//       // Ensure prevStrategies is an array

//       const currentStrategies = Array.isArray(prevStrategies) ? prevStrategies : [];

//         // Update existing strategy
//         return currentStrategies.map((s, index) =>
//           index ===  i ? { ...s, priceData: tokenData } : s
//         );
      
//     });
//   };

//   return (
//     <>
//       {strategies?.map((strategy, index) => (
//         <StrategyPriceData
//           key={strategy.contractAddress}
//           strategy={strategy}
//           onDataFetched={(tokenData) => updateStrategyData(tokenData, index)}
//         />
      

//       ))}
//     </>
//   );
// };

// export default StrategyPriceUpdater;
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

  return (
    <>
      {updatedStrategies.map((strategy, index) => (
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