import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-16 text-center">
        <LoadingSpinner className="mx-auto mb-4" />
        <p className="text-gray-600">예매 내역을 불러오고 있습니다...</p>
      </div>
    </div>
  );
}
