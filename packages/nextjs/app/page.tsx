/** @format */
"use client";

import PageTitle from "@/components/PageTitle";
import dynamic from "next/dynamic";
import Image from "next/image";
import { DollarSign, Users, CreditCard, TrendingUp, ArrowUp, ArrowLeftRight, ArrowDown } from "lucide-react";
import Card, { CardContent, CardProps } from "@/components/Card";
import BarChart from "@/components/LineChart";
import {Button} from "@/components/ui/button";
import EventCard, { EventProps } from "~~/components/EventCard";
import {CreateNew} from "@/components/CreateNew";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import {useState, useEffect} from "react";
import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import Deposit from "~~/components/DepositPopup";
import { useAccount } from "wagmi";
import { useScaffoldContractRead} from "~~/hooks/scaffold-eth";
import Events from "~~/components/Events";
import {useEnsName} from "wagmi";
import {Badge} from "~~/components/ui/badge";

import ercABI from "~~/contracts/erc20ABI.json";
const erc20ABI = ercABI.abi;

import stratABI from "~~/contracts/strategyABI.json";
import OnboardingModal from "~~/components/OnboardingModal";
const strategyABI = stratABI.abi;


const cardData: CardProps[] = [
  {
    label: "Current Balance",
    amount: "$45,231.89",
    description: "+20.1% from last month",
    icon: DollarSign
  },
  {
    label: "Active strategies",
    amount: "12",
    description: "across 5 assets",
    icon: Users
  },
  {
    label: "Pending claims",
    amount: "$1,415.26",
    description: "4 closed strategies",
    icon: CreditCard
  },
  {
    label: "All time profit",
    amount: "$573",
    description: "+$201 since last month",
    icon: TrendingUp
  }
];



export default function Home() {

  const { targetNetwork } = useTargetNetwork();
  const { address: connectedAddress } = useAccount();
  const [ens, setEns] = useState<string | null>();
  
  // const checkSumAddress = address ? getAddress(address) : undefined;

  const { data: fetchedEns } = useEnsName({
    address: connectedAddress,
    // enabled: isAddress(checkSumAddress ?? ""),
    chainId: 1,
  });
  // console.log("ens",fetchedEns);

  useEffect(() => {
    setEns(fetchedEns);
  }, [fetchedEns]);
  
  const { data: userContracts } = useScaffoldContractRead({
    contractName: "TrailMixManager",
    functionName: "getUserContracts",
    args: [connectedAddress],
  });

  
const pageTitle = ens ? `Welcome ${ens}` : connectedAddress ? `Welcome ${connectedAddress?.slice(0, 6)}...${connectedAddress?.slice(-4)}`: "Welcome example_user";
  return (
    <div className="flex flex-col gap-5 w-full">
        <PageTitle title={pageTitle} />
      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
      <OnboardingModal />

        {cardData.map((d, i) => (
          <Card
            key={i}
            amount={d.amount}
            description={d.description}
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
            <Events/>
        </CardContent>

      </section>
    </div>
  );
}