import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";

const SidebarHeader = () => {
  return (
    <div className="bg-primary text-primary-foreground px-5 flex items-center justify-between w-full h-[72px]">
      <h2 className="heading-h4">카테고리</h2>
      <DrawerClose asChild>
        <Button
          size="icon"
          className="text-white hover:bg-blue-700 [&_svg]:size-6"
        >
          <XIcon />
        </Button>
      </DrawerClose>
    </div>
  );
};

export default SidebarHeader;
