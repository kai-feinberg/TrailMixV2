"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DollarSign, Users, CreditCard, Activity, ArrowUp, ArrowLeftRight, ArrowDown } from "lucide-react";
import Strategy from "~~/components/Strategy";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import DeployNew from "~~/components/DeployNew";
import Events from "~~/components/Events";
import Card, {CardContent, CardProps} from "@/components/Card";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { data: userContracts } = useScaffoldContractRead({
    contractName: "TrailMixManager",
    functionName: "getUserContracts",
    args: [connectedAddress],
  });
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

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <DeployNew />

          <Events userAddress={connectedAddress || ""} />

          {userContracts &&
            [...userContracts].reverse().map((contractAddress: string) => (
              <Strategy key={contractAddress} contractAddress={contractAddress} userAddress={connectedAddress || ""} />
            ))}
        </div>

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

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <p> test</p>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
