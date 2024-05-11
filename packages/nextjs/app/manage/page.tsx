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
import useStrategyData from "~~/hooks/scaffold-eth/useStrategyData";
import { useContractRead } from "wagmi";
import fetchStrategyData from "~~/hooks/scaffold-eth/getStrategyData";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import DepositPopup from "~~/components/DepositPopup";
import WithdrawButton from "~~/components/WithdrawButton";

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
            <p>{(row.getValue("asset") as TokenData).name} </p>
          </div>
          <p>${row.original.twapPrice as number / ((10 ** (6)))}</p>
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
        <div className="flex flex-col h-full">
          <div className="flex items-center font-semibold leading-snug text-lg flex-grow-3">
            <p>{row.getValue("erc20Balance") as number / (10 ** row.original.asset.decimals)} {row.original.asset.extensions.opTokenId}</p>
          </div>
          <div className="flex flex-col flex-grow-1">
            <p className="text-xs text-gray-500">
              {((row.getValue("erc20Balance") as number) / ((10 ** row.original.asset.decimals) * (Number(row.original.twapPrice) as number))) < 0.01 ? "<$0.01" : ((row.getValue("erc20Balance") as number) / ((10 ** row.original.asset.decimals) * (Number(row.original.twapPrice) as number))).toFixed(2)}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "trailAmount",
    header: "Strategy",
    cell: ({ row }) => {
      return (
        <div>
          <p>{row.original.trailAmount}% trail</p>
        </div>
      );
    },
  },

  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {
      return (
        <div className="text-md">
          <p style={{ color: Number(row.original.profit) >= 0 ? 'green' : 'red' }}>
            {Number(row.original.profit) >= 0 ? `+$${row.original.profit}` : `-$${Math.abs(Number(row.original.profit))}`}
          </p>
        </div>
      );
    }
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

  return (
    <div className="flex flex-col gap-5 w-full">

      <PageTitle title="Your Strategies" />
      <DataTable columns={columns} data={strategies} />
    </div>
  );
}

