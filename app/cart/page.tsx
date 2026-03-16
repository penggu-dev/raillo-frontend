"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label as UILabel } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react"
import { getReservationList, deletePendingBookings } from '@/lib/api/booking'
import { processPaymentViaCard, processPaymentViaBankAccount } from '@/lib/api/payment'
import { handleError } from '@/lib/utils/errorHandler'
import { useToast } from "@/hooks/use-toast"
import { formatPrice, formatDate, formatTime } from "@/lib/utils/format"
import { getTrainTypeColor } from "@/lib/utils/ticketUtils"

interface CartItem {
  pendingBookingId: string
  trainNumber: string
  trainName: string
  departureStationName: string
  arrivalStationName: string
  departureTime: string
  arrivalTime: string
  operationDate: string
  totalFare: number
  expiresAt?: string
  fare?: number
  reservationId?: number
  reservationCode?: string
  seats: {
    seatId: number
    passengerType: string
    carNumber: number
    carType: string
    seatNumber: string
  }[]
  selected: boolean
}

function CartPageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  // 결제 모달 관련 state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "account">("card")
  const [paymentLoading, setPaymentLoading] = useState(false)

  // 카드 결제 정보
  const [cardNumber, setCardNumber] = useState("")
  const [validThru, setValidThru] = useState("")
  const [rrn, setRrn] = useState("")
  const [cardPassword, setCardPassword] = useState("")
  const [installment, setInstallment] = useState("0")
  
  // 계좌이체 정보
  const [bankCode, setBankCode] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [identificationNumber, setIdentificationNumber] = useState("")
  const [accountPassword, setAccountPassword] = useState("")

  const showValidationToast = (description: string) => {
    toast({
      title: "입력 확인",
      description,
      variant: "destructive",
    })
  }

  // 장바구니 데이터 로드
  useEffect(() => {
    
    const fetchCart = async () => {
      try {
        setLoading(true)
        const response = await getReservationList()
        if (response.result && Array.isArray(response.result)) {
          const itemsWithSelection = response.result.map((item) => ({
            ...item,
            totalFare: item.totalFare ?? item.fare ?? 0,
            // 기존 fare 참조 코드와 호환
            fare: item.totalFare ?? item.fare ?? 0,
            selected: true // 기본적으로 모든 항목 선택
          }))
          setCartItems(itemsWithSelection)
        } else {
          setError('장바구니를 불러올 수 없습니다.')
        }
      } catch (err) {
        const errorMessage = handleError(err, '장바구니 조회 중 오류가 발생했습니다.', false)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])



  const getTotalPrice = (item: CartItem) => {
    return item.totalFare ?? 0
  }

  const toggleItemSelection = (pendingBookingId: string) => {
    setCartItems((prev) => prev.map((item) => 
      item.pendingBookingId === pendingBookingId ? { ...item, selected: !item.selected } : item
    ))
  }

  const toggleAllSelection = () => {
    const allSelected = cartItems.every((item) => item.selected)
    setCartItems((prev) => prev.map((item) => ({ ...item, selected: !allSelected })))
  }

  const handleDeleteItem = (pendingBookingId: string) => {
    setItemToDelete(pendingBookingId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deletePendingBookings([itemToDelete])
        setCartItems((prev) => prev.filter((item) => item.pendingBookingId !== itemToDelete))
        setItemToDelete(null)
      } catch (e: unknown) {
        handleError(e, '장바구니에서 삭제 중 오류가 발생했습니다.')
      }
    }
    setShowDeleteDialog(false)
  }

  const handleDeleteSelected = () => {
    const hasSelected = cartItems.some((item) => item.selected)
    if (!hasSelected) {
      showValidationToast("삭제할 항목을 선택해주세요.")
      return
    }
    setShowDeleteAllDialog(true)
  }

  const confirmDeleteSelected = async () => {
    try {
      const selectedItems = cartItems.filter((item) => item.selected)
      const pendingBookingIds = selectedItems.map((item) => item.pendingBookingId)
      await deletePendingBookings(pendingBookingIds)
      setCartItems((prev) => prev.filter((item) => !item.selected))
      setShowDeleteAllDialog(false)
    } catch (e: unknown) {
      handleError(e, '선택한 항목들을 삭제 중 오류가 발생했습니다.')
    }
  }

  const handlePayment = () => {
    const selectedItems = cartItems.filter((item) => item.selected)
    if (selectedItems.length === 0) {
      showValidationToast("결제할 항목을 선택해주세요.")
      return
    }
    setShowPaymentDialog(true)
  }

  const validateCardPayment = () => {
    if (!cardNumber) {
      showValidationToast("카드번호를 입력해주세요.")
      return false
    }
    if (!validThru) {
      showValidationToast("유효기간을 입력해주세요.")
      return false
    }
    if (!rrn) {
      showValidationToast("주민등록번호를 입력해주세요.")
      return false
    }
    if (!cardPassword) {
      showValidationToast("카드 비밀번호를 입력해주세요.")
      return false
    }
    return true
  }

  const validateAccountPayment = () => {
    if (!bankCode) {
      showValidationToast("은행을 선택해주세요.")
      return false
    }
    if (!accountNumber) {
      showValidationToast("계좌번호를 입력해주세요.")
      return false
    }
    if (!accountHolderName) {
      showValidationToast("예금주명을 입력해주세요.")
      return false
    }
    if (!identificationNumber) {
      showValidationToast("주민등록번호 앞 6자리를 입력해주세요.")
      return false
    }
    if (!accountPassword) {
      showValidationToast("계좌 비밀번호를 입력해주세요.")
      return false
    }
    return true
  }

  const processCartPayment = async () => {
    const selectedItems = cartItems.filter((item) => item.selected)
    if (selectedItems.length === 0) {
      showValidationToast("결제할 항목을 선택해주세요.")
      return
    }

    setPaymentLoading(true)

    try {
      const payableItems = selectedItems.filter(
        (item): item is CartItem & { reservationId: number } =>
          typeof item.reservationId === "number" &&
          Number.isFinite(item.totalFare)
      )

      if (payableItems.length !== selectedItems.length) {
        showValidationToast("선택한 항목 중 결제 정보가 없어 결제를 진행할 수 없습니다.")
        return
      }

      // 각 예약에 대해 개별적으로 결제 처리
      const paymentPromises = payableItems.map(async (item) => {
        if (paymentMethod === "card") {
          if (!validateCardPayment()) return null

          const request = {
            reservationId: item.reservationId,
            amount: item.totalFare,
            cardNumber: cardNumber.replace(/\s/g, ""),
            validThru,
            rrn,
            installmentMonths: parseInt(installment),
            cardPassword: parseInt(cardPassword)
          }

          return await processPaymentViaCard(request)
        } else if (paymentMethod === "account") {
          if (!validateAccountPayment()) return null

          const request = {
            reservationId: item.reservationId,
            amount: item.totalFare,
            bankCode,
            accountNumber,
            accountHolderName,
            identificationNumber,
            accountPassword
          }

          return await processPaymentViaBankAccount(request)
        }
      })

      const results = await Promise.all(paymentPromises)
      const successCount = results.filter(r => r !== null).length

      if (successCount > 0) {
        toast({
          title: "결제 완료",
          description: `${successCount}개 항목의 결제가 완료되었습니다.`,
        })
        setShowPaymentDialog(false)
        
        // 결제 완료된 항목들을 장바구니에서 제거
        setCartItems((prev) => prev.filter((item) => !item.selected))
        
        // 결제 완료 페이지로 이동
        router.push("/ticket/purchased")
      }
    } catch (error) {
      console.error('Cart payment error:', error)
      const errorMessage = handleError(
        error,
        '결제 처리 중 오류가 발생했습니다.',
        false
      )
      toast({
        title: "결제 실패",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setPaymentLoading(false)
    }
  }

  const selectedItems = cartItems.filter((item) => item.selected)
  const totalPrice = selectedItems.reduce((sum, item) => sum + getTotalPrice(item), 0)
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">장바구니를 불러오고 있습니다...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">장바구니를 불러올 수 없습니다</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={() => router.push('/')} variant="outline">
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">장바구니</h2>
            <p className="text-gray-600">선택한 승차권을 확인하고 결제하세요</p>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                <p className="text-gray-600 mb-6">승차권을 예매하고 장바구니에 담아보세요.</p>
                <Link href="/ticket/search">
                  <Button className="bg-blue-600 hover:bg-blue-700">승차권 예매하기</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-3 space-y-4">
                {/* Cart Header */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleAllSelection}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span className="font-medium">
                          전체선택 ({selectedItems.length}/{cartItems.length})
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        선택삭제
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Cart Items List */}
                {cartItems.map((item) => {
                  return (
                    <Card key={item.pendingBookingId} className={`${item.selected ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItemSelection(item.pendingBookingId)}
                          className="mt-1 data-[state=checked]:bg-blue-600"
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Badge className={`${getTrainTypeColor(item.trainName)} px-3 py-1`}>
                                {item.trainName}
                              </Badge>
                              <span className="text-lg font-bold">{item.trainNumber}</span>
                              <span className="text-gray-600">{formatDate(item.operationDate)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.pendingBookingId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Route Info */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                운행 정보
                              </h4>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{item.departureStationName}</span>
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                  <span className="font-medium">{item.arrivalStationName}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatTime(item.departureTime)} ~ {formatTime(item.arrivalTime)}
                                </div>
                              </div>
                            </div>

                            {/* Seat Info */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">좌석 정보</h4>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {(item.seats[0]?.carType ?? "STANDARD") === "FIRST_CLASS" ? "특실" : "일반실"}
                                </div>
                                <div className="text-gray-600">
                                  {item.seats.length}매
                                </div>
                              </div>
                            </div>

                            {/* Price Info */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">요금</h4>
                              <div className="text-xl font-bold text-blue-600">{formatPrice(getTotalPrice(item))}</div>
                            </div>
                          </div>

                          {/* Reservation Number & Expiry */}
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                예약번호: {item.reservationCode ?? item.pendingBookingId}
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-red-600 font-semibold">
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>

              {/* Payment Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>결제 정보</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Selected Items Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">선택된 항목</h4>
                      <div className="space-y-2">
                        {selectedItems.length === 0 ? (
                          <p className="text-sm text-gray-500">선택된 항목이 없습니다</p>
                        ) : (
                          selectedItems.map((item) => (
                            <div key={item.pendingBookingId} className="text-sm">
                              <div className="flex justify-between">
                                <span>
                                  {item.trainName} {item.trainNumber}
                                </span>
                                <span>{formatPrice(getTotalPrice(item))}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Price Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>승차권 요금</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>수수료</span>
                        <span>0원</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>총 결제금액</span>
                        <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-yellow-800">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">결제 안내</span>
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        장바구니 항목은 결제 전까지 임시 예약 상태입니다
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      onClick={handlePayment}
                      disabled={selectedItems.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                      size="lg"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {selectedItems.length > 0 ? `${formatPrice(totalPrice)} 결제하기` : "항목을 선택하세요"}
                    </Button>

                    {/* Continue Shopping */}
                    <Link href="/ticket/search">
                      <Button variant="outline" className="w-full">
                        승차권 추가 예매
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Item Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>항목 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 승차권을 장바구니에서 삭제하시겠습니까?
              <br />
              삭제된 항목은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Selected Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>선택 항목 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 모든 승차권을 장바구니에서 삭제하시겠습니까?
              <br />
              삭제된 항목들은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSelected} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>결제 정보</DialogTitle>
            <DialogDescription>
              선택된 {selectedItems.length}개 항목을 결제합니다. (총 {formatPrice(totalPrice)})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Selected Items Summary */}
            <div>
              <h3 className="font-semibold mb-3">결제 항목</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div key={item.pendingBookingId} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{item.trainName} {item.trainNumber} - {item.departureStationName} → {item.arrivalStationName}</span>
                    <span className="font-medium">{formatPrice(getTotalPrice(item))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="font-semibold mb-3">결제 방법</h3>
              <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "card" | "account")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card">신용카드</TabsTrigger>
                  <TabsTrigger value="account">계좌이체</TabsTrigger>
                </TabsList>

                {/* Card Payment Form */}
                <TabsContent value="card" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <UILabel className="text-base font-medium">카드번호</UILabel>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")
                          setCardNumber(value)
                        }}
                        maxLength={19}
                      />
                    </div>

                    <div>
                      <UILabel className="text-base font-medium">유효기간</UILabel>
                      <Input
                        placeholder="MM/YY"
                        value={validThru}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "")
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + "/" + value.substring(2, 4)
                          }
                          setValidThru(value)
                        }}
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <UILabel className="text-base font-medium">주민번호 앞 6자리</UILabel>
                      <Input
                        placeholder="951201"
                        value={rrn}
                        onChange={(e) => setRrn(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                      />
                    </div>

                    <div>
                      <UILabel className="text-base font-medium">카드 비밀번호 앞 2자리</UILabel>
                      <Input
                        type="password"
                        placeholder="**"
                        value={cardPassword}
                        onChange={(e) => setCardPassword(e.target.value.replace(/\D/g, ""))}
                        maxLength={2}
                      />
                    </div>

                    <div>
                      <UILabel className="text-base font-medium">할부</UILabel>
                      <Select value={installment} onValueChange={setInstallment}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">일시불</SelectItem>
                          <SelectItem value="2">2개월</SelectItem>
                          <SelectItem value="3">3개월</SelectItem>
                          <SelectItem value="6">6개월</SelectItem>
                          <SelectItem value="12">12개월</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Account Transfer Form */}
                <TabsContent value="account" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <UILabel className="text-base font-medium">은행</UILabel>
                      <Select value={bankCode} onValueChange={setBankCode}>
                        <SelectTrigger>
                          <SelectValue placeholder="은행 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="088">신한은행</SelectItem>
                          <SelectItem value="020">우리은행</SelectItem>
                          <SelectItem value="003">기업은행</SelectItem>
                          <SelectItem value="004">KB국민은행</SelectItem>
                          <SelectItem value="011">NH농협은행</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <UILabel className="text-base font-medium">계좌번호</UILabel>
                      <Input
                        placeholder="123456789012"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9-]/g, ""))}
                      />
                    </div>

                    <div>
                      <UILabel className="text-base font-medium">예금주명</UILabel>
                      <Input
                        placeholder="예금주명을 입력하세요"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                      />
                    </div>

                    <div>
                      <UILabel className="text-base font-medium">주민등록번호 앞 6자리</UILabel>
                      <Input
                        placeholder="주민등록번호 앞 6자리 (예: 123456)"
                        value={identificationNumber}
                        onChange={(e) => setIdentificationNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        maxLength={6}
                      />
                    </div>

                    <div className="col-span-2">
                      <UILabel className="text-base font-medium">계좌 비밀번호 앞 2자리</UILabel>
                      <Input
                        type="password"
                        placeholder="계좌 비밀번호 앞 2자리"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                        maxLength={2}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
                disabled={paymentLoading}
              >
                취소
              </Button>
              <Button
                onClick={processCartPayment}
                disabled={paymentLoading || selectedItems.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {paymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    결제 처리중...
                  </>
                ) : (
                  `${formatPrice(totalPrice)} 결제하기`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CartPage() {
  return (
    <AuthGuard>
      <CartPageContent />
    </AuthGuard>
  )
}
