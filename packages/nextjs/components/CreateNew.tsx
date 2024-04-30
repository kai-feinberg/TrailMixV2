"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ComboBox";

export function CreateNew() {
  const [token, setToken] = React.useState("");
  const [strategy, setStrategy] = React.useState("basic");
  const [depositAmount, setDepositAmount] = React.useState("");

  const tokenOptions = [
    {
      value: "ethereum",
      label: "Ethereum",
    },
    {
      value: "arbitrum",
      label: "Arbitrum",
    },
    {
      value: "optimism",
      label: "Optimism",
    },
    {
      value: "bitcoin",
      label: "Bitcoin",
    },
  ];
  const strategyOptions = [
    {
      value: "basic",
      label: "Basic (15% trail)",
    },
    {
      value: "tight",
      label: "Tight (5% trail)",
    },
    {
      value: "loose",
      label: "Loose (30% trail)",
    },
  ];

  const handleCreateNew = () => {
    console.log('token', token);
    console.log('strategy', strategy);
    console.log('depositAmount', depositAmount);
    // Add your action here
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create New</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
          <DialogDescription>
            Deploy a new trailing stop loss strategy
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Token
            </Label>
            <ComboBox
              value={token}
              setValue={setToken}
              frameworks={tokenOptions}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Strategy
            </Label>
            <ComboBox
              value={strategy}
              setValue={setStrategy}
              frameworks={strategyOptions}
            />
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Deposit Amount
            </Label>
            <Input
              id="depositAmount"
              defaultValue="0.00"
              className="col-span-3"
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="w-full">
            <Button type="submit" className="w-full bg-black" onClick={handleCreateNew}>Create</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
