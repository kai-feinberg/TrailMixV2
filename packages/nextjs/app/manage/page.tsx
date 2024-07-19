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
import useFetchTokenPrice from "~~/hooks/scaffold-eth/useFetchTokenPriceData";
import { PriceChart } from "~~/components/PriceChart"

const stratABI = strategyABI.abi;

type Props = {};
import { useAccount } from "wagmi";
import { useGlobalState } from "~~/services/store/store";
import useTokenData from "~~/hooks/scaffold-eth/useTokenData";
import { StrategyCard } from "~~/components/StrategyCard";


const getColumns = (ethPrice: number): ColumnDef<Strategy>[] => [
  {
    accessorKey: "asset",
    header: "Asset",
    cell: ({ row }: { row: any }) => {
      const price = (row.original.stablecoinAddress as string).toLowerCase() === "0x0b2c639c533813f4aa9d7837caf62653d097ff85" ? 1 * 10 ** 12 : ethPrice;

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
              <p className="">${(row.original.twapPrice * price / (10 ** 18 * 10 ** (18 - row.original.asset.decimals))).toFixed(5)} USD</p>
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

      const usdValue = row.original.balanceInUsd
      // console.log("usdValue", usdValue)
      return (
        <div className="space-y-2" >
          <p className="text-base leading-none m-[-1%]">{row.getValue("erc20Balance") as number / (10 ** row.original.asset.decimals)} {row.original.asset.symbol}</p>
          <p className="text-sm text-gray-500">
            {/* {(((row.getValue("erc20Balance") as number)*ethPrice) / ((10 ** row.original.asset.decimals) * (Number(row.original.twapPrice) as number))) < 0.01 ? "<$0.01" : (((row.getValue("erc20Balance") as number)*ethPrice) / ((10 ** row.original.asset.decimals) * (Number(row.original.twapPrice) as number))).toFixed(2)} */}
            {usdValue < 0.01 ? "<$0.01" : Number(usdValue).toFixed(2)} USD
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
      const price = (row.original.stablecoinAddress as string).toLowerCase() === "0x0b2c639c533813f4aa9d7837caf62653d097ff85" ? 1 * 10 ** 12 : ethPrice;
      return (
        <p className="">${(tslThreshold * price / (10 ** 18 * 10 ** (18 - row.original.asset.decimals))).toFixed(5)} USD</p>
      );
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }: { row: any }) => {

      const adjustedProfit = row.original.profitInUsd

      let displayProfit;
      if (Math.abs(adjustedProfit) < 0.01) {
        displayProfit = "0.01";
      } else {
        displayProfit = Number(adjustedProfit).toFixed(2); // Format to 2 decimal places
      }


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


export default function ManagePage({ }: Props) {
  const { strategies, setStrategies } = useGlobalState();
  const [activeStrats, setActiveStrats] = useState<Strategy[]>([]);
  const [claimableStrats, setClaimableStrats] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const ethPrice = useNativeCurrencyPrice();
  // const ethPrice = ();
  let columns = getColumns(ethPrice);

  // const { tokenData: td, loading: ld, error: er } = useFetchTokenPrice("optimistic-ethereum", "1711929600", "1721225041")

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
          strategy.contractState === "Uninitialized" ||
          strategy.contractState === "Active"
      );
      const claimable = strategies.filter(strategy => strategy.contractState === 'Claimable');

      setActiveStrats(active);
      setClaimableStrats(claimable);
      setIsLoading(false);
    }
  }, [connectedAccount, strategies]);


  return (
    <div className="flex flex-col gap-4 w-full px-4 ">
      <div className="flex flex-wrap justify-between gap-6">
        {activeStrats.map((strategy, index) => (
          <div key={index} className={`flex-1 min-w-[49%] max-w-[50%] ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <StrategyCard strategy={strategy} />
          </div>
        ))}
      </div>

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