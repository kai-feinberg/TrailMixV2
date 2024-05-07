/** @format */
"use client";

import PageTitle from "@/components/PageTitle";
import dynamic from "next/dynamic";
import Image from "next/image";
import { DollarSign, Users, CreditCard, Activity, ArrowUp, ArrowLeftRight, ArrowDown } from "lucide-react";
import Card, { CardContent, CardProps } from "@/components/Card";
import BarChart from "@/components/LineChart";
import {Button} from "@/components/ui/button";
import SalesCard, { SalesProps } from "@/components/SalesCard";
import {CreateNew} from "@/components/CreateNew";
import { use } from "react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import {useState, useEffect} from "react";

const cardData: CardProps[] = [
  {
    label: "Current Balance",
    amount: "$45,231.89",
    discription: "+20.1% from last month",
    icon: DollarSign
  },
  {
    label: "Active strategies",
    amount: "12",
    discription: "across 5 assets",
    icon: Users
  },
  {
    label: "Pending claims",
    amount: "$1,415.26",
    discription: "4 closed strategies",
    icon: CreditCard
  },
  {
    label: "All time profit",
    amount: "$573",
    discription: "+$201 since last month",
    icon: Activity
  }
];

const uesrSalesData: SalesProps[] = [
  {
    name: "Deposited 15 $OP",
    email: "strategy: basic (15%)",
    saleAmount: "+$1,999.00",
    icon: ArrowDown
  },
  {
    name: "Sold 12.4 $ARB at price $2.41",
    email: "strategy: basic (15%)",
    saleAmount: "claim",
    icon: ArrowLeftRight
  },
  {
    name: "Withdrew 0.5 ETH",
    email: "strategy : basic (15%)",
    saleAmount: "-$39.00",
    icon: ArrowUp
  },
  {
    name: "Sold 12.4 $ARB at price $2.41",
    email: "strategy: basic (15%)",
    saleAmount: "claim",
    icon: ArrowLeftRight
  },
  {
    name: "Withdrew 0.5 ETH",
    email: "strategy : basic (15%)",
    saleAmount: "-$39.00",
    icon: ArrowUp
  },
  
];


export default function Home() {

  const { targetNetwork } = useTargetNetwork();
  // console.log(targetNetwork);

  // const test = getTokenData("0xb6ed7644c69416d67b522e20bc294a9a9b405b31");
  // console.log(test);

  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitle title="Dashboard" />
      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map((d, i) => (
          <Card
            key={i}
            amount={d.amount}
            discription={d.discription}
            icon={d.icon}
            label={d.label}
          />
        ))}
      </section>
      <section className="grid grid-cols-1  gap-4 transition-all lg:grid-cols-2">
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="p-4 text-2xl">Overview</p>
            <CreateNew />
          </div>
          <BarChart />
        </CardContent>
        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Transaction history</p>
            <p className="text-sm text-gray-400">
              You made 5 transactions this month.
            </p>
          </section>
          {uesrSalesData.map((d, i) => (
            <SalesCard
              key={i}
              email={d.email}
              name={d.name}
              saleAmount={d.saleAmount}
              icon={d.icon}
            />
          ))}
        </CardContent>

      </section>
    </div>
  );
}