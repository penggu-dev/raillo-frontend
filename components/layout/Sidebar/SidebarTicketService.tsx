import SidebarNavItem from "./SidebarNavItem";

const SidebarTicketService = () => {
  return (
    <div className="space-y-1">
      <SidebarNavItem type="ticket-purchased" />
      <SidebarNavItem type="ticket-booking" />
      <SidebarNavItem type="ticket-reservations" />
    </div>
  );
};

export default SidebarTicketService;
