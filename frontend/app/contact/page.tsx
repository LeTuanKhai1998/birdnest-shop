'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Footer from '@/components/Footer'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Truck,
  CreditCard,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    value: 'info@yensaokimsang.com',
    description: 'Phản hồi trong vòng 24 giờ',
    action: 'mailto:info@yensaokimsang.com',
  },
  {
    icon: Phone,
    title: 'Điện thoại',
    value: '+84 123 456 789',
    description: 'T2-T6: 8:00 - 18:00 (GMT+7)',
    action: 'tel:+84123456789',
  },
  {
    icon: MapPin,
    title: 'Địa chỉ',
    value: 'Kiên Giang, Việt Nam',
    description: 'Văn phòng chính và nhà máy chế biến',
    action: '#',
  },
]

const operatingHours = [
  { day: 'Thứ 2 - Thứ 6', hours: '8:00 - 18:00' },
  { day: 'Thứ 7', hours: '9:00 - 16:00' },
  { day: 'Chủ nhật', hours: 'Nghỉ' },
]

const faqLinks = [
  {
    title: 'Thông tin giao hàng',
    description: 'Tìm hiểu về phương thức giao hàng và thời gian giao',
    icon: Truck,
    href: '#',
  },
  {
    title: 'Đổi trả & Hoàn tiền',
    description: 'Chính sách đổi trả và quy trình hoàn tiền',
    icon: ArrowRight,
    href: '#',
  },
  {
    title: 'Phương thức thanh toán',
    description: 'Các phương thức thanh toán được chấp nhận',
    icon: CreditCard,
    href: '#',
  },
]

const inquiryTopics = [
  { value: 'general', label: 'Tư vấn chung' },
  { value: 'product', label: 'Thông tin sản phẩm' },
  { value: 'order', label: 'Trạng thái đơn hàng' },
  { value: 'shipping', label: 'Giao hàng & Vận chuyển' },
  { value: 'return', label: 'Đổi trả & Hoàn tiền' },
  { value: 'wholesale', label: 'Tư vấn bán buôn' },
  { value: 'other', label: 'Khác' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    topic: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage(result.message)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          topic: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
      }
    } catch (_error) {
      setSubmitStatus('error')
      setSubmitMessage('Lỗi kết nối. Vui lòng kiểm tra kết nối và thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbd8b0] to-white">
      {/* Hero Section */}
      <section
        className="relative w-full bg-[#a10000] overflow-hidden lg:bg-[#a10000] bg-gradient-to-b from-[#a10000] to-[#fbd8b0]"
        style={{ minHeight: '600px' }}
      >
        {/* Background Image - Desktop */}
        <Image
          src="/images/bg_banner_top.jpg"
          alt="Banner Background"
          fill
          className="object-cover w-full h-full hidden lg:block"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center 30%' }}
        />

        {/* Background Image - Mobile */}
        <Image
          src="/images/bg_banner_top_mobile.jpg"
          alt="Banner Background Mobile"
          fill
          className="object-cover w-full h-full lg:hidden"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center top' }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '600px' }}>
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chúng Tôi Có Thể Giúp Gì?
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Liên hệ với chúng tôi để được tư vấn về các sản phẩm yến sào cao cấp
            </p>
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Gửi Tin Nhắn
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#a10000]">Liên Hệ</h2>
            <p className="text-lg text-gray-600">
              Chọn cách liên hệ phù hợp với bạn
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {contactMethods.map((method) => (
              <Card key={method.title} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                  <p className="text-lg font-medium text-blue-600 mb-2">{method.value}</p>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(method.action, '_blank')}
                  >
                    Liên hệ qua {method.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Operating Hours */}
          <Card className="max-w-2xl mx-auto border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Giờ Làm Việc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operatingHours.map((schedule) => (
                  <div key={schedule.day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium">{schedule.day}</span>
                    <span className="text-gray-600">{schedule.hours}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Tất cả thời gian theo giờ Việt Nam (GMT+7)
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="contact-form" className="py-16 pb-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#a10000]">Gửi Tin Nhắn</h2>
            <p className="text-lg text-gray-600">
              Điền form bên dưới và chúng tôi sẽ phản hồi trong vòng 24 giờ
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  Form Liên Hệ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Tên *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Nhập tên của bạn" 
                        required 
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Họ *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Nhập họ của bạn" 
                        required 
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Nhập địa chỉ email của bạn" 
                      required 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="Nhập số điện thoại (tùy chọn)" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="topic">Chủ đề *</Label>
                    <Select value={formData.topic} onValueChange={(value: string) => handleInputChange('topic', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTopics.map((topic) => (
                          <SelectItem key={topic.value} value={topic.value}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Tin nhắn *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Hãy cho chúng tôi biết cách chúng tôi có thể giúp bạn..." 
                      rows={6}
                      required 
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                    />
                  </div>
                  
                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{submitMessage}</span>
                      </div>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{submitMessage}</span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Gửi Tin Nhắn
                      </>
                    )}
                  </Button>
                  
                  <p className="text-sm text-gray-500 text-center">
                    Bằng việc gửi form này, bạn đồng ý với chính sách bảo mật và điều khoản dịch vụ của chúng tôi.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Response Time & FAQ */}
            <div className="space-y-8">
              {/* Response Time */}
              <Card className="border-0 shadow-lg bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Thời Gian Phản Hồi Nhanh</h3>
                      <p className="text-gray-600 mb-4">
                        Chúng tôi thường phản hồi yêu cầu trong vòng 24 giờ trong ngày làm việc. 
                        Đối với vấn đề khẩn cấp, vui lòng gọi điện trực tiếp.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Yêu cầu qua email:</span>
                          <span className="font-medium">Trong vòng 24 giờ</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cuộc gọi:</span>
                          <span className="font-medium">Ngay lập tức</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Yêu cầu cuối tuần:</span>
                          <span className="font-medium">Ngày làm việc tiếp theo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Links */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Hỗ Trợ Nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqLinks.map((faq) => (
                    <div key={faq.title} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <faq.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{faq.title}</h4>
                        <p className="text-sm text-gray-600">{faq.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#a10000]">Địa Chỉ Của Chúng Tôi</h2>
            <p className="text-lg text-gray-600">
              Ghé thăm văn phòng chính và nhà máy chế biến tại Kiên Giang, Việt Nam
            </p>
          </div>
          
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Bản đồ tương tác sẽ được nhúng tại đây</p>
                <p className="text-sm text-gray-400 mt-2">Tỉnh Kiên Giang, Việt Nam</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Văn Phòng Chính</h3>
                  <p className="text-gray-600">
                    123 Đường Yến Sào<br />
                    Tỉnh Kiên Giang<br />
                    Việt Nam
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Nhà Máy Chế Biến</h3>
                  <p className="text-gray-600">
                    Trung Tâm Chế Biến Chất Lượng Cao<br />
                    Tỉnh Kiên Giang<br />
                    Việt Nam
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#a10000] to-red-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn Sàng Trải Nghiệm Chất Lượng Cao Cấp?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Xem sản phẩm hoặc liên hệ để tư vấn bán buôn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-[#a10000] hover:bg-gray-100 font-semibold">
              Xem Sản Phẩm
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-[#a10000] hover:bg-white hover:text-[#a10000] font-semibold transition-all duration-200">
              Tư Vấn Bán Buôn
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  )
} 