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
import { useScaffoldEventHistory, useScaffoldContractWrite} from "~~/hooks/scaffold-eth";

const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;



const getStrategyData = ({ contractAddress }: { contractAddress: string; }) => {
  const [strategy, setStrategy] = useState<Strategy>();
  const [entryPrice, setEntryPrice] = useState<string>("0");
  const {
    data: erc20Address,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getERC20TokenAddress",
  });

  const deposits = useScaffoldEventHistory({
    contractName: "TrailMixManager",
    eventName: "FundsDeposited",
    fromBlock: 119000002n,
    watch: false,
    filters: { strategy :contractAddress },
    blockData: true,
    transactionData: true,
    receiptData: true,
});

  useEffect(() => {
    if (deposits && deposits.data && deposits.data.length > 0) {
      const sortedDeposits = (deposits.data).sort((a, b) => Number(b.block.timestamp) - Number(a.block.timestamp));
      const entryPrice = sortedDeposits[0].log.args.depositPrice?.toString() ?? "0"; // Add nullish coalescing operator
      setEntryPrice(entryPrice);
    }
  }, [deposits]);

  function calculateProfit( latestPrice: number): bigint {
    let totalCost: bigint = BigInt(0);
    let totalAmount: bigint = BigInt(0);

    if (!deposits.data) {
      return BigInt(0);
    }

    deposits.data.forEach((deposit) => {
      const amount: bigint = BigInt(deposit.log.args.amount ?? 0);
      const depositPrice: bigint = BigInt(deposit.log.args.depositPrice ?? 0);
      totalCost += amount * depositPrice;
      totalAmount += amount;
    });   
    
    const currentValue = totalAmount * BigInt(latestPrice);
    const profit = currentValue - totalCost;
  
    return profit;
  }

  const profit = calculateProfit(Number(entryPrice));

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
            profit: profit.toString(),
        };
        setStrategy(updatedStrategy);
    }
}, [tokenData, erc20Balance, latestPrice, trailAmount]);

  return strategy;
};

export default getStrategyData;



