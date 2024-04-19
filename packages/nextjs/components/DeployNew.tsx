//takes in a contract address and renders relevant information
import React from "react";
import { useEffect, useState } from "react";
import ercABI from "../contracts/erc20ABI.json";
import manager from "../contracts/managerABI.json";
import stratABI from "../contracts/strategyABI.json";
import { IntegerInput } from "./scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const strategyABI = stratABI.abi;
const erc20ABI = ercABI.abi;
const managerABI = manager.abi;

const DeployNew = () =>{

    const {writeAsync: deploy, isMining: isPending} = useScaffoldContractWrite({
        contractName: "TrailMixManager",
        functionName: "deployTrailMix",
        args: ["0x4200000000000000000000000000000000000042",
        "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        "0xB533c12fB4e7b53b5524EAb9b47d93fF6C7A456F",
        "0xed53e3E056C34a342ec0293e6Bc84E40Fd547799",
        BigInt(10 as number),
        BigInt(5 as number),
        3000 ],
        onBlockConfirmation: (txnReceipt) => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
        },
        onSuccess: () => {
            console.log("🚀 Strategy Deployed");
        },

    });

    const handleDeploy= async () => {
        try {
            await deploy();
            window.location.reload();
        } catch (e) {
          console.error("Error setting greeting", e);
        }
      };



    return (
        <div>
            <button className="btn btn-primary" onClick={handleDeploy} disabled={isPending}>
                {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Deploy New Strategy"}
            </button>        
        </div>

    );

}

export default DeployNew;