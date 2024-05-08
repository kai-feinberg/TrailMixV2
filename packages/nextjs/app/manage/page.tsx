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
import {XSquare,Pencil } from "lucide-react";
import React from "react";
import PageTitle from "@/components/PageTitle";
import { TokenData } from "~~/types/customTypes"; // token data type defined in customTypes.ts
import { Strategy } from "~~/types/customTypes"; // strategy type defined in customTypes.ts
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
type Props = {};


const columns: ColumnDef<Strategy>[] = [
  {
    accessorKey: "asset",
    header: "Asset",
    cell: ({ row }: { row: any }) => {
      return (
        <div className="flex gap-2 items-center">
          <img
            className="h-8 w-8"
            src={row.original.asset.logoURI}
            alt="token-image"
          />
          <p>{(row.getValue("asset") as TokenData).name} </p>
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center font-semibold leading-snug text-lg flex-grow-3">
            <p>{row.getValue("balance")}</p>
          </div>
          <div className="flex flex-col flex-grow-1">
            <p className="text-xs text-gray-500">$32.31</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "strategy",
    header: "Strategy",
  },

  {
    accessorKey: "entryPrice",
    header: "Entry Price",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
      <div className="flex gap-2">
        <Button variant= "outline" size= "icon">
          <Pencil className="h-4 w-4"/>
        </Button>
        <Button variant="outline" size= "icon">
          <XSquare className="h-4 w-4"/>
        </Button>
      </div>
      );
    },
  },
];

const data: Strategy[] = [
  // {
  //   asset: "Arbitrum",
  //   balance: "436.23",
  //   actions: "2023-01-01",
  //   strategy: "Tight ",
  //   entryPrice: "$1000",
  //   image: "https://ethereum-optimism.github.io/data/0xBTC/logo.png",
  // }
];

const userStrategies = useScaffoldContractRead({
  contractName: "TrailMixManager",
  functionName: "getUserContracts",
  args: [],
});


export default function UsersPage({}: Props) {
  return (
    <div className="flex flex-col gap-5  w-full">
      <PageTitle title="Your Strategies" />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
