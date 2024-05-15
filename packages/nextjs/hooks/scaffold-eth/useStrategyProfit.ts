import { useEffect, useState } from "react";
import { useScaffoldEventHistory } from "./useScaffoldEventHistory";
import { useContractRead } from "wagmi";
import strategyABI from '~~/contracts/strategyABI.json';

const useStrategyProfit = (contractAddress: string, onProfitFetched: any) => {
  const [profit, setProfit] = useState('0');
  const [entryCost, setEntryCost] = useState('0');
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
      let totalCost = Number(0);
      let totalAmount = BigInt(0);

      deposits.forEach((deposit) => {
        const depositAmount = BigInt(deposit.log.args.amount ?? 0);
        const depositPrice = BigInt(deposit.log.args.depositPrice ?? 0);
        totalCost += Number(depositAmount) * Number(depositPrice);
        totalAmount += depositAmount;
      });

      const latestPrice = BigInt(currentPrice.toString());
      const currentValue = totalAmount * latestPrice;
      const computedProfit = currentValue - BigInt(totalCost);

      // Update state with string values to avoid BigInt in render
      setProfit(computedProfit.toString());
      setEntryCost(totalCost.toString());
      setAmount(totalAmount.toString());

      const percentProfit = Number(totalCost) === 0 ? 0 : (Number(computedProfit) / Number(totalCost)) * 100;
      // Callback to update parent component state
      onProfitFetched(computedProfit.toString(), totalCost.toString(), percentProfit.toString());
    }
  }, [deposits]);

  return { profit, entryCost };
};

export default useStrategyProfit;
