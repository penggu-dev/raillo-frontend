import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const CartBtn = () => {
  return (
    <Button variant="ghost" size="sm" className="flex items-center space-x-2" asChild>
      <Link href="/cart">
        <ShoppingCart className="h-4 w-4" />
        <span>장바구니</span>
      </Link>
    </Button>
  );
};

export default CartBtn;
