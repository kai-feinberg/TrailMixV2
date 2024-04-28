import React from "react";
import { useEffect } from "react";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

//load events from the contract
//aggregate into one array and reverse sort by timestamp
//display info for the most recent events
const Events = ({ userAddress }: { userAddress: string }) => {
    const {
        data: events,
        isLoading: isLoadingEvents,
        error: errorReadingEvents,
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

    //only render events when events change
    useEffect(() => {
        if (!isLoadingEvents && events) {
            console.log("Events:", events);
            events.forEach((e) => {
                console.log("timestamp", e.block.timestamp);
                console.log("contract address", e.log.args.contractAddress);
            });
        }
    }, [events]);


    return (
        <div>
            <p> Recent Events</p>
            {events && events.map((event, index) => (
                <div key={index}>
                    <p>Event info</p>
                    <p>Timestamp: {event.block.timestamp.toString()}</p>
                    <p>Contract Address: {event.log.args.contractAddress}</p>
                </div>)
            )}
            <br />
        </div>
    );
}

export default Events;
