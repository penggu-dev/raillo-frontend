import { useQuery } from "@tanstack/react-query";
import { getTickets, getTicketReceipt } from "@/lib/api/bookings";
import type { BookingStatus } from "@/lib/api/bookings";
import type {
  TicketResponse,
  TicketReceiptResponse,
} from "@/types/bookingType";

export const useGetTickets = (status: BookingStatus = "ALL") => {
  return useQuery<TicketResponse["result"], Error>({
    queryKey: ["tickets", status],
    queryFn: () => getTickets(status),
  });
};

export const useGetTicketReceipt = (ticketId: number | null) => {
  return useQuery<TicketReceiptResponse["result"] | null, Error>({
    queryKey: ["ticketReceipt", ticketId],
    queryFn: async () => {
      if (!ticketId) return null;
      return getTicketReceipt(ticketId);
    },
    enabled: !!ticketId,
  });
};
