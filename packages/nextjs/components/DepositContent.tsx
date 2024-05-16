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
import { ethers } from "ethers";


import { Button } from "@/components/ui/button";
const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;


const provider = new ethers.providers.InfuraProvider("optimism", process.env.INFURA_API_KEY);


const DepositContent = ({ contractAddress }: { contractAddress: string }) => {
    const { address: userAddress } = useAccount(); // Get the user's address

    const [depositAmount, setDepositAmount] = useState<string | bigint>("0"); // State to store deposit amount
    const [assetPrice, setAssetPrice] = useState<string | bigint>("0"); // State to store latest price
    const [scaledDepositAmount, setScaledDepositAmount] = useState<bigint>(BigInt(0)); // State to store scaled deposit amount
    const [approvalAmount, setApprovalAmount] = useState<string>("0"); // State to store approval amount
    const {
        data: erc20Address,
        isLoading: isLoadingErc20Address,
        error: errorErc20Address,
    } = useContractRead({
        address: contractAddress,
        abi: strategyABI,
        functionName: "getERC20TokenAddress",
    });
    const erc20Contract = new ethers.Contract(erc20Address as string, erc20ABI, provider);


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

   

    const handleDeposit = async () => {
        console.log("AAAAAAAAAA");
        console.log("Current allowance: ", approvalAmount.toString());


        if (BigInt(approvalAmount) >= BigInt(scaledDepositAmount) && deposit) {
            await deposit();
        } else {
            if (approve) {
                try {
                    await approve();
                    console.log("Approval successful");
                    if (deposit) {
                        await deposit();
                        console.log("Deposit triggered");
                    }
                } catch (error) {
                    console.error("Approval failed", error);
                }
            }
        }

    };
    
    useEffect(() => {
        const fetchAllowance = async () => {
            try {
                const currentAllowance = await erc20Contract.allowance(userAddress, manager);
                console.log("Current allowance: ", currentAllowance.toString());

                if (currentAllowance) {
                    setApprovalAmount(currentAllowance.toString());
                    console.log("Current allowance: ", currentAllowance.toString());
                }
            } catch (error) {
                console.error("Failed to fetch allowance", error);
            }
        };

        fetchAllowance();
    }, [approvalAmount]);

    return (
        <div>
            <IntegerInput value={depositAmount} onChange={setDepositAmount} />
            <Button variant="outline" onClick={handleDeposit}>Deposit </Button>
        </div>

    );
};

export default DepositContent;
