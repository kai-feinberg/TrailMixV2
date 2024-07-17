import { useEffect } from "react";
import { useScaffoldEventHistory } from "./useScaffoldEventHistory";
import { Strategy, TokenData, TokenList } from '~~/types/customTypes';
import { useContractRead } from "wagmi";
import { useTargetNetwork } from "./useTargetNetwork";
import strategyABI from '~~/contracts/strategyABI.json';
import tokenList from '~~/lib/tokenList.json';
import { useNativeCurrencyPrice } from "./useNativeCurrencyPrice";
import useFetchTokenPrice from "./useFetchTokenPriceData";

const useStrategyData = (contractAddress: string, onDataFetched: any) => {

  const { data: deposits, isLoading: isLoadingDeposits } = useScaffoldEventHistory({
    contractName: 'TrailMixManager',
    eventName: 'FundsDeposited',
    fromBlock: 1100002n,
    watch: false,
    filters: { strategy: contractAddress },
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
  const { data: stablecoinBalance, isLoading: isLoadingStablecoinBalance } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getStablecoinBalance',
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

  const {data: contractState, isLoading: isLoadingContractState} = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getState',
  });

  const {data: profit, isLoading: isLoadingProfit} = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: "getProfit"
  })

  const {data: weightedEntryPrice, isLoading: isLoadingWeightedEntryPrice} = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: "getWeightedEntryPrice"
  })

  const {data: exitPrice, isLoading: isLoadingExitPrice} = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: "getExitPrice"
  })

  const { targetNetwork } = useTargetNetwork();
  const ethPrice = useNativeCurrencyPrice();


  const coinGeckoId = (tokenList as TokenList)[targetNetwork.id][erc20TokenAddress?.toString().toLowerCase() ?? ''].coinGeckoId
  const {tokenData: priceData, loading: isLoadingPriceData} = useFetchTokenPrice(coinGeckoId, "1720627777", Date.now().toString())


  useEffect(() => {
    
    if (!isLoadingWeightedEntryPrice && ethPrice && !isLoadingExitPrice && !isLoadingProfit && !isLoadingContractState && !isLoadingStablecoinBalance&& !isLoadingDeposits
       && !isLoadingErc20TokenAddress && !isLoadingTwapPrice && !isLoadingErc20Balance && !isLoadingStablecoinAddress && !isLoadingTrailAmount
        && !isLoadingUniswapPool && !isLoadingGranularity && !isLoadingManager && !isLoadingTslThreshold && !isLoadingPriceData ) {
      try {
        
        // const percentProfit = Number(totalCost) === 0 ? 0 : (Number(computedProfit) / Number(totalCost)) * 100;
        const percentProfit = 0;
        // // Callback to update parent component state

        const tokenData = (tokenList as TokenList)[targetNetwork.id][erc20TokenAddress?.toString().toLowerCase() ?? ''];
        const stableAssetData = (tokenList as TokenList)[targetNetwork.id][stablecoinAddress?.toString().toLowerCase() ?? '']
        
        const assetDecimals = 10**tokenData.decimals;
        const price = (stablecoinAddress as string).toLowerCase() === "0x0b2c639c533813f4aa9d7837caf62653d097ff85" ? (10**12) : ethPrice;
        
        const usdValue = (Number(erc20Balance) * (price) * Number(twapPrice)) / ((assetDecimals ** 2)* ((10**(18-tokenData.decimals))**2 ) );
        const profitInUsd = Number(profit)*price / (assetDecimals * 10**(18-tokenData.decimals)**2)

        const stableBalUsd = (Number(stablecoinBalance) * price)/ assetDecimals
        const strategy: Strategy = {
            asset: tokenData as TokenData,
            contractAddress: contractAddress.toString(),
            erc20Balance: erc20Balance?.toString() ?? '',
            balanceInUsd: usdValue?.toString() ?? '',
            erc20Asset: erc20TokenAddress?.toString() ?? '',
            twapPrice: twapPrice?.toString() ?? '',
            trailAmount: trailAmount?.toString() ?? '',
            uniswapPool: uniswapPool?.toString() ?? '',
            granularity: granularity?.toString() ?? '',
            manager: manager?.toString() ?? '',
            tslThreshold: tslThreshold?.toString() ?? '',
            stablecoinAddress: stablecoinAddress?.toString() ?? '',
            profit: profit?.toString() ?? '',
            weightedEntryPrice: weightedEntryPrice?.toString() ?? '',
            exitPrice: exitPrice?.toString() ?? '',
            percentProfit: percentProfit.toString(),
            profitInUsd: profitInUsd.toString() ?? '',
            contractState: contractState?.toString() ?? '',
            stablecoinBalance: stablecoinBalance?.toString() ?? '',
            stablecoinBalanceInUsd: stableBalUsd?.toString() ?? '',
            stableAsset: stableAssetData as TokenData,
            priceData: (priceData) as [number, number][]
          }
        
        // console.log("strategy: ", strategy);
        // console.log("profit", profit)
        // console.log("price data", priceData)
        onDataFetched(strategy);
        }
        catch (e) {
            console.info("ligma", e);
        }
    }
  }, [erc20TokenAddress, profit, exitPrice, weightedEntryPrice, contractState, erc20Balance, stablecoinAddress, stablecoinBalance, trailAmount, uniswapPool, granularity, manager, tslThreshold, deposits]);

  return;
};

export default useStrategyData;
