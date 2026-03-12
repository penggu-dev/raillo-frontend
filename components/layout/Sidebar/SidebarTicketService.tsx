import SidebarBtn from "./SidebarBtn";

const SidebarTicketService = () => {
  return (
    <div className="space-y-1">
      <SidebarBtn type="ticket-purchased" />
      <SidebarBtn type="ticket-booking" />
      <SidebarBtn type="ticket-reservations" />
    </div>
  );
};

export default SidebarTicketService;
