/** @format */
"use client";

import { useState } from "react";
import { Nav } from "./ui/nav";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import OnboardingContent from "./OnboardingContent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {};

import {
  ClipboardPenLine,
  LayoutDashboard,
  UsersRound,
  Settings,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/button";

// import { useWindowWidth } from "@react-hook/window-size";
let useWindowWidth: any;
if (typeof window !== "undefined") {
  useWindowWidth = require("@react-hook/window-size").useWindowWidth;
}

export default function SideNavbar({ }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onlyWidth = useWindowWidth();
  const mobileWidth = onlyWidth < 768;

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className="relative min-w-[80px] border-r px-3  pb-10 pt-24 bg-white">
      {!mobileWidth && (
        <div className="absolute right-[-20px] top-7">
          <Button
            onClick={toggleSidebar}
            variant="secondary"
            className=" rounded-full p-2"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
      <Nav
        isCollapsed={mobileWidth ? true : isCollapsed}

        links={[
          {
            title: "Dashboard",
            href: "/",
            icon: LayoutDashboard,
            variant: "default"
          },

          {
            title: "Manage",
            href: "/manage",
            icon: ClipboardPenLine,
            variant: "ghost"
          },
          // {
          //   title: "History",
          //   href: "/history",
          //   icon: UsersRound,
          //   variant: "ghost"
          // },
          // {
          //   title: "settings",
          //   href: "/settings",
          //   icon: Settings,
          //   variant: "ghost"
          // }
        ]}
      />

      <RainbowKitCustomConnectButton />

    </div>
  );
}
