/**
 * eslint-disable @next/next/no-img-element
 *
 * @format
 */

/** @format */
"use client";


import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { TokenData } from "~~/types/customTypes"; // token data type defined in customTypes.ts
import { Strategy } from "~~/types/customTypes"; // strategy type defined in customTypes.ts
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useState } from "react";
import DepositPopup from "~~/components/DepositPopup";
import WithdrawButton from "~~/components/WithdrawButton";
import StrategyDataUpdater from "~~/components/StrategyDataUpdater";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useContractRead } from "wagmi";
import strategyABI from "~~/contracts/strategyABI.json";
import ClaimsTable from "~~/components/ClaimsTable";
import exampleActiveStrategies from "~~/components/assets/exampleActiveStrategies.json";
import exampleClaimableStrategies from "~~/components/assets/exampleClaimableStrategies.json";


const stratABI = strategyABI.abi;

type Props = {};
import { useAccount } from "wagmi";
import { useGlobalState } from "~~/services/store/store";


const getColumns = (ethPrice: number): ColumnDef<Strategy>[] => [
  {
    accessorKey: "asset",
    header: "Asset",
    cell: ({ row }: { row: any }) => {
      const price = (row.original.stablecoinAddress as string).toLowerCase() === "0x0b2c639c533813f4aa9d7837caf62653d097ff85" ? 1*10**12 : ethPrice;

      return (
        <div>
          <div className="flex gap-2 items-center">
            <img
              className="h-8 w-8"
              src={row.original.asset.logoURI}
              alt="token-image"
            />

            <div className="space-y-1">
              <p className="font-semibold text-lg leading-none m-[-1px]">{(row.getValue("asset") as TokenData).name} </p>
              <p className="">${(row.original.twapPrice * price / (10 ** 18)).toFixed(5)} USD</p>
            </div>
          </div>
          {/* divide by decimals of paired asset on the network */}
        </div>
      );
    },
  },
  {
    accessorKey: "erc20Balance",
    header: "Balance",
    cell: ({ row }: { row: any }) => {

      const ercBalance = row.getValue("erc20Balance") as number;
      const assetDecimals = 10 ** row.original.asset.decimals;
      const twapPrice = Number(row.original.twapPrice);
      const price = (row.original.stablecoinAddress as string).toLowerCase() === "0x0b2c639c533813f4aa9d7837caf62653d097ff85" ? 1*10**12 : ethPrice;

      const usdValue = ((ercBalance) * price * (twapPrice)) / (assetDecimals ** 2);
      
      // console.log("usdValue", usdValue, ercBalance, twapPrice, assetDecimals, ethPrice)
      return (
        <div className="space-y-2" >
          <p className="text-base leading-none m-[-1%]">{row.getValue("erc20Balance") as number / (10 ** row.original.asset.decimals)} {row.original.asset.symbol}</p>
          <p className="text-sm text-gray-500">
            {/* {(((row.getValue("erc20Balance") as number)*ethPrice) / ((10 ** row.original.asset.decimals) * (Number(row.original.twapPrice) as number))) < 0.01 ? "<$0.01" : (((row.getValue("erc20Balance") as number)*ethPrice) / ((10 ** row.original.asset.decimals) * (Number(row.original.twapPrice) as number))).toFixed(2)} */}
            {usdValue < 0.01 ? "<$0.01" : usdValue.toFixed(2)} USD
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "trailAmount",
    header: "Strategy",
    cell: ({ row }: { row: any }) => {
      return (
        <div className="text-base">
          <p>{row.original.trailAmount}% trail</p>
        </div>
      );
    },
  },
  {
    accessorKey: "Sell Threshold",
    header: "Sell Threshold",
    cell: ({ row }: { row: any }) => {
      const tslThreshold = Number(row.original.tslThreshold);
      const price = (row.original.stablecoinAddress as string).toLowerCase() === "0x0b2c639c533813f4aa9d7837caf62653d097ff85" ? 1*10**12 : ethPrice;
      return (
        <p className="">${(tslThreshold * price / (10 ** 18)).toFixed(5)} USD</p>
      );
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }: { row: any }) => {
      const price = (row.original.stablecoinAddress as string).toLowerCase() === "0x0b2c639c533813f4aa9d7837caf62653d097ff85" ? 1*10**12 : ethPrice;

      const divisor = 10 ** row.original.asset.decimals;
      const adjustedProfit = Number(row.original.profit)*price / divisor;

      let displayProfit;
      if (Math.abs(adjustedProfit) < 0.01) {
        displayProfit = "0.01";
      } else {
        displayProfit = adjustedProfit.toFixed(2); // Format to 2 decimal places
      }

      // console.log("profit", row.original.profit, "adjusted profit", adjustedProfit)

      return (
        <div className="text-base">
          <p style={{ color: Number(row.original.profit) >= 0 ? 'green' : 'red' }}>
            {Number(row.original.profit) >= 0 ? `+$${displayProfit}` : `-$${Math.abs(Number(displayProfit))}`}
            {/* / {Number(row.original.percentProfit) > 0 ? `+${row.original.percentProfit.substring(0, 4)}` : row.original.percentProfit.substring(0, 5)}% */}

          </p>
        </div>
      );
    }
  },
  // {
  //   accessorKey: "percentProfit",
  //   header: "Profit %",
  //   cell: ({ row }: { row: any }) => {

  //     const exitPrice = row.original.exitPrice;
  //     const entryPrice = row.original.weightedEntryPrice;
  //     let percentProfit;

  //     if (exitPrice != 0) {
  //       percentProfit = (exitPrice - entryPrice) / entryPrice
  //     }
  //     else{
  //       percentProfit = (row.original.twapPrice - entryPrice) / entryPrice
  //     }
  //     console.log("pp", exitPrice, " ",entryPrice)

  //     return (
  //       <div className="text-base">
  //         <p style={{ color: Number(percentProfit) > 0 ? 'green' : 'red' }}>
  //           {Number(percentProfit) > 0 ? `+${percentProfit.toString().substring(0, 4)}` : percentProfit.toString().substring(0, 5)}%
  //         </p>
  //       </div>
  //     );
  //   },
  // },

  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }: { row: any }) => {
      return (
        <div className="flex gap-2">
          <DepositPopup contractAddress={row.original.contractAddress} />
          <WithdrawButton contractAddress={row.original.contractAddress} />
          <Button variant="outline" className="h-3 w-2 rounded-xl" onClick={() => window.open(`https://optimistic.etherscan.io//address/${row.original.contractAddress}`, '_blank')}>i</Button>
        </div>
      );
    }
  }
];



// export default function ManagePage({ }: Props) {
//   // const [strategies, setStrategies] = useState<Strategy[]>([]);
//   const { strategies, setStrategies } = useGlobalState();
//   const [activeStrats, setActiveStrats] = useState<Strategy[]>([])

//   const ethPrice = useNativeCurrencyPrice();
//   let columns = getColumns(ethPrice);


//   const { address: connectedAccount } = useAccount();
//   const { data: userContracts } = useScaffoldContractRead({
//     contractName: "TrailMixManager",
//     functionName: "getUserContracts",
//     args: [connectedAccount],
//   });
//   // console.log("user contracts", userContracts)

//   let claimableStrategies = strategies.filter(strategy => strategy.contractState === 'Claimable');

//   let activeStrategies = strategies.filter(strategy => strategy.contractState === 'Uninitialized' || strategy.contractState === 'Active');

//   useEffect(() => {
//     const active = strategies.filter(
//       (strategy) =>
//         strategy.contractState === "Uninitialized" ||
//         strategy.contractState === "Active"
//     );
//     setActiveStrats(active);
//   }, [strategies]);
  


//   const updateStrategyData = (strategy: Strategy) => {
//     const existingStrategyIndex = strategies.findIndex(s => s.contractAddress === strategy.contractAddress);
//     if (existingStrategyIndex !== -1) {
//       const updatedStrategies = [...strategies];
//       updatedStrategies[existingStrategyIndex] = strategy;
//       setStrategies(updatedStrategies);

//     } else {
//       setStrategies([...strategies, strategy]);
//     }
//   }

//   // console.log("claimable strats:", claimableStrategies);
//   // console.log("active strats: ", activeStrategies);

//   if (!connectedAccount) {
//     console.log("no connected account");
//     activeStrategies = exampleActiveStrategies;
//     claimableStrategies = exampleClaimableStrategies;
//   }

//   return (
//     <div className="flex flex-col gap-4 w-full px-4 ">

//       {userContracts?.map((address, index) => (
//         <StrategyDataUpdater
//           key={address}
//           contractAddress={address}
//           onDataFetched={updateStrategyData}
//         />
//       ))}

//       <PageTitle title={connectedAccount && "Your Strategies" || "Example Strategies"} />
//       <DataTable columns={columns} data={activeStrats} />
//       <ClaimsTable claimableStrategies={claimableStrategies} />
//     </div>
//   );
// }

export default function ManagePage({ }: Props) {
  const { strategies, setStrategies } = useGlobalState();
  const [activeStrats, setActiveStrats] = useState<Strategy[]>([]);
  const [claimableStrats, setClaimableStrats] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ethPrice = useNativeCurrencyPrice();
  let columns = getColumns(ethPrice);

  const { address: connectedAccount } = useAccount();
  const { data: userContracts } = useScaffoldContractRead({
    contractName: "TrailMixManager",
    functionName: "getUserContracts",
    args: [connectedAccount],
  });

  useEffect(() => {
    if (!connectedAccount) {
      setActiveStrats(exampleActiveStrategies);
      setClaimableStrats(exampleClaimableStrategies);
      setIsLoading(false);
    } else {
      const active = strategies.filter(
        (strategy) =>
          // strategy.contractState === "Uninitialized" || hiding uninitilized strategies 
          strategy.contractState === "Active"
      );
      const claimable = strategies.filter(strategy => strategy.contractState === 'Claimable');
      
      setActiveStrats(active);
      setClaimableStrats(claimable);
      setIsLoading(false);
    }
  }, [connectedAccount, strategies]);

const updateStrategyData = (strategy: Strategy) => {
  setStrategies((prevStrategies: Strategy[] | undefined) => {
    // Ensure prevStrategies is an array
    const currentStrategies = Array.isArray(prevStrategies) ? prevStrategies : [];

    const existingStrategyIndex = currentStrategies.findIndex(
      (s) => s.contractAddress === strategy.contractAddress
    );

    if (existingStrategyIndex !== -1) {
      // Update existing strategy
      return currentStrategies.map((s, index) => 
        index === existingStrategyIndex ? strategy : s
      );
    } else {
      // Add new strategy
      return [...currentStrategies, strategy];
    }
  });
};

  return (
    <div className="flex flex-col gap-4 w-full px-4 ">
      {userContracts?.map((address) => (
        <StrategyDataUpdater
          key={address}
          contractAddress={address}
          onDataFetched={updateStrategyData}
        />
      ))}

      <PageTitle title={connectedAccount ? "Your Strategies" : "Example Strategies"} />
      
      {isLoading ? (
        <p>Loading strategies...</p>
      ) : (
        <>
          <DataTable columns={columns} data={activeStrats} />
          <ClaimsTable claimableStrategies={claimableStrats} />
        </>
      )}
    </div>
  );
}