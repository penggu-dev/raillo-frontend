import SidebarBtn from "./SidebarBtn";
import SidebarTicketService from "./SidebarTicketService";

const SidebarContent = () => {
  return (
    <div className="p-5 overflow-y-auto h-[calc(100vh-80px)] bg-white">
      <nav className="space-y-5">
        <SidebarBtn type="ticket-purchased" />
        <SidebarBtn type="ticket-booking" />
        <SidebarBtn type="ticket-reservations" />
      </nav>
    </div>
  );
};

export default SidebarContent;
