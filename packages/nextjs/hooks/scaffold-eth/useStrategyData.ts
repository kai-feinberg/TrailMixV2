import { useEffect, useState } from "react";
import { useScaffoldEventHistory } from "./useScaffoldEventHistory";
import { Strategy, TokenData, TokenList } from '~~/types/customTypes';
import { useContractRead } from "wagmi";
import { useTargetNetwork } from "./useTargetNetwork";
import strategyABI from '~~/contracts/strategyABI.json';
import tokenList from '~~/lib/tokenList.json';

const useStrategyData = (contractAddress: string, onDataFetched: any) => {
  const [profit, setProfit] = useState('0');
  const [entryCost, setEntryCost] = useState('0');
  const [amount, setAmount] = useState('0');

//   const { data: deposits } = useScaffoldEventHistory({
//     contractName: 'TrailMixManager',
//     eventName: 'FundsDeposited',
//     fromBlock: 1100002n,
//     watch: false,
//     filters: { strategy: contractAddress },
//   });

  const { data: currentPrice, isLoading: isLoadingCurrentPrice } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getTwapPrice',
  });

  const { data: erc20TokenAddress, isLoading: isLoadingErc20TokenAddress } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getERC20TokenAddress',
  });
  const { data: twapPrice, isLoading: isLoadingTwapPrice } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getTwapPrice',
  });
  const { data: erc20Balance, isLoading: isLoadingErc20Balance } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getERC20Balance',
  });
  const { data: stablecoinAddress, isLoading: isLoadingStablecoinAddress } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getStablecoinAddress',
  });
  const { data: trailAmount, isLoading: isLoadingTrailAmount } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getTrailAmount',
  });
  const { data: uniswapPool, isLoading: isLoadingUniswapPool } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getUniswapPool',
  });
  const { data: granularity, isLoading: isLoadingGranularity } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getGranularity',
  });
  const { data: manager, isLoading: isLoadingManager } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getManager',
  });
  const { data: tslThreshold, isLoading: isLoadingTslThreshold } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getTSLThreshold',
  });

  const { targetNetwork } = useTargetNetwork();



  useEffect(() => {
    
    if (!isLoadingCurrentPrice && !isLoadingErc20TokenAddress && !isLoadingTwapPrice && !isLoadingErc20Balance && !isLoadingStablecoinAddress && !isLoadingTrailAmount && !isLoadingUniswapPool && !isLoadingGranularity && !isLoadingManager && !isLoadingTslThreshold) {
      try {
        //     let totalCost = Number(0);
        // let totalAmount = BigInt(0);

        // deposits.forEach((deposit) => {
        //     const depositAmount = BigInt(deposit.log.args.amount ?? 0);
        //     const depositPrice = BigInt(deposit.log.args.depositPrice ?? 0);
        //     totalCost += Number(depositAmount) * Number(depositPrice);
        //     totalAmount += depositAmount;
        // });

        // const latestPrice = BigInt(currentPrice.toString());
        // const currentValue = totalAmount * latestPrice;
        // const computedProfit = currentValue - BigInt(totalCost);

        // // Update state with string values to avoid BigInt in render
        // setProfit(computedProfit.toString());
        // setEntryCost(totalCost.toString());
        // setAmount(totalAmount.toString());

        // const percentProfit = Number(totalCost) === 0 ? 0 : (Number(computedProfit) / Number(totalCost)) * 100;
        // // Callback to update parent component state

        const tokenData = (tokenList as TokenList)[targetNetwork.id][erc20TokenAddress?.toString().toLowerCase() ?? ''];
        console.log("tokenData: ", tokenData);
        console.log("tokenList", tokenList);
        console.log("erc20TokenAddress: ", erc20TokenAddress);
        console.log("targetNetwork: ", targetNetwork.id);

        const strategy: Strategy = {
            asset: tokenData as TokenData,
            contractAddress: contractAddress.toString(),
            erc20Balance: erc20Balance?.toString() ?? '',
            twapPrice: twapPrice?.toString() ?? '',
            trailAmount: trailAmount?.toString() ?? '',
            uniswapPool: uniswapPool?.toString() ?? '',
            granularity: granularity?.toString() ?? '',
            manager: manager?.toString() ?? '',
            tslThreshold: tslThreshold?.toString() ?? '',
            stablecoinAddress: stablecoinAddress?.toString() ?? '',
            profit: "0",
            weightedEntryCost: "0",
            percentProfit: "0"
        }
        
        console.log("strategy: ", strategy);
        onDataFetched(strategy);
        }
        catch (e) {
            console.error(e);
        }
    }
  }, [erc20TokenAddress, erc20Balance, stablecoinAddress, trailAmount, uniswapPool, granularity, manager, tslThreshold]);

  return;
};

export default useStrategyData;
