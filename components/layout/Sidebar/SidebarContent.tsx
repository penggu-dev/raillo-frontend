import SidebarNavItem from "./SidebarNavItem";
import SidebarTicketService from "./SidebarTicketService";

const SidebarContent = () => {
  return (
    <div className="p-5 overflow-y-auto h-[calc(100vh-80px)] bg-white">
      <nav className="space-y-5">
        <SidebarNavItem type="ticket-purchased" />
        <SidebarNavItem type="ticket-booking" />
        <SidebarNavItem type="ticket-reservations" />
      </nav>
    </div>
  );
};

export default SidebarContent;
