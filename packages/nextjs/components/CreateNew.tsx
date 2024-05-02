"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ComboBox";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import tokenList from '~~/lib/tokenList.json';
import { useTargetNetwork } from '~~/hooks/scaffold-eth/useTargetNetwork';


interface TokenData {
  [key: string]: any;  // Replace 'any' with a more specific type based on your token data structure
}

interface TokenList {
  [chainId: number]: {
    [contractAddress: string]: TokenData;
  };
}


export function CreateNew() {

  const [tokenAddress, setTokenAddress] = React.useState('');
  const [strategy, setStrategy] = React.useState("5");
  const [depositAmount, setDepositAmount] = React.useState("");
  const [poolAddress, setPoolAddress] = React.useState("");

  const { targetNetwork } = useTargetNetwork();
  const chainId = targetNetwork?.id;

  const tokens = (tokenList as TokenList)[chainId];

  const tokenOptions = tokens ? Object.entries(tokens).map(([contractAddress, details]) => ({
    value: contractAddress, //value is value set to the state
    label: `${details.name} ($${details.symbol})`, //label is displayed on front end in dropdown
  })) : [];


  const strategyOptions = [
    {
      value: "15",
      label: "Basic (15% trail)",
    },
    {
      value: "5",
      label: "Tight (5% trail)",
    },
    {
      value: "30",
      label: "Loose (30% trail)",
    },
  ];

  React.useEffect(() => {
    if (tokenAddress && tokens[tokenAddress]?.pool) {
      setPoolAddress(tokens[tokenAddress].pool);
      console.log(tokens[tokenAddress].pool);
    } else {
      setPoolAddress("");
    }
  }, [tokenAddress]);

  // const { writeAsync: deploy, isMining: isPending } = useScaffoldContractWrite({
  //   contractName: "TrailMixManager",
  //   functionName: "deployTrailMix",
  //   args: ["0x4200000000000000000000000000000000000042",
  //     "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  //     "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  //     "0xB533c12fB4e7b53b5524EAb9b47d93fF6C7A456F",
  //     "0xed53e3E056C34a342ec0293e6Bc84E40Fd547799",
  //     BigInt(5 as number),
  //     BigInt(1 as number),
  //     3000],
  //   onBlockConfirmation: (txnReceipt) => {
  //     console.log("📦 Transaction blockHash", txnReceipt.blockHash);
  //   },
  //   onSuccess: () => {
  //     console.log("🚀 Strategy Deployed");
  //   },

  // });
  const { writeAsync: deploy, isMining: isPending } = useScaffoldContractWrite({
    contractName: "TrailMixManager",
    functionName: "deployTrailMix",
    args: [tokenAddress, //chosen token address
      "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", //usdc address
      "0xE592427A0AEce92De3Edee1F18E0157C05861564",  // Uniswap V3 router
      poolAddress, //pool address
      "0xed53e3E056C34a342ec0293e6Bc84E40Fd547799", // TWAP oracle
      BigInt(strategy), //trail amount
      BigInt(5 as number), //granularity
      3000],
    onBlockConfirmation: (txnReceipt) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
    onSuccess: () => {
      console.log("🚀 Strategy Deployed");
    },

  });

  const handleDeploy = async () => {
    try {
      const deploymentResult = await deploy();
      console.log(deploymentResult);
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create New</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
          <DialogDescription>
            Deploy a new trailing stop loss strategy
          </DialogDescription>
        </DialogHeader>


        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Token
            </Label>
              <ComboBox 
              value={tokenAddress || ''}
              setValue={setTokenAddress }
              frameworks={tokenOptions || []}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Strategy
            </Label>
            <ComboBox
              value={strategy}
              setValue={setStrategy}
              frameworks={strategyOptions}
            />
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Deposit Amount
            </Label>
            <Input
              id="depositAmount"
              defaultValue="0.00"
              className="col-span-3"
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-black" onClick={handleDeploy}>Create</Button>
      </DialogContent>
    </Dialog>
  );
}
