//takes in a contract address and renders relevant information
import React from "react";
import { useEffect, useState } from "react";
import ercABI from "../contracts/erc20ABI.json";
import manager from "../contracts/managerABI.json";
import stratABI from "../contracts/strategyABI.json";
import { IntegerInput } from "./scaffold-eth";
import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;

const Strategy = ({ contractAddress, userAddress }: { contractAddress: string; userAddress: string }) => {
  const [depositAmount, setDepositAmount] = useState<string | bigint>(""); // State to store deposit amount
  const [readyToDeposit, setReadyToDeposit] = useState(false); // State to store if user is ready to deposit

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
    isLoading: isLoadingLatestPRice,
    error: errorLatestPrice,
  } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: "getLatestPrice",
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
  const scaledDepositAmount = Number(depositAmount) * dec;

  const { config: approveConfig } = usePrepareContractWrite({
    address: String(erc20Address),
    abi: erc20ABI,
    functionName: "approve",
    args: [manager, scaledDepositAmount], //make dynamic state vars
  });
  const {
    data: approveResult,
    isLoading: approveLoading,
    isSuccess: approveSuccess,
    write: approve,
  } = useContractWrite(approveConfig);

  // const { writeAsync: deposit, isLoading: isDepositing } = useScaffoldContractWrite({
  //     contractName: "TrailMixManager",
  //     functionName: 'deposit',
  //     args: [
  //         contractAddress,
  //         BigInt(scaledDepositAmount != null ? scaledDepositAmount : 0),
  //         BigInt(latestPrice as number != null ? latestPrice as number: 0)
  //       ]    })
  const { config: depositConfig } = usePrepareContractWrite({
    address: manager as string,
    abi: managerABI,
    functionName: "deposit",
    args: [contractAddress, scaledDepositAmount, latestPrice], //make dynamic state vars
  });
  const { data: depositResult, isLoading, isSuccess, write: deposit } = useContractWrite(depositConfig);

  useEffect(() => {
    // Check if enough allowance to deposit
    async function checkAllowance() {
      if (BigInt(allowance as string) >= BigInt(scaledDepositAmount)) {
        setReadyToDeposit(true);
      } else {
        setReadyToDeposit(false);
      }
    }
  }, [allowance, scaledDepositAmount]);

  const handleDeposit = async () => {
    if (!readyToDeposit) {
      // Not enough allowance, need to approve first
      if (approve) {
        // Add null check for approve function
        await approve();
      }
      setReadyToDeposit(true);
    }

    if (readyToDeposit && deposit) {
      // Add null check for deposit function
      // Now proceed with deposit
      await deposit();
    }
  };

  return (
    <div>
      <h2>Strategy Information: {contractAddress}</h2>
      <p>TSL Threshold: {tslThreshold ? tslThreshold.toString() : "loading"}</p>
      <p>Is TSL Active: {isTSLActive ? "Yes" : "No"}</p>
      <p>Uniswap Router Address: {uniswapRouterAddress ? uniswapRouterAddress.toString() : "loading"}</p>
      <p>Trail Amount: {trailAmount ? String(trailAmount) : "Loading"}</p>
      <p>Manager: {manager ? manager.toString() : "loading"}</p>
      <p>Creator: {creator ? creator.toString() : "loading"}</p>
      <p>Granularity: {granularity ? granularity.toString() : "Loading..."}</p>
      <p>Uniswap Pool: {uniswapPool ? uniswapPool.toString() : "Loading..."}</p>
      <p>Allowance: {allowance ? allowance.toString() : "loading..."}</p>
      <IntegerInput value={depositAmount} onChange={setDepositAmount} />
      <button onClick={handleDeposit}>Deposit</button>
    </div>
  );
};

export default Strategy;
