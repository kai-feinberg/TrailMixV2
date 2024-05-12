import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { Strategy, TokenData } from '~~/types/customTypes';
import getTokenData from '~~/hooks/scaffold-eth/useTokenData';
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
  const { data: erc20Address, error: erc20AddressError } = useContractRead({
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
  console.log("deposits", deposits.data);

  useEffect(() => {
    if (!deposits.data && !deposits.error) {
      setLoading(true);
    } else if (deposits.error) {
      console.error('Error loading deposits:', deposits.error);
      setLoading(false);
    } else if (deposits.data) {
      setLoading(false);
      if (deposits.data.length > 0) {
        const sortedDeposits = deposits.data.sort((a, b) => Number(b.block.timestamp) - Number(a.block.timestamp));
        const latestEntryPrice = sortedDeposits[0].log.args.depositPrice?.toString() ?? '0';
        setEntryPrice(latestEntryPrice);
      }
    }
  }, [deposits.data, deposits.error]);

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

  useEffect(() => {
    const fetchTokenData = async () => {
      if (erc20Address) {
        const tokenData = await getTokenData(erc20Address as string);
        console.log("tokenData", tokenData);

        const latestPrice = await useContractRead({
          address: contractAddress,
          abi: strategyABI,
          functionName: 'getTwapPrice',
        }).data?.toString() ?? '0';

        const erc20Balance = await useContractRead({
          address: contractAddress,
          abi: strategyABI,
          functionName: 'getERC20Balance',
        }).data?.toString() ?? '0';

        const tokenDecimals = await useContractRead({
          address: erc20Address as string,
          abi: erc20ABI,
          functionName: 'decimals',
        }).data?.toString() ?? '18';

        const stablecoinAddress = await useContractRead({
          address: contractAddress,
          abi: strategyABI,
          functionName: 'getStablecoinAddress',
        }).data?.toString() ?? '';

        const trailAmount = await useContractRead({
          address: contractAddress,
          abi: strategyABI,
          functionName: 'getTrailAmount',
        }).data?.toString() ?? '0';

        const uniswapPool = await useContractRead({
          address: contractAddress,
          abi: strategyABI,
          functionName: 'getUniswapPool',
        }).data?.toString() ?? '';

        const granularity = await useContractRead({
          address: contractAddress,
          abi: strategyABI,
          functionName: 'getGranularity',
        }).data?.toString() ?? '1';

        const manager = await useContractRead({
          address: contractAddress,
          abi: strategyABI,
          functionName: 'getManager',
        }).data?.toString() ?? '';

        const tslThreshold = await useContractRead({
          address: contractAddress,
          abi: strategyABI,
          functionName: 'getTSLThreshold',
        }).data?.toString() ?? '0';

        if (tokenData) {
          setStrategy({
            asset: tokenData as TokenData,
            contractAddress,
            erc20Balance,
            twapPrice: latestPrice,
            trailAmount,
            uniswapPool,
            granularity,
            manager,
            tslThreshold,
            stablecoinAddress,
            profit: calculateProfit(Number(latestPrice)),
          });
        }
      }
    };

    fetchTokenData();
  }, [deposits.data, erc20Address]);

  console.log("strategy", strategy);
  return { strategy, loading };
};

export default useStrategyData;