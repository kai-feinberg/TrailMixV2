//takes in a contract address and renders relevant information
import React from "react";
import { useEffect, useState } from "react";
import ercABI from "../contracts/erc20ABI.json";
import manager from "../contracts/managerABI.json";
import stratABI from "../contracts/strategyABI.json";
import { IntegerInput } from "./scaffold-eth";
import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { ArrowDownFromLineIcon} from "lucide-react";

  
import { Button } from "@/components/ui/button";
const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;


const DepositPopup = ({ contractAddress }: { contractAddress: string }) => {
    const {address :userAddress} = useAccount(); // Get the user's address

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
        data: stablecoinBalance,
        isLoading: isLoadingStablecoinBalance,
        error: errorStablecoinBalance,
    } = useContractRead({
        address: contractAddress,
        abi: strategyABI,
        functionName: "getStablecoinBalance",
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

    const { config: swapConfig } = usePrepareContractWrite({
        address: contractAddress,
        abi: strategyABI,
        functionName: "swapOnUniswap",
        args: [erc20Balance],
    });
    const { data: swapResult, isLoading: swapLoading, isSuccess: swapSuccess, write: swap } = useContractWrite(swapConfig);


    const { writeAsync: deposit, isMining: isPending } = useScaffoldContractWrite({
        contractName: "TrailMixManager",
        functionName: "deposit",
        args: [contractAddress, BigInt(scaledDepositAmount), BigInt(assetPrice || "0")],
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
        args: [contractAddress, "0x4200000000000000000000000000000000000042"],
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
                }).catch(error => {
                    console.error("Approval failed", error);
                });
            }
        }
    };

    return (

    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon"><ArrowDownFromLineIcon className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Deposit funds</DialogTitle>
          <DialogDescription>
            Add funds to existing strategy
          </DialogDescription>
        </DialogHeader>

        <IntegerInput value={depositAmount} onChange={setDepositAmount} />
        <Button variant="outline" onClick={handleDeposit}>Deposit </Button>
      </DialogContent>
    </Dialog>        
    );
};

export default DepositPopup;
