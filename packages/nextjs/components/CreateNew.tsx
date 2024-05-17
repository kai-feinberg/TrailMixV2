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
import { ShieldIcon, ScaleIcon, SwordIcon } from "lucide-react";
import DepositPopup from "./DepositPopup";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { IntegerInput } from "./scaffold-eth";

import manABI from "~~/contracts/managerABI.json";
import DepositContent from "./DepositContent";

const managerABI = manABI.abi;
const provider = new ethers.providers.InfuraProvider("optimism", process.env.INFURA_API_KEY);


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
  const [deployedAddress, setDeployedAddress] = React.useState("0x9c5adcf23b29cF9a98f78CD934A6Ecd9e8Ac44A9");

  const [phase, setPhase] = React.useState("deploy");

  const { targetNetwork } = useTargetNetwork();
  const chainId = targetNetwork?.id;

  const tokens = (tokenList as TokenList)[chainId];

  const { address: connectedAddress } = useAccount();
  const managerContract = new ethers.Contract("0xc20650A1d0bB00Ea255C2cFabD094d0234ED26F1", managerABI, provider)

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
    if (tokenAddress && tokens[tokenAddress]?.pool) {
      setPoolAddress(tokens[tokenAddress].pool);
      console.log(tokens[tokenAddress].pool);
    } else {
      setPoolAddress("");
    }
  }, [tokenAddress]);


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
      setPhase("deposit");

      const userContractsResult = await managerContract.getUserContracts(connectedAddress);
      if (userContractsResult && userContractsResult.length > 0) {
        setDeployedAddress(userContractsResult[userContractsResult.length - 1]);
        console.log("deposit funds to", userContractsResult[userContractsResult.length - 1]);
      } else {
        setDeployedAddress("error");
        console.log("No user contracts found");
      }

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
              <div className="bg-blue-600 text-white p-4 rounded-lg">
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
            <Button type="submit" variant="outline" className="w-full" onClick={handleDeploy}>Create</Button>

          </div>
        )}
        {isPending && (
          <span className="loading loading-spinner loading-sm"></span>
        )}

        {phase === "deposit" && (
            <DepositContent contractAddress={deployedAddress} />
        )}
      </DialogContent>
    </Dialog>
  );
}
