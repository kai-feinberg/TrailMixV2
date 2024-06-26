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
import { ArrowDownFromLineIcon } from "lucide-react";
import { notification } from "~~/utils/scaffold-eth";



import { Button } from "@/components/ui/button";
import { TokenList } from "~~/types/customTypes";
import tokenList from "~~/lib/tokenList.json";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";


const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;


const DepositPopup = ({ contractAddress }: { contractAddress: string }) => {
    const { address: userAddress } = useAccount(); // Get the user's address

    const [depositAmount, setDepositAmount] = useState<string | bigint>("0"); // State to store deposit amount
    const [assetPrice, setAssetPrice] = useState<string | bigint>("0"); // State to store latest price
    const [scaledDepositAmount, setScaledDepositAmount] = useState<bigint>(BigInt(0)); // State to store scaled deposit amount
    const [sufficientAllowance, setSufficientAllowance] = useState(false);

    const { targetNetwork } = useTargetNetwork();
    const tokenData = (tokenList as TokenList)[targetNetwork.id];

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
        data: manager,
        isLoading: isLoadingManager,
        error: errorManager,
    } = useContractRead({
        address: contractAddress,
        abi: strategyABI,
        functionName: "getManager",
    });


    // Check if the allowance is sufficient
    const { data: allowance, isLoading: isLoadingAllowance } = useContractRead({
        address: String(erc20Address),
        abi: erc20ABI,
        functionName: "allowance",
        args: [userAddress, manager], // `address` is the user's address
    });

    const { data: userERC20Balance } = useContractRead({
        address: String(erc20Address),
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [userAddress], // `address` is the user's address
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



    const { writeAsync: deposit, isLoading: isLoadingDeposit } = useScaffoldContractWrite({
        contractName: "TrailMixManager",
        functionName: "deposit",
        args: [contractAddress, BigInt(scaledDepositAmount), BigInt(assetPrice || "0")],
        onBlockConfirmation: (txnReceipt: any) => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
        },
        onSuccess: () => {
            console.log("🚀 Deposit success");
        },

    });

    useEffect(() => {
        setAssetPrice(latestPrice as string);
        setScaledDepositAmount(BigInt(Number(depositAmount) * dec || 0));
    }, [depositAmount]);


    useEffect(() => {
        if (allowance) {
            if (BigInt(allowance as string) >= (scaledDepositAmount)) {
                // console.log("sufficient allowance is true")
                setSufficientAllowance(true)
            }
            else {
                // console.log("sufficient allowance is false")
                setSufficientAllowance(false)
            }
        }
    }, [isLoadingAllowance, allowance, scaledDepositAmount, approveSuccess, approveResult]);


    const handleDeposit = async () => {
        //error if insufficient funds
        if (BigInt(userERC20Balance as number) < BigInt(scaledDepositAmount)) {
            notification.error("Insufficient funds", { duration: 5000 });
            return;
        }


        // await approve();

        //set phase to deposit
        
        deposit();
        // } else {
        //     if (approve) {
        //         notification.warning("Approving funds", { duration: 5000 });
        //         await Promise.resolve(approve()).then(() => {
        //             deposit();
        //             console.log("Approval successful, deposit triggered");
        //         }).catch(error => {
        //             console.error("Approval failed", error);
        //         });
        //     }
        // }
    };


    return (

        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl"><ArrowDownFromLineIcon className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>Deposit funds</DialogTitle>
                    <DialogDescription>
                        Add funds to existing strategy
                    </DialogDescription>
                </DialogHeader>

                <p> Balance: {(userERC20Balance ? BigInt(userERC20Balance as number) / BigInt(10 ** (tokenDecimals as number)) : 0).toString()} {tokenData[(erc20Address as string).toLowerCase()].symbol}
                </p>
                <IntegerInput value={depositAmount} onChange={setDepositAmount} />

                {!sufficientAllowance &&
                    <Button variant="outline" className="rounded-xl" onClick={approve}>
                        {!approveLoading && <p>approve</p>}

                        {approveLoading && (
                            <span className="loading loading-spinner loading-sm"></span>
                        )}
                    </Button>
                }

                <Button variant="outline" className="rounded-xl" onClick={handleDeposit}>Deposit </Button>
            </DialogContent>
        </Dialog>
    );
};

export default DepositPopup;
