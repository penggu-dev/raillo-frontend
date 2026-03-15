"use client";

import HeaderBrand from "./HeaderBrand";
import HeaderActions from "./HeaderActions";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          <HeaderBrand />
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
