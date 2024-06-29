/**
 * eslint-disable @next/next/no-img-element
 *
 * @format
 */

/** @format */
"use client";


import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import PageTitle from "@/components/PageTitle";
import { TokenData } from "~~/types/customTypes"; // token data type defined in customTypes.ts
import { Strategy } from "~~/types/customTypes"; // strategy type defined in customTypes.ts

import WithdrawButton from "~~/components/WithdrawButton";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useContractRead } from "wagmi";
import strategyABI from "~~/contracts/strategyABI.json";


const stratABI = strategyABI.abi;


const getColumns = (ethPrice: number): ColumnDef<Strategy>[] => [
  {
    accessorKey: "asset",
    header: "Asset",
    cell: ({ row }: { row: any }) => {
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
              <p className="">${(row.original.twapPrice * ethPrice / (10 ** 18)).toFixed(5)} USD</p>
            </div>
          </div>
          {/* divide by decimals of paired asset on the network */}
        </div>
      );
    },
  },
  {
    accessorKey: "stablecoinBalance",
    header: "Balance",
    cell: ({ row }) => {

      const ercBalance = row.getValue("stablecoinBalance") as number;
      const assetDecimals = 10 ** row.original.stableAsset.decimals;

      const usdValue = ((ercBalance) * ethPrice)/(assetDecimals);
      // console.log("usdValue", usdValue, ercBalance, twapPrice, assetDecimals, ethPrice)
      return (
        <div className="space-y-2" >
          <p className="text-base leading-none m-[-1%]">{(row.getValue("stablecoinBalance") as number / (10 ** row.original.stableAsset.decimals)).toFixed(10)} {row.original.stableAsset.symbol}</p>
          <p className="text-sm text-gray-500">
            {usdValue < 0.01 ? "<$0.01" : usdValue.toFixed(2)} USD
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "trailAmount",
    header: "Strategy",
    cell: ({ row }) => {
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
    cell: ({ row }) => {
      const tslThreshold = Number(row.original.tslThreshold);
      const price = Number(ethPrice);
      return (
          <p className="">${(tslThreshold * price / (10 ** 18)).toFixed(5)} USD</p>
      );
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {

      const divisor = 10 ** 6 * 10 ** row.original.asset.decimals;
      const adjustedProfit = Number(row.original.profit) / divisor;

      let displayProfit;
      if (Math.abs(adjustedProfit) < 0.01) {
        displayProfit = "0.01";
      } else {
        displayProfit = adjustedProfit.toFixed(2); // Format to 2 decimal places
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
  //   cell: ({ row }) => {
  //     return (
  //       <div className="text-base">
  //         <p style={{ color: Number(row.original.percentProfit) > 0 ? 'green' : 'red' }}>
  //           {Number(row.original.percentProfit) > 0 ? `+${row.original.percentProfit.substring(0, 4)}` : row.original.percentProfit.substring(0, 5)}%
  //         </p>
  //       </div>
  //     );
  //   },
  // },
 
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <WithdrawButton contractAddress={row.original.contractAddress} buttonContent={"claim!"}/>
        </div>
      );
    },
  },
];



export default function ClaimsTable({ claimableStrategies }: { claimableStrategies: Strategy[] }) {
  const ethPrice = useNativeCurrencyPrice();
  const columns = getColumns(ethPrice);

  return (
    <div className="flex flex-col gap-4 w-full px-4 ">
      <PageTitle title="Completed strategies" />
      <DataTable columns={columns} data={claimableStrategies} />
    </div>
  );
}