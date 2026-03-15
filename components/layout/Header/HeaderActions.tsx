import HeaderAuthBtn from "./HeaderAuthBtn";
import CartBtn from "./CartBtn";
import MyPageBtn from "./MyPageBtn";
import SidebarTrigger from "./SidebarTrigger";

const HeaderActions = () => {
  return (
    <div className="flex items-center space-x-4 ml-auto">
      <nav className="hidden md:flex items-center space-x-4">
        <HeaderAuthBtn />
        <CartBtn />
        <MyPageBtn />
        <SidebarTrigger />
      </nav>
    </div>
  );
};

export default HeaderActions;
