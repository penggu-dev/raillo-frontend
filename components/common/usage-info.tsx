"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UsageInfo() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">이용 안내</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-600">
        <p>• 표시된 요금은 어른 기준이며, 어린이(40%)·유아(75%)·경로(30%)·장애인(30~50%)·국가유공자(50%) 할인이 적용됩니다.</p>
        <p>• 승차권 구입 후 출발시간 20분 전까지 취소 가능합니다.</p>
        <p>• KTX는 전 좌석 지정석입니다.</p>
      </CardContent>
    </Card>
  )
}
