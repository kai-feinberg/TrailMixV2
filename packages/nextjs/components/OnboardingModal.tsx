//takes in a contract address and renders relevant information
import React from "react";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";


const OnboardingModal = () => {
    const [page, setPage] = useState(0);
    const { address: userAddress } = useAccount();

    const { data: userContracts, isLoading: isLoadingContracts } = useScaffoldContractRead({
        contractName: "TrailMixManager",
        functionName: "getUserContracts",
        args: [userAddress],
    });

    // TRIGGER MODAL WHEN USER IS NEW (HAS NO CONTRACTS)
    useEffect(() => {
        if (userContracts?.length === 0 && !isLoadingContracts) {
            setPage(1);
        }
    }, [userContracts]);


    return (
        <Dialog open={page !== 0 && page <6} onOpenChange={(open) => !open && setPage(0)}>
            <DialogTrigger asChild>
                <Button onClick={() => setPage(1)} variant="outline" className="rounded-xl">tutorial</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
                <DialogHeader>
                    <DialogTitle>Hey There!</DialogTitle>
                    <DialogDescription>
                        Welcome to trailmix
                    </DialogDescription>
                </DialogHeader>
                {page === 1 && ("page1")}
                {page === 2 && ("page2")}
                {page === 3 && ("page3")}
                {page === 4 && ("page4")}
                {page === 5 && ("page5")}

                <div className="flex justify-end gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={() => setPage(page - 1)}>back</Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => setPage(page + 1)}>next</Button>
                </div>

                <div className="flex justify-center mt-4">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 rounded-full mx-1 ${page === index + 1 ? 'bg-blue-500' : 'bg-gray-400'}`}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingModal;
