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

type Props = {};
type Payment = {
  asset: string;
  balance: string;
  actions: string;
  strategy: string;
  entryPrice: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "asset",
    header: "Asset",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <img
            className="h-8 w-8"
            src={`/${row.getValue("asset")}-logo.svg`}
            alt="user-image"
          />
          <p>{row.getValue("asset")} </p>
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      return (
        <div>
          <div className="flex gap-2 items-center font-semibold">
            <p>{row.getValue("balance")}</p>
          </div>
          <div className="flex flex-col gap-2">
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

const data: Payment[] = [
  {
    asset: "Arbitrum",
    balance: "436.23",
    actions: "2023-01-01",
    strategy: "Tight ",
    entryPrice: "$1000",
  },
  {
    asset: "Optimism",
    balance: "12.34",
    actions: "2023-02-15",
    strategy: "Loose ",
    entryPrice: "$2000",
  },
  {
    asset: "Ethereum",
    balance: "0.124",
    actions: "2023-03-20",
    strategy: "Loose ",
    entryPrice: "$3000",
  },
  {
    asset: "Bitcoin",
    balance: "0.00023",
    actions: "2023-04-10",
    strategy: "Custom ",
    entryPrice: "$4000",
  },
  {
    asset: "Ethereum",
    balance: "0.00456",
    actions: "2023-05-05",
    strategy: "Tight ",
    entryPrice: "$5000",
  },
  {
    asset: "Optimism",
    balance: "48.91",
    actions: "2023-06-18",
    strategy: "Loose ",
    entryPrice: "$6000",
  },
  
];

export default function UsersPage({}: Props) {
  return (
    <div className="flex flex-col gap-5  w-full">
      <PageTitle title="Users" />
      <DataTable columns={columns} data={data} />
    </div>
  );
}
