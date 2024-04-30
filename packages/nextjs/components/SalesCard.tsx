/* eslint-disable @next/next/no-img-element */
/**
 * eslint-disable @next/next/no-img-element
 *
 * @format
 */

/** @format */

import React from "react";
import {LucideIcon} from "lucide-react";

export type SalesProps = {
  name: string;
  email: string;
  saleAmount: string;
  icon: LucideIcon;
};

export default function SalesCard(props: SalesProps) {
  return (
    <div className="  flex flex-wrap justify-between gap-3 ">
      <section className="flex justify-between gap-3 ">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 p-1">
          <props.icon className="text-black"/>
        </div>
        <div className="text-sm">
            <p>{props.name}</p>
            <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[120px]  sm:w-auto  text-gray-400">
                {props.email}
            </div>
        </div>
      </section>
        <p>{props.saleAmount}</p>
    </div>
  );
}
