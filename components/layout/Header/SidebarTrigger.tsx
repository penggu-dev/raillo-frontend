"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SidebarHeader from "@/components/layout/Sidebar/SidebarHeader";
import SidebarContent from "@/components/layout/Sidebar/SidebarContent";

const SidebarTrigger = () => {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="fixed inset-x-auto right-0 top-0 mt-0 h-full w-80 !rounded-none border-0 flex flex-col p-0">
        <DrawerTitle>
          <SidebarHeader />
        </DrawerTitle>
        <SidebarContent />
      </DrawerContent>
    </Drawer>
  );
};

export default SidebarTrigger;
