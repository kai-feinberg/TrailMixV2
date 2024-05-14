import { useEffect, useState } from "react";
import { useScaffoldEventHistory } from "./useScaffoldEventHistory";
import { useContractRead } from "wagmi";
import strategyABI from '~~/contracts/strategyABI.json';

const useStrategyProfit = (contractAddress: string, onProfitFetched: any) => {
  const [profit, setProfit] = useState('0');
  const [cost, setCost] = useState('0');
  const [amount, setAmount] = useState('0');

  const { data: deposits } = useScaffoldEventHistory({
    contractName: 'TrailMixManager',
    eventName: 'FundsDeposited',
    fromBlock: 110000002n,
    watch: false,
    filters: { strategy: contractAddress },
  });

  const { data: currentPrice } = useContractRead({
    address: contractAddress,
    abi: strategyABI.abi,
    functionName: 'getTwapPrice',
  });

  useEffect(() => {
    if (deposits && currentPrice) {
      let totalCost = BigInt(0);
      let totalAmount = BigInt(0);

      deposits.forEach((deposit) => {
        const depositAmount = BigInt(deposit.log.args.amount ?? 0);
        const depositPrice = BigInt(deposit.log.args.depositPrice ?? 0);
        totalCost += depositAmount * depositPrice;
        totalAmount += depositAmount;
      });

      const latestPrice = BigInt(currentPrice.toString());
      const currentValue = totalAmount * latestPrice;
      const computedProfit = currentValue - totalCost;

      // Update state with string values to avoid BigInt in render
      setProfit(computedProfit.toString());
      setCost(totalCost.toString());
      setAmount(totalAmount.toString());

      // Callback to update parent component state
      onProfitFetched(computedProfit.toString());
    }
  }, [deposits, currentPrice, onProfitFetched]);

  return { profit, cost, amount };
};

export default useStrategyProfit;
