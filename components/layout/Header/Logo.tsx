import { Train } from "lucide-react";
import Link from "next/link";

const Logo = () => {
  return (
    <>
      <Link href="/" className="flex items-center space-x-2">
        <Train className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">RAILLO</h1>
      </Link>
    </>
  );
};

export default Logo;
