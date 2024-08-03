// components/StrategyPriceUpdater.tsx
"use client"
import React, { useCallback } from 'react';
import { useGlobalState } from "~~/services/store/store";
import StrategyPriceData from "~~/components/StrategyPriceData";
import  shallow from 'zustand/shallow'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const StrategyPriceUpdater: React.FC = () => {
  const { strategies, setStrategies } = useGlobalState(
    (state) => ({
      strategies: state.strategies,
      setStrategies: state.setStrategies
    }),
    shallow
  );
  const queryClient = new QueryClient();

  const updateStrategyData = useCallback((tokenData: [number, number][], contractAddress: string) => {
    setStrategies(prevStrategies => 
      prevStrategies.map(s => 
        s.contractAddress === contractAddress 
          ? { ...s, priceData: tokenData } 
          : s
      )
    );
  }, [setStrategies]);

  const filteredStrategies = strategies.filter(strategy => 
    strategy.contractState === "Active" || strategy.contractState === "Claimable"
  );

  return (
    <QueryClientProvider client={queryClient}>
      <>
        {filteredStrategies.map((strategy) => (
          <StrategyPriceData
            key={strategy.contractAddress}
            strategy={strategy}
            onDataFetched={updateStrategyData}
          />
        ))}
      </>
    </QueryClientProvider>
  );
};

export default StrategyPriceUpdater;
// "use client"
// import React, { useCallback, useEffect, useRef } from 'react';
// import { useGlobalState } from "~~/services/store/store";
// import StrategyPriceData from "~~/components/StrategyPriceData";
// import shallow from 'zustand/shallow'

// const StrategyPriceUpdater: React.FC = () => {
//   const { strategies, setStrategies } = useGlobalState(
//     (state) => ({
//       strategies: state.strategies,
//       setStrategies: state.setStrategies
//     }),
//     shallow
//   );

//   const updateQueue = useRef<Map<string, [number, number][]>>(new Map());

//   const updateStrategyData = useCallback((tokenData: [number, number][], contractAddress: string) => {
//     updateQueue.current.set(contractAddress, tokenData);
//   }, []);

//   useEffect(() => {
//     if (updateQueue.current.size > 0) {
//       setStrategies(prevStrategies => 
//         prevStrategies.map(s => {
//           const newData = updateQueue.current.get(s.contractAddress);
//           return newData ? { ...s, priceData: newData } : s;
//         })
//       );
//       updateQueue.current.clear();
//     }
//   }, [setStrategies]);

//   const filteredStrategies = strategies.filter(strategy => 
//     strategy.contractState === "Active" || strategy.contractState === "Claimable"
//   );

//   return (
//     <>
//       {filteredStrategies.map((strategy) => (
//         <StrategyPriceData
//           key={strategy.contractAddress}
//           strategy={strategy}
//           onDataFetched={updateStrategyData}
//         />
//       ))}
//     </>
//   );
// };

// export default StrategyPriceUpdater;
// "use client"
// import React, { useCallback } from 'react';
// import { useGlobalState } from "~~/services/store/store";
// import StrategyPriceData from "~~/components/StrategyPriceData";
// import { Strategy } from "~~/types/customTypes";
// import  shallow from 'zustand/shallow'

// const StrategyPriceUpdater: React.FC = () => {
//   const { strategies, setStrategies } = useGlobalState(
//     (state) => ({
//       strategies: state.strategies,
//       setStrategies: state.setStrategies
//     }),
//     shallow
//   );

//   const updateStrategyData = useCallback((tokenData: [number, number][], index: number) => {
//     setStrategies((prevStrategies: Strategy[]) => 
//       prevStrategies.map((s, i) => 
//         i === index ? { ...s, priceData: tokenData } : s
//       )
//     );
//   }, [setStrategies]);

//   const filteredStrategies = strategies.filter(strategy => 
//     strategy.contractState === "Active" || strategy.contractState === "Claimable"
//   );

//   return (
//     <>
//       {filteredStrategies.map((strategy, index) => (
//         <StrategyPriceData
//           key={`${strategy.contractAddress}-${index}`}
//           strategy={strategy}
//           index={index}
//           onDataFetched={updateStrategyData}
//         />
//       ))}
//     </>
//   );
// };

// export default StrategyPriceUpdater;
// "use client"
// import React, { useEffect, useCallback, useState } from 'react';
// import { useGlobalState } from "~~/services/store/store";
// import StrategyPriceData from "~~/components/StrategyPriceData";
// import { Strategy } from "~~/types/customTypes";

// const StrategyPriceUpdater: React.FC = () => {
//   const { strategies, setStrategies } = useGlobalState();
//   const [updatedStrategies, setUpdatedStrategies] = useState<Strategy[]>([]);

//   useEffect(() => {
//     setUpdatedStrategies(strategies);
//   }, [strategies]);

//   const updateStrategyData = useCallback((tokenData: [number, number][], index: number) => {
//     // console.log("updateStrategyData called for index", index, tokenData);
//     setUpdatedStrategies(prevStrategies =>
//       prevStrategies.map((s, i) =>
//         i === index ? { ...s, priceData: tokenData } : s
//       )
//     );
//   }, []);

//   useEffect(() => {
//     // console.log("Updated strategies:", updatedStrategies);
//     if (updatedStrategies.length > 0) {
//       setStrategies(updatedStrategies);
//       // console.log(updatedStrategies)
//     }
//   }, [updatedStrategies]);

//   // console.log("Rendering StrategyPriceUpdater, strategies count:", strategies.length);

//   const filteredStrategies = updatedStrategies.filter(strategy => 
//           strategy.contractState === "Active" || strategy.contractState === "Claimable")

//   return (
//     <>
//       {filteredStrategies.map((strategy, index) => (
//         <StrategyPriceData
//           key={`${strategy.contractAddress}-${index}`}
//           strategy={strategy}
//           index={index}
//           onDataFetched={updateStrategyData}
//         />
//       ))}
//     </>
//   );
// };

// export default StrategyPriceUpdater;