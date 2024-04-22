//takes in a contract address and renders relevant information
import React from "react";
import { useEffect, useState } from "react";
import ercABI from "../contracts/erc20ABI.json";
import manager from "../contracts/managerABI.json";
import stratABI from "../contracts/strategyABI.json";
import { IntegerInput } from "./scaffold-eth";
import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;

const Strategy = ({ contractAddress, userAddress }: { contractAddress: string; userAddress: string }) => {
  const [depositAmount, setDepositAmount] = useState<string | bigint>("0"); // State to store deposit amount
  const [assetPrice, setAssetPrice] = useState<string | bigint>("0"); // State to store latest price
  const [scaledDepositAmount, setScaledDepositAmount] = useState<bigint>(BigInt(0)); // State to store scaled deposit amount
  const {
    data: erc20Address,
    isLoading: isLoadingErc20Address,
    error: errorErc20Address,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getERC20TokenAddress",
  });

  const {
    data: erc20Balance,
    isLoading: isLoadingErc20Balance,
    error: errorErc20Balance,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getERC20Balance",
  });


  const {
    data: stablecoinAddress,
    isLoading: isLoadingStablecoinAddress,
    error: errorStablecoinAddress,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getStablecoinAddress",
  });

  const {
    data: latestPrice,
    isLoading: isLoadingLatestPrice,
    error: errorLatestPrice,
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
    isLoading: isLoadingTSLThreshold,
    error: errorTSLThreshold,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getTSLThreshold",
  });

  const {
    data: isTSLActive,
    isLoading: isLoadingIsTSLActive,
    error: errorIsTSLActive,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "isTSLActive",
  });

  const {
    data: uniswapRouterAddress,
    isLoading: isLoadingUniswapRouterAddress,
    error: errorUniswapRouterAddress,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getUniswapRouterAddress",
  });

  const {
    data: trailAmount,
    isLoading: isLoadingTrailAmount,
    error: errorTrailAmount,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getTrailAmount",
  });

  const {
    data: manager,
    isLoading: isLoadingManager,
    error: errorManager,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getManager",
  });

  const {
    data: creator,
    isLoading: isLoadingCreator,
    error: errorCreator,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getCreator",
  });

  const {
    data: granularity,
    isLoading: isLoadingGranularity,
    error: errorGranularity,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getGranularity",
  });

  const {
    data: uniswapPool,
    isLoading: isLoadingUniswapPool,
    error: errorUniswapPool,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getUniswapPool",
  });

  // Check if the allowance is sufficient
  const { data: allowance } = useContractRead({
    address: String(erc20Address),
    abi: erc20ABI,
    functionName: "allowance",
    args: [userAddress, manager], // `address` is the user's address
  });

  const { data: tokenDecimals } = useContractRead({
    address: String(erc20Address),
    abi: erc20ABI,
    functionName: "decimals",
  });

  const dec = Math.pow(10, tokenDecimals as number);
  // // Ensure that contractAddr is not undefined or empty

  const { config: approveConfig } = usePrepareContractWrite({
    address: String(erc20Address),
    abi: erc20ABI,
    functionName: "approve",
    args: [manager, scaledDepositAmount], //make dynamic state vars,

  });

  const {
    data: approveResult,
    isLoading: approveLoading,
    isSuccess: approveSuccess,
    write: approve,
  } = useContractWrite(approveConfig);

  const { writeAsync: deposit, isMining: isPending } = useScaffoldContractWrite({
    contractName: "TrailMixManager",
    functionName: "deposit",
    args: [contractAddress, BigInt(scaledDepositAmount), BigInt(assetPrice as string)],
    onBlockConfirmation: (txnReceipt: any) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
    onSuccess: () => {
      console.log("🚀 Strategy Deployed");
    },

  });

  useEffect(() => {
    setAssetPrice(latestPrice as string);
    setScaledDepositAmount(BigInt(Number(depositAmount) * dec || 0));
  }, [depositAmount]);


  const { writeAsync: withdraw, isMining: withdrawPending } = useScaffoldContractWrite({
    contractName: "TrailMixManager",
    functionName: "withdraw",
    args: [contractAddress],
    onBlockConfirmation: (txnReceipt: any) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
    onSuccess: () => {
      console.log("🚀 funds withdrawn");
    },

  });


  const handleDeposit = async () => {

    if (BigInt(allowance as string) >= BigInt(scaledDepositAmount) && deposit) {
      await deposit();
    } else {
      if (approve) {
        await Promise.resolve(approve()).then(() => {
          deposit();
          console.log("Approval successful, deposit triggered");
        }).catch(error  => {
          console.error("Approval failed", error);
        });
      }
    }
  };

  const {
    data: events,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "TrailMixManager",
    eventName: "ContractDeployed",
    fromBlock: 119000002n,
    watch: false,
    filters: { creator: userAddress },
    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  useEffect(() => {
    if (!isLoadingEvents && events) {
      console.log("Events:", events);
      events.forEach((e) => {
        console.log("timestamp", e.block.timestamp);
        console.log("contract address", e.log.args.contractAddress);
      });
    }
  }, [events]);

  return (
    <div>
      <h2>Strategy Information: {contractAddress}</h2>
      <p> Erc20Balance: {erc20Balance ? erc20Balance.toString() : "0"}</p>
      <p>latest Price: {latestPrice ? latestPrice.toString() : "0"}</p>
      <p>TSL Threshold: {tslThreshold ? tslThreshold.toString() : "0"}</p>
      <p>Is TSL Active: {isTSLActive ? "Yes" : "No"}</p>
      <p>Uniswap Router Address: {uniswapRouterAddress ? uniswapRouterAddress.toString() : "loading"}</p>
      <p>Trail Amount: {trailAmount ? String(trailAmount) : "Loading"}</p>
      <p>Manager: {manager ? manager.toString() : "loading"}</p>
      <p>Creator: {creator ? creator.toString() : "loading"}</p>
      <p>Granularity: {granularity ? granularity.toString() : "Loading..."}</p>
      <p>Uniswap Pool: {uniswapPool ? uniswapPool.toString() : "Loading..."}</p>
      <p>Allowance: {allowance ? allowance.toString() : "loading..."}</p>
      {isLoadingLatestPrice && <div>Loading latest price</div>}
      <IntegerInput value={depositAmount} onChange={setDepositAmount} />
      <div><button onClick={handleDeposit}>Deposit</button></div>

      <button onClick={withdraw}>Withdraw</button>


    </div>
  );
};

export default Strategy;
