import React from "react";
import { useEffect, useState } from "react";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import EventCard from "./EventCard";
import { ArrowDown, ArrowLeftRight, ArrowUp } from "lucide-react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import {TokenList} from "~~/types/customTypes";
import tokenList from "~~/lib/tokenList.json";

//load events from the contract
//aggregate into one array and reverse sort by timestamp
//display info for the most recent events
const Events = () => {
    const { address: userAddress } = useAccount();
    const [events, setEvents] = useState<any[]>([]);
    const {targetNetwork} = useTargetNetwork();
    const tokenData = (tokenList as TokenList)[targetNetwork.id];

    const {
        data: deployments,
        isLoading: isLoadingDeployments,
    } = useScaffoldEventHistory({
        contractName: "TrailMixManager",
        eventName: "ContractDeployed",
        fromBlock: 119000002n,
        watch: false,
        filters: { creator: userAddress },
        blockData: true,
        transactionData: true,
        receiptData: true,
    });

    const {
        data: deposits,
        isLoading: isLoadingDeposits,
    } = useScaffoldEventHistory({
        contractName: "TrailMixManager",
        eventName: "FundsDeposited",
        fromBlock: 119000002n,
        watch: false,
        filters: { creator: userAddress },
        blockData: true,
        transactionData: true,
        receiptData: true,
    });

    const {
        data: withdrawals,
        isLoading: isLoadingWithdrawals,
    } = useScaffoldEventHistory({
        contractName: "TrailMixManager",
        eventName: "FundsWithdrawn",
        fromBlock: 119000002n,
        watch: false,
        filters: { creator: userAddress },
        blockData: true,
        transactionData: true,
        receiptData: true,
    });

    const {
        data: swaps,
        isLoading: isLoadingSwaps,
    } = useScaffoldEventHistory({
        contractName: "TrailMixManager",
        eventName: "SwapExecuted",
        fromBlock: 119000002n,
        watch: false,
        filters: { creator: userAddress },
        blockData: true,
        transactionData: true,
        receiptData: true,
    });


    //only render events when events change
    useEffect(() => {
        if (!isLoadingDeployments && deployments && !isLoadingDeposits && deposits && !isLoadingWithdrawals && withdrawals && !isLoadingSwaps && swaps) {
            const sorted_events = [...deployments, ...deposits, ...withdrawals, ...swaps].sort((a, b) => Number(b.block.timestamp) - Number(a.block.timestamp));
            setEvents(sorted_events);
        }
    }, [deployments, deposits, swaps, withdrawals]);

    console.log(events);

    return (
        <div>
            {events && events.slice(0, 5).map((event, index) => (
                <div key={index} className="mb-2">
                    {event.log.eventName === "FundsWithdrawn" && (
                        <EventCard
                            title="Funds Withdrawn"
                            detail={`Withdrawn by ${event.log.args.creator}`}
                            amount={`${event.log.args.amount} ETH`}
                            icon={ArrowUp}
                            date={new Date(Number(event.block.timestamp) * 1000).toLocaleDateString("en-US")}
                            color= "red"
                        />
                    )}

                    {event.log.eventName === "SwapExecuted" && (
                        <EventCard
                            title="Swap Executed"
                            detail={`Swapped by ${event.log.args.creator}`}
                            amount={`${event.log.args.amountIn} for ${event.log.args.amountOut}`}
                            icon={ArrowLeftRight}
                            date={new Date(Number(event.block.timestamp) * 1000).toLocaleDateString("en-US")}
                            color = "blue"
                        />
                    )}
                    {event.log.eventName === "FundsDeposited" && (
                        <EventCard
                            title="Deposit Made"
                            detail={`Deposited to ${event.log.args.strategy.slice(0, 6)}...${event.log.args.strategy.slice(-4)}`}
                            amount={`${(Number(event.log.args.amount)/ (10**Number(tokenData[event.log.args.token].decimals)))} ${tokenData[event.log.args.token].symbol}`}
                            icon={ArrowDown}
                            date={new Date(Number(event.block.timestamp) * 1000).toLocaleDateString("en-US")}
                            color = "green"
                        />
                    )}

                </div>

            ))}

            <br />
        </div>
    );
}

export default Events;
