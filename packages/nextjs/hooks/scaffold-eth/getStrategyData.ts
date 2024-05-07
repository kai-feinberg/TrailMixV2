import { TokenData } from "~~/types/customTypes"; // token data type defined in customTypes.ts
import { Strategy } from "~~/types/customTypes"; // strategy type defined in customTypes.ts
import getTokenData from "~~/hooks/scaffold-eth/getTokenData"; // getTokenData function defined in getStrategyData.ts

//takes in a contract address and renders relevant information
import React from "react";
import { useEffect, useState } from "react";
import ercABI from "~~/contracts/erc20ABI.json";
import manager from "~~/contracts/managerABI.json";
import stratABI from "~~/contracts/strategyABI.json";
import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite} from "~~/hooks/scaffold-eth";

const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;

const getStrategyData = ({ contractAddress, userAddress }: { contractAddress: string; userAddress: string }) => {
  const [strategy, setStrategy] = useState<Strategy>();
  const {
    data: erc20Address,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getERC20TokenAddress",
  });


  const {
    data: erc20Balance,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getERC20Balance",
  });


  const {
    data: stablecoinAddress,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getStablecoinAddress",
  });

  const {
    data: stablecoinBalance,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getStablecoinBalance",
  });

  const {
    data: latestPrice,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getTwapPrice",
    onSuccess: (data) => {
      console.log("Latest Price: ", data);
    }
  });


  const {
    data: tslThreshold,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getTSLThreshold",
  });

  const {
    data: uniswapRouterAddress,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getUniswapRouterAddress",
  });

  const {
    data: trailAmount,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getTrailAmount",
  });

  const {
    data: manager,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getManager",
  });

  const {
    data: granularity,

  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getGranularity",
  });

  const {
    data: uniswapPool,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getUniswapPool",
  });


  const { data: tokenDecimals } = useContractRead({
    address: String(erc20Address),
    abi: erc20ABI,
    functionName: "decimals",
  });

const dec = Math.pow(10, tokenDecimals as number);
// // Ensure that contractAddr is not undefined or empty
const tokenData = getTokenData(erc20Address as string);

useEffect(() => {
    if (latestPrice && erc20Balance && tokenData && trailAmount) {
        const updatedStrategy: Strategy = {
            asset: tokenData as TokenData,
            erc20Balance: erc20Balance as string,
            twapPrice: latestPrice.toString(),
            trailAmount: trailAmount as string,
            uniswapPool: uniswapPool as string,
            granularity: granularity as string,
            manager: manager as string,
            tslThreshold: tslThreshold as string,
            stablecoinAddress: stablecoinAddress as string,
            profit: "100",
        };
        setStrategy(updatedStrategy);
    }
}, [tokenData, erc20Balance, latestPrice, trailAmount]);

  return strategy;
};

export default getStrategyData;



