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
import { XSquare, Pencil } from "lucide-react";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import PageTitle from "@/components/PageTitle";
import { TokenData } from "~~/types/customTypes"; // token data type defined in customTypes.ts
import { Strategy } from "~~/types/customTypes"; // strategy type defined in customTypes.ts
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import fetchStrategyData from "~~/hooks/scaffold-eth/fetchStrategyData";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import DepositPopup from "~~/components/DepositPopup";
import WithdrawButton from "~~/components/WithdrawButton";
import StrategyProfitUpdater from "~~/components/StrategyProfitUpdater";

type Props = {};
import { useAccount } from "wagmi";


const columns: ColumnDef<Strategy>[] = [
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
              <p className="">${row.original.twapPrice as number / ((10 ** (6)))}</p>
            </div>
          </div>
          {/* divide by decimals of USDC on the network */}
        </div>
      );
    },
  },
  {
    accessorKey: "erc20Balance",
    header: "Balance",
    cell: ({ row }) => {

      return (
        <div className="space-y-2" >
          <p className="text-base leading-none m-[-1%]">{row.getValue("erc20Balance") as number / (10 ** row.original.asset.decimals)} {row.original.asset.extensions.opTokenId}</p>
          <p className="text-sm text-gray-500">
            {((row.getValue("erc20Balance") as number) / ((10 ** row.original.asset.decimals) * (Number(row.original.twapPrice) as number))) < 0.01 ? "<$0.01" : ((row.getValue("erc20Balance") as number) / ((10 ** row.original.asset.decimals) * (Number(row.original.twapPrice) as number))).toFixed(2)}
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
          </p>
        </div>
      );
    }
  },
  {
    accessorKey: "percentProfit",
    header: "Profit %",
    cell: ({ row }) => {
      return (
        <div className="text-base">
          <p style={{ color: Number(row.original.percentProfit) > 0 ? 'green' : 'red' }}>
            {Number(row.original.percentProfit) > 0 ? `+${row.original.percentProfit.substring(0, 4)}` : row.original.percentProfit.substring(0, 5)}%
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <DepositPopup contractAddress={row.original.contractAddress} />
          <WithdrawButton contractAddress={row.original.contractAddress} />
        </div>
      );
    },
  },
];


export default function UsersPage({ }: Props) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [profits, setProfits] = useState<string[]>([]);

  const { address: connectedAccount } = useAccount();
  const { data: userContracts } = useScaffoldContractRead({
    contractName: "TrailMixManager",
    functionName: "getUserContracts",
    args: [connectedAccount],
  });
  const { targetNetwork } = useTargetNetwork();

  useEffect(() => {
    const fetchStrategies = async () => {
      const fetchedStrategies = await fetchStrategyData(userContracts as string[], targetNetwork);
      setStrategies(fetchedStrategies);
      setLoading(false);
    };

    fetchStrategies();
  }, [userContracts]); // Depend on userContracts to refetch when it changes

  // Function to update profit for a given index
  const updateProfit = (index: number, profit: string, weightedEntryCost: string, percentProfit: string) => {
    // console.log("updating profit", index, profit);
    setStrategies(currentStrategies => {
      return currentStrategies.map((strategy, i) =>
        i === index ? { ...strategy, profit, weightedEntryCost, percentProfit } : strategy
      );
    });
    // console.log(strategies)
  };


  return (
    <div className="flex flex-col gap-4 w-full px-4 ">

      {userContracts?.map((address, index) => (
        <StrategyProfitUpdater
          key={address}
          contractAddress={address}
          index={index}
          onProfitFetched={updateProfit}
        />
      ))}

      <PageTitle title="Your Strategies" />
      <DataTable columns={columns} data={strategies} />
    </div>
  );
}

