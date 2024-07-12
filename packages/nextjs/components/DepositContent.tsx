//takes in a contract address and renders relevant information
import React from "react";
import { useEffect, useState } from "react";
import ercABI from "../contracts/erc20ABI.json";
import manager from "../contracts/managerABI.json";
import stratABI from "../contracts/strategyABI.json";
import { IntegerInput } from "./scaffold-eth";
import { useContractRead, useContractWrite, useMutation, usePrepareContractWrite } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

import { notification } from "~~/utils/scaffold-eth";

import { Button } from "@/components/ui/button";
import { TokenList } from "~~/types/customTypes";
import tokenList from "~~/lib/tokenList.json";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";


const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;


const DepositContent = ({ contractAddress }: { contractAddress: string }) => {
    const { address: userAddress } = useAccount(); // Get the user's address

    const [depositAmount, setDepositAmount] = useState<string | bigint>("0"); // State to store deposit amount
    const [assetPrice, setAssetPrice] = useState<string | bigint>("0"); // State to store latest price
    const [scaledDepositAmount, setScaledDepositAmount] = useState<bigint>(BigInt(0)); // State to store scaled deposit amount
    const [sufficientAllowance, setSufficientAllowance] = useState(false);

    

    const { targetNetwork } = useTargetNetwork();
    const tokenData = (tokenList as TokenList)[targetNetwork.id];

    const { data: erc20Address, isLoading: isLoadingErc20Address, error: errorErc20Address } = useContractRead({
        address: contractAddress,
        abi: strategyABI,
        functionName: "getERC20TokenAddress",
    });

    const [storedErc20Address, setStoredErc20Address] = useState<string>("");

    useEffect(() => {
        if (erc20Address) {
            setStoredErc20Address(erc20Address as string);
        }
    }, [erc20Address, isLoadingErc20Address]);

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
            // console.log("Latest Price: ", data);
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


    const { writeAsync: deposit, isLoading: isLoadingDeposit, isSuccess: depositSuccess } = useScaffoldContractWrite({
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
    }, [scaledDepositAmount, allowance]);

    const handleApprove = async () => {
        if (BigInt(allowance as string) < (scaledDepositAmount) && approve) {
            notification.warning("Need to approve funds", { duration: 3000 })
            approve();
            setSufficientAllowance(true)
            notification.warning("Approval success! You can now deposit funds", { duration: 5000 })
        }
    }

    const handleDeposit = async () => {
        //error if insufficient funds
        if (BigInt(userERC20Balance as number) < BigInt(scaledDepositAmount)) {
            notification.error("Insufficient funds", { duration: 5000 });
            return;
        }

        deposit();

    };
    console.log("balance of user", userERC20Balance)

    return (
        <div>
            <p> Balance: {userERC20Balance ? (BigInt(userERC20Balance as number) / BigInt(10 ** Number(tokenDecimals || 18))).toString() : '0'} {tokenData[(storedErc20Address as string).toLowerCase()]?.symbol || ''}
            </p>
            <IntegerInput value={depositAmount} onChange={setDepositAmount} />
            {!sufficientAllowance &&
                <Button variant="outline" className="rounded-xl" onClick={handleApprove}>
                    {!approveLoading && <p>approve</p>}
                    {approveLoading && (
                        <p>Loading ...</p>
                    )}
                </Button>
            }
            <Button variant="outline" className="rounded-xl" onClick={handleDeposit} disabled={!sufficientAllowance}>deposit </Button>
        </div>

    );
};

export default DepositContent;
