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
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ComboBox";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import tokenList from '~~/lib/tokenList.json';
import { useTargetNetwork } from '~~/hooks/scaffold-eth/useTargetNetwork';
import { ShieldIcon, ScaleIcon, SwordIcon } from "lucide-react";
import DepositPopup from "./DepositPopup";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { IntegerInput } from "./scaffold-eth";

import manABI from "~~/contracts/managerABI.json";
import DepositContent from "./DepositContent";

const managerABI = manABI.abi;


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
  const [strategy, setStrategy] = React.useState("20");
  const [depositAmount, setDepositAmount] = React.useState("");
  const [poolAddress, setPoolAddress] = React.useState("");


  const [phase, setPhase] = React.useState("deploy");

  const { targetNetwork } = useTargetNetwork();
  const chainId = targetNetwork?.id;

  const tokens = (tokenList as TokenList)[chainId];

  const { address: connectedAddress } = useAccount();

  const { data: userContracts } = useScaffoldContractRead({
    contractName: "TrailMixManager",
    functionName: "getUserContracts",
    args: [connectedAddress],
  });


  const tokenOptions = tokens ? Object.entries(tokens).map(([contractAddress, details]) => ({
    value: contractAddress, //value is value set to the state
    label: `${details.name} ($${details.symbol})`, //label is displayed on front end in dropdown
  })) : [];


  React.useEffect(() => {
    // console.log(tokenAddress);
    // console.log(tokens[tokenAddress]);
    if (tokenAddress && tokens[tokenAddress]?.pool) {
      setPoolAddress(tokens[tokenAddress].pool);
      console.log("pool address", tokens[tokenAddress].pool);
    } else {
      setPoolAddress("");
    }
  }, [tokenAddress]);


  const { writeAsync: deploy, isMining: isPending } = useScaffoldContractWrite({
    contractName: "TrailMixManager",
    functionName: "deployTrailMix",
    args: [tokenAddress, //chosen token address
      "0x4200000000000000000000000000000000000006", //WETH address
      "0x2626664c2603336E57B271c5C0b26F421741e481",  // Uniswap V3 router
      poolAddress, //pool address
      "0x161824CA6a0c6d85188B1bf9A79674aC1d208621", // TWAP oracle
      BigInt("1"), //trail amount
      BigInt(1 as number), //granularity
      3000],
    onBlockConfirmation: (txnReceipt) => {
      console.log("📦 deployed new contract:", txnReceipt.blockHash);
      
    },
    onSuccess: () => {
      console.log("🚀 Strategy Deployed");
    },

  });

  const handleDeploy = async () => {
    console.log("pool", poolAddress)
    try {
      const deploymentResult = await deploy();
      setPhase("deposit");
    }
    catch (error) {
      console.log(error);
    }
  }



  return (

    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl">Create New</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {phase === "deploy" && ("Deploy New Strategy")}
            {phase === "deposit" && ("Deposit Funds")}
          </DialogTitle>
          <DialogDescription>
            {phase === "deploy" && ("Deploy a new trailing stop loss strategy")}
            {phase === "deposit" && ("Deposit funds to your new strategy")}
          </DialogDescription>
        </DialogHeader>


        {phase === "deploy" && (
          <div>
            <div className="grid gap-4 py-4 rounded-xl">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Token
                </Label>
                <ComboBox
                  value={tokenAddress || ''}
                  setValue={setTokenAddress}
                  frameworks={tokenOptions || []}
                />
              </div>
              <div className="bg-blue-600 text-white p-4 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Select Strategy</h3>
                <ul className="mb-4">
                  <li>Conservative (30%): Holds through large volatility</li>
                  <li>Balanced (20%): Balanced approach</li>
                  <li>Aggressive (10%): Reacts to smaller dips</li>
                </ul>
                <div className="grid grid-cols-3 gap-4 p-6">
                  <Button className={`w-full flex justify-center rounded-xl`} onClick={() => setStrategy("30")}>
                    <div className={`flex flex-col items-center p-4 bg-white text-blue-600 ${strategy === "30" ? "border-4 border-black" : "border-2 border-transparent"} rounded-xl`}>
                      <ShieldIcon className="h-6 w-6 mb-2" />
                      <div>Conservative</div>
                    </div>
                  </Button>
                  <Button className={`w-full flex justify-center rounded-xl`} onClick={() => setStrategy("20")}>
                    <div className={`flex flex-col items-center p-4 bg-white text-blue-600 ${strategy === "20" ? "border-4 border-black" : "border-2 border-transparent"} rounded-xl`}>
                      <ScaleIcon className="h-6 w-6 mb-2" />
                      <div>Balanced</div>
                    </div>
                  </Button>
                  <Button className={`w-full flex justify-center rounded-xl`} onClick={() => setStrategy("10")}>
                    <div className={`flex flex-col items-center p-4 bg-white text-blue-600 ${strategy === "10" ? "border-4 border-black" : "border-2 border-transparent"} rounded-xl`}>
                      <SwordIcon className="h-6 w-6 mb-2" />
                      <div>Aggressive</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-xl"
              onClick={handleDeploy}
              disabled={!tokenAddress}
            >
              Create
            </Button>
          </div>
        )}
        {isPending && (
          <span className="loading loading-spinner loading-sm"></span>
        )}

        {/* {phase === "deposit" && (
          <DepositContent contractAddress={deployedAddress} />
        )} */}
      </DialogContent>
    </Dialog>
  );
}
