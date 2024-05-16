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
import { ArrowDownFromLineIcon } from "lucide-react";

import { Button } from "@/components/ui/button";


const OnboardingModal = () => {
    const [page, setPage] = useState(1);

    return (

        <Dialog open={page != 0} onOpenChange={(open) => !open && setPage(0)}>
            <DialogTrigger asChild >
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white" >
                <DialogHeader>
                    <DialogTitle>Hey There!</DialogTitle>
                    <DialogDescription>
                        Welcome to trailmix
                    </DialogDescription>
                </DialogHeader>
                {page === 1 && ("page1")}
                {page === 2 && ("page2")}
                <Button variant="outline" onClick={() => setPage(page + 1)}>next </Button>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingModal;
