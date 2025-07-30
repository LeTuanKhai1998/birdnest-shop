'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '@/lib/checkout-store';
import { useSession } from 'next-auth/react';
import { ArrowLeft, CreditCard, Smartphone, Building2, DollarSign, CheckCircle, Loader2, Copy, QrCode, Package } from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
  { 
    value: 'stripe', 
    label: 'Thẻ tín dụng/Ghi nợ', 
    description: 'Thanh toán an toàn qua thẻ với Stripe',
    icon: CreditCard,
    color: 'text-blue-600'
  },
  { 
    value: 'momo', 
    label: 'Ví điện tử Momo', 
    description: 'Quét mã QR bằng ứng dụng Momo',
    icon: Smartphone,
    color: 'text-pink-600'
  },
  { 
    value: 'bank', 
    label: 'Chuyển khoản ngân hàng', 
    description: 'Chuyển khoản vào tài khoản ngân hàng',
    icon: Building2,
    color: 'text-green-600'
  },
  { 
    value: 'cod', 
    label: 'Thanh toán khi nhận hàng', 
    description: 'Thanh toán tiền mặt khi nhận hàng',
    icon: DollarSign,
    color: 'text-orange-600'
  },
];

type ProductCartItem = {
  product: {
    id: string;
    price: number;
    name: string;
    images?: string[];
    image?: string;
  };
  quantity: number;
};

export default function PaymentPage() {
  const [method, setMethod] = useState('stripe');
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  const items = useCheckoutStore((s) => s.products) as ProductCartItem[];
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shippingFee = useCheckoutStore((s) => s.deliveryFee);
  const total = subtotal + shippingFee;
  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
  const checkoutInfo = useCheckoutStore((s) => s.info);
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText('MOCK123');
    setCopied(true);
    toast.success('Đã sao chép mã đơn hàng!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!method) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setConfirming(true);
    try {
      const orderData = {
        info: checkoutInfo,
        products: items,
        deliveryFee: shippingFee,
        paymentMethod: method,
      };

      // Use guest endpoint if user is not authenticated, otherwise use regular endpoint
      const endpoint = session?.user ? '/api/orders' : '/api/orders/guest';
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const order = await response.json();
      
      // Clear cart after successful order
      clearCart();
      
      // Show success message
      toast.success(`Đặt hàng thành công! Mã đơn hàng: ${order.id}`);
      
      // Redirect to order confirmation page
      router.push(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(`Lỗi tạo đơn hàng: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setConfirming(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === method);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#a10000] to-[#c41e3a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Thanh Toán An Toàn</h1>
          <p className="text-red-100 text-lg">Hoàn tất đơn hàng với thanh toán an toàn</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Payment Method Selection (left - 2 columns) */}
          <div className="lg:col-span-2 space-y-8 max-w-4xl">
            {/* Progress Indicator */}
            <Card className="p-6 py-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-green-600">Thông tin giao hàng</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#a10000] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-[#a10000]">Thanh toán</span>
                </div>
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="py-8">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Chọn Phương Thức Thanh Toán
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  {PAYMENT_METHODS.map((paymentMethod) => {
                    const Icon = paymentMethod.icon;
                    return (
                      <div key={paymentMethod.value} className="relative">
                        <input
                          type="radio"
                          value={paymentMethod.value}
                          id={paymentMethod.value}
                          checked={method === paymentMethod.value}
                          onChange={(e) => setMethod(e.target.value)}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={paymentMethod.value}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-[#a10000] ${
                            method === paymentMethod.value
                              ? 'border-[#a10000] bg-red-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${paymentMethod.color} bg-opacity-10 mr-4`}>
                            <Icon className={`h-5 w-5 ${paymentMethod.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{paymentMethod.label}</div>
                            <div className="text-sm text-gray-500">{paymentMethod.description}</div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            method === paymentMethod.value
                              ? 'border-[#a10000] bg-[#a10000]'
                              : 'border-gray-300'
                          }`}>
                            {method === paymentMethod.value && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                            )}
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Details */}
            <Card className="py-8">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2">
                  {selectedMethod && <selectedMethod.icon className="h-5 w-5" />}
                  Chi Tiết {selectedMethod?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {method === 'stripe' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-medium mb-2">Xử Lý Thanh Toán An Toàn</p>
                      <p className="text-blue-700 text-sm">
                        Thanh toán của bạn sẽ được xử lý an toàn qua Stripe. 
                        Chúng tôi không bao giờ lưu trữ thông tin thẻ của bạn.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Kết nối mã hóa SSL
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Tuân thủ PCI DSS
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Xác nhận thanh toán tức thì
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#a10000] hover:bg-[#8a0000] text-white font-semibold py-3"
                      disabled
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Tiến hành với Stripe (Sắp có)
                    </Button>
                  </div>
                )}

                {method === 'momo' && (
                  <div className="space-y-4">
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <p className="text-pink-800 font-medium mb-2">Thanh Toán Momo QR</p>
                      <p className="text-pink-700 text-sm">
                        Quét mã QR bên dưới bằng ứng dụng Momo để hoàn tất thanh toán.
                      </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                        <QrCode className="h-32 w-32 text-gray-400" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Mã đơn hàng để tham khảo:</p>
                        <div className="flex items-center gap-2 justify-center">
                          <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">MOCK123</code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyOrderId}
                            className="h-8"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {copied ? 'Đã sao chép!' : 'Sao chép'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#a10000] hover:bg-[#8a0000] text-white font-semibold py-3"
                      onClick={handleConfirm}
                      disabled={confirming}
                    >
                      {confirming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xác nhận...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Tôi đã thanh toán bằng Momo
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {method === 'bank' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium mb-2">Chi Tiết Chuyển Khoản</p>
                      <p className="text-green-700 text-sm">
                        Chuyển khoản chính xác số tiền vào tài khoản ngân hàng của chúng tôi. Ghi mã đơn hàng vào nội dung chuyển khoản.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Ngân hàng:</span>
                        <span className="text-gray-900">Vietcombank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Số tài khoản:</span>
                        <span className="text-gray-900 font-mono">0123456789</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Tên tài khoản:</span>
                        <span className="text-gray-900">NGUYEN VAN A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Nội dung:</span>
                        <span className="text-gray-900 font-mono">MOCK123</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Số tiền:</span>
                        <span className="text-[#a10000] font-bold">{currencyFormatter.format(total)}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#a10000] hover:bg-[#8a0000] text-white font-semibold py-3"
                      onClick={handleConfirm}
                      disabled={confirming}
                    >
                      {confirming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xác nhận...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Tôi đã chuyển khoản
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {method === 'cod' && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-orange-800 font-medium mb-2">Thanh Toán Khi Nhận Hàng</p>
                      <p className="text-orange-700 text-sm">
                        Thanh toán tiền mặt khi đơn hàng được giao đến địa chỉ của bạn.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Không cần thanh toán trước
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Thanh toán khi nhận hàng
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Thời gian giao hàng dự kiến: 2-3 ngày làm việc
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#a10000] hover:bg-[#8a0000] text-white font-semibold py-3"
                      onClick={handleConfirm}
                      disabled={confirming}
                    >
                      {confirming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xác nhận...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Xác Nhận Đơn Hàng COD
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary (right - 1 column) */}
          <div className="lg:col-span-1 w-full">
            <div className="sticky top-8 space-y-8">
              <Card className="py-8 min-w-[400px] w-full">
                <CardHeader className="pb-6">
                                  <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tóm Tắt Đơn Hàng
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  {/* Customer Info */}
                  {checkoutInfo && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-gray-900">Địa Chỉ Giao Hàng</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="font-medium">{checkoutInfo.fullName}</div>
                        <div>{checkoutInfo.phone}</div>
                        <div>{checkoutInfo.email}</div>
                        <div className="text-gray-600">
                          {[
                            checkoutInfo.address,
                            checkoutInfo.apartment,
                            checkoutInfo.ward,
                            checkoutInfo.district,
                            checkoutInfo.province,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Sản Phẩm ({items.length})</h4>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {items.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {product.image && (
                                                              <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base truncate text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-gray-500 text-sm">
                              SL: {quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-base text-gray-900">
                              {currencyFormatter.format(product.price * quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="text-gray-900">{currencyFormatter.format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className={shippingFee === 0 ? "text-green-600 font-semibold" : "text-gray-900"}>
                        {shippingFee === 0 ? 'Miễn phí' : currencyFormatter.format(shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-lg">
                      <span className="text-gray-900">Tổng cộng</span>
                      <span className="text-[#a10000]">
                        {currencyFormatter.format(total)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Badge */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-gray-700">Phương thức thanh toán:</span>
                    <Badge variant="secondary" className="font-semibold">
                      {selectedMethod?.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile CTA Button */}
              <div className="lg:hidden">
                <Button
                  className="w-full bg-[#a10000] hover:bg-[#8a0000] text-white font-semibold py-4 text-lg"
                  onClick={handleConfirm}
                  disabled={confirming}
                >
                  {confirming ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Hoàn Tất Thanh Toán
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
