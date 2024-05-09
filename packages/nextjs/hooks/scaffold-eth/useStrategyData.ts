import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { Strategy, TokenData } from '~~/types/customTypes';
import getTokenData from '~~/hooks/scaffold-eth/getTokenData';
import ercABI from '~~/contracts/erc20ABI.json';
import stratABI from '~~/contracts/strategyABI.json';
import { useScaffoldEventHistory } from '~~/hooks/scaffold-eth';

const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;

const useStrategyData = ({ contractAddress }: { contractAddress: string }) => {
  const [strategy, setStrategy] = useState<Strategy>();
  const [entryPrice, setEntryPrice] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  // Read the ERC20 address from the strategy contract
  const { data: erc20Address } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getERC20TokenAddress',
  });

  // Read the deposit events from the TrailMixManager contract
  const deposits = useScaffoldEventHistory({
    contractName: 'TrailMixManager',
    eventName: 'FundsDeposited',
    fromBlock: 110000002n,
    watch: false,
    filters: { strategy: contractAddress },
    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  useEffect(() => {
    if (!deposits.data && !deposits.error) {
      // Retry fetching after a delay if data is not available yet
      const timeoutId = setTimeout(() => {
        setLoading(true);
      }, 3000); // Retry after 3 seconds
      return () => clearTimeout(timeoutId);
    } else if (deposits.error) {
      console.error('Error loading deposits:', deposits.error);
      setLoading(false);
    } else if (deposits.data) {
      setLoading(false);
      // Process deposits data here
      if (deposits.data.length > 0) {
        const sortedDeposits = deposits.data.sort((a, b) => Number(b.block.timestamp) - Number(a.block.timestamp));
        const latestEntryPrice = sortedDeposits[0].log.args.depositPrice?.toString() ?? '0';
        setEntryPrice(latestEntryPrice);
      }
    }
  }, [deposits.data, deposits.error]);

  // Calculate profit
  const calculateProfit = (latestPrice: number) => {
    let totalCost = BigInt(0);
    let totalAmount = BigInt(0);

    deposits.data?.forEach((deposit) => {
      const amount = BigInt(deposit.log.args.amount ?? 0);
      const depositPrice = BigInt(deposit.log.args.depositPrice ?? 0);
      totalCost += amount * depositPrice;
      totalAmount += amount;
    });

    const currentValue = totalAmount * BigInt(latestPrice);
    const profit = currentValue - totalCost;
    return profit.toString();
  };

  const profit = calculateProfit(Number(entryPrice));

  // Read other necessary data from the strategy contract
  const { data: stablecoinAddress } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getStablecoinAddress',
  });

  const { data: stablecoinBalance } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getStablecoinBalance',
  });

  const { data: latestPrice } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getTwapPrice',
  });

  const { data: tslThreshold } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getTSLThreshold',
  });

  const { data: uniswapRouterAddress } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getUniswapRouterAddress',
  });

  const { data: trailAmount } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getTrailAmount',
  });

  const { data: manager } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getManager',
  });

  const { data: granularity } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getGranularity',
  });

  const { data: uniswapPool } = useContractRead({
    address: contractAddress,
    abi: strategyABI,
    functionName: 'getUniswapPool',
  });

  const { data: tokenDecimals } = useContractRead({
    address: erc20Address as string,
    abi: erc20ABI,
    functionName: 'decimals',
  });

  // Use the effect to combine all necessary data into the Strategy state
  useEffect(() => {
    if (!loading && erc20Address && latestPrice && stablecoinBalance && tokenDecimals && trailAmount && uniswapPool && granularity && manager && tslThreshold && stablecoinAddress && deposits.data) {
      const tokenData = getTokenData(erc20Address as string);
      console.log("tokenData",tokenData);
      const updatedStrategy: Strategy = {
        asset: tokenData as TokenData,
        contractAddress: contractAddress,
        erc20Balance: stablecoinBalance.toString(),
        twapPrice: latestPrice.toString(),
        trailAmount: trailAmount.toString(),
        uniswapPool: uniswapPool.toString(),
        granularity: granularity.toString(),
        manager: manager.toString(),
        tslThreshold: tslThreshold.toString(),
        stablecoinAddress: stablecoinAddress.toString(),
        profit: calculateProfit(Number(latestPrice)),
      };
      setStrategy(updatedStrategy);
    }
  }, []);

  return { strategy, loading };
};

export default useStrategyData;





// import { useEffect, useState } from 'react';
// import { useContractRead } from 'wagmi';
// import { Strategy, TokenData } from '~~/types/customTypes';
// import getTokenData from '~~/hooks/scaffold-eth/getTokenData';
// import ercABI from '~~/contracts/erc20ABI.json';
// import stratABI from '~~/contracts/strategyABI.json';
// import { useScaffoldEventHistory } from '~~/hooks/scaffold-eth';

// const strategyABI = stratABI.abi;
// const erc20ABI = ercABI.abi;

// const useStrategyData = ({ contractAddress }: { contractAddress: string }) => {
//   // console.log(contractAddress)
//   const [strategy, setStrategy] = useState<Strategy>();
//   const [entryPrice, setEntryPrice] = useState<string>('0');
//   const [loading, setLoading] = useState(true);

//   // Read the ERC20 address from the strategy contract
//   const { data: erc20Address } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getERC20TokenAddress',
//   });

//   // Read the deposit events from the TrailMixManager contract
//   const deposits = useScaffoldEventHistory({
//     contractName: 'TrailMixManager',
//     eventName: 'FundsDeposited',
//     fromBlock: 110000002n,
//     watch: false,
//     filters: { strategy: contractAddress },
//     blockData: true,
//     transactionData: true,
//     receiptData: true,
//   });
//   console.log(deposits);

//   useEffect(() => {
//     if (!deposits.data && !deposits.error) {
//       // Retry fetching after a delay if data is not available yet
//       const timeoutId = setTimeout(() => {
//         setLoading(true);
//       }, 3000); // retry after 3 seconds
//       return () => clearTimeout(timeoutId);
//     } else if (deposits.error) {
//       setLoading(false);
//     } else {
//       setLoading(false);
//       // Process deposits data here
//     }
//   }, [deposits.data, deposits.error]);

//   // Effect to sort deposits and set the entry price
//   useEffect(() => {
//     if (deposits.data && deposits.data.length > 0) {
//       const sortedDeposits = deposits.data.sort((a, b) => Number(b.block.timestamp) - Number(a.block.timestamp));
//       const latestEntryPrice = sortedDeposits[0].log.args.depositPrice?.toString() ?? '0';
//       setEntryPrice(latestEntryPrice);
//     }
//   }, [deposits.data]);

//   // Calculate profit
//   const calculateProfit = (latestPrice: number) => {
//     let totalCost = BigInt(0);
//     let totalAmount = BigInt(0);

//     deposits.data?.forEach((deposit) => {
//       const amount = BigInt(deposit.log.args.amount ?? 0);
//       const depositPrice = BigInt(deposit.log.args.depositPrice ?? 0);
//       totalCost += amount * depositPrice;
//       totalAmount += amount;
//     });

//     const currentValue = totalAmount * BigInt(latestPrice);
//     const profit = currentValue - totalCost;

//     return profit.toString();
//   };

//   const profit = calculateProfit(Number(entryPrice));

//   // Read stablecoin address from the strategy contract
//   const { data: stablecoinAddress } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getStablecoinAddress',
//   });

//   // Read stablecoin balance from the strategy contract
//   const { data: stablecoinBalance } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getStablecoinBalance',
//   });

//   // Read the latest price from the strategy contract
//   const { data: latestPrice } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getTwapPrice',
//   });

//   // Read the TSL Threshold from the strategy contract
//   const { data: tslThreshold } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getTSLThreshold',
//   });

//   // Read the Uniswap Router Address from the strategy contract
//   const { data: uniswapRouterAddress } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getUniswapRouterAddress',
//   });

//   // Read the Trail Amount from the strategy contract
//   const { data: trailAmount } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getTrailAmount',
//   });

//   // Read the manager from the strategy contract
//   const { data: manager } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getManager',
//   });

//   // Read the granularity from the strategy contract
//   const { data: granularity } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getGranularity',
//   });

//   // Read the Uniswap Pool from the strategy contract
//   const { data: uniswapPool } = useContractRead({
//     address: contractAddress,
//     abi: strategyABI,
//     functionName: 'getUniswapPool',
//   });

//   // Read the token decimals using the ERC20 ABI and address
//   const { data: tokenDecimals } = useContractRead({
//     address: erc20Address as string,
//     abi: erc20ABI,
//     functionName: 'decimals',
//   });

//   // Use the effect to combine all necessary data into the Strategy state
//   useEffect(() => {
//     if (erc20Address && latestPrice && stablecoinBalance && tokenDecimals && trailAmount && uniswapPool && granularity && manager && tslThreshold && stablecoinAddress) {
//       const tokenData = getTokenData(erc20Address as string);
//       const updatedStrategy: Strategy = {
//         asset: tokenData as TokenData,
//         erc20Balance: stablecoinBalance.toString(),
//         twapPrice: latestPrice.toString(),
//         trailAmount: trailAmount.toString(),
//         uniswapPool: uniswapPool.toString(),
//         granularity: granularity.toString(),
//         manager: manager.toString(),
//         tslThreshold: tslThreshold.toString(),
//         stablecoinAddress: stablecoinAddress.toString(),
//         profit: calculateProfit(Number(latestPrice)),
//       };
//       setStrategy(updatedStrategy);
//     }
//   }, [erc20Address, latestPrice, stablecoinBalance, tokenDecimals, trailAmount, uniswapPool, granularity, manager, tslThreshold, stablecoinAddress, deposits.data]);

//   return strategy;
// };

// export default useStrategyData;
