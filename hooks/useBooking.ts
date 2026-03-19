import { useQuery } from "@tanstack/react-query";
import { getTickets, getTicketReceipt } from "@/lib/api/bookings";
import type { TicketResponse, TicketReceiptResponse } from "@/types/bookingType";

export const useGetTickets = () => {
  return useQuery<TicketResponse["result"], Error>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const response = await getTickets();
      return response.result ?? [];
    },
  });
};

export const useGetTicketReceipt = (ticketId: number | null) => {
  return useQuery<TicketReceiptResponse["result"] | null, Error>({
    queryKey: ["ticketReceipt", ticketId],
    queryFn: async () => {
      if (!ticketId) return null;
      const response = await getTicketReceipt(ticketId);
      return response.result ?? null;
    },
    enabled: !!ticketId,
  });
};
