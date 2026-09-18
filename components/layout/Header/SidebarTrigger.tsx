"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SidebarHeader from "@/components/layout/Sidebar/SidebarHeader";
import SidebarContent from "@/components/layout/Sidebar/SidebarContent";

const SidebarTrigger = () => {
  return (
    // vaul은 기본적으로 열릴 때 포커스를 옮기지 않아(autoFocus=false) 포커스가 트리거에 남고 Tab이 사이드바 밖으로 빠져나감
    <Drawer direction="right" autoFocus>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="전체 메뉴 열기">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="fixed inset-x-auto right-0 top-0 mt-0 h-full w-80 !rounded-none border-0 flex flex-col p-0">
        <SidebarHeader />
        <SidebarContent />
      </DrawerContent>
    </Drawer>
  );
};

export default SidebarTrigger;
