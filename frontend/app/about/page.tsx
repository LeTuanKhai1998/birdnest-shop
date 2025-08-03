import { Metadata } from 'next'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Award, 
  Heart, 
  Shield, 
  MapPin,
  CheckCircle,
  Leaf,
  FlaskConical,
  Gift
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - Yến Sào Kim Sang',
  description: 'Yến Sào Kim Sang - Thương hiệu uy tín hàng đầu trong lĩnh vực cung cấp yến sào nguyên chất từ Kiên Giang, Việt Nam.',
  openGraph: {
    title: 'About Us - Yến Sào Kim Sang',
    description: 'Yến Sào Kim Sang - Thương hiệu uy tín hàng đầu trong lĩnh vực cung cấp yến sào nguyên chất.',
    images: ['/images/logo.png'],
  },
}

const features = [
  {
    icon: CheckCircle,
    title: '100% Tự Nhiên',
    description: 'Yến sào 100% tự nhiên, được chọn lọc kỹ lưỡng từ những tổ yến tốt nhất'
  },
  {
    icon: Shield,
    title: 'Kiểm Định Chất Lượng',
    description: 'Được kiểm định chất lượng, đảm bảo vệ sinh an toàn thực phẩm'
  },
  {
    icon: MapPin,
    title: 'Giao Hàng Toàn Quốc',
    description: 'Dịch vụ giao hàng nhanh chóng, tận nơi trên toàn quốc'
  },
  {
    icon: Award,
    title: 'Bảo Hành Chính Hãng',
    description: 'Cam kết chất lượng và bảo hành chính hãng cho mọi sản phẩm'
  }
]

const products = [
  {
    name: 'Yến Tinh Chế',
    description: 'Yến sào đã được làm sạch, loại bỏ tạp chất',
    icon: FlaskConical
  },
  {
    name: 'Tổ Yến Thô',
    description: 'Yến sào nguyên tổ, giữ nguyên hình dạng tự nhiên',
    icon: Leaf
  },
  {
    name: 'Combo Yến Sào',
    description: 'Bộ sản phẩm đa dạng, phù hợp mọi nhu cầu',
    icon: Gift
  }
]

const advantages = [
  {
    icon: Leaf,
    title: 'Nguồn Gốc Tự Nhiên',
    description: 'Yến sào được thu hoạch từ các hang động tự nhiên tại Kiên Giang, đảm bảo chất lượng và độ tinh khiết cao nhất.'
  },
  {
    icon: FlaskConical,
    title: 'Quy Trình Khép Kín',
    description: 'Từ khâu thu hoạch đến đóng gói đều tuân thủ quy trình nghiêm ngặt, đạt tiêu chuẩn vệ sinh an toàn thực phẩm.'
  },
  {
    icon: Heart,
    title: 'Dịch Vụ Tận Tâm',
    description: 'Đội ngũ tư vấn chuyên nghiệp, giao hàng nhanh chóng, hỗ trợ khách hàng 24/7 với cam kết hài lòng 100%.'
  }
]

export default function AboutPage() {
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
              <div className="block">YẾN SÀO KIM SANG</div>
              <div className="block">THƯƠNG HIỆU UY TÍN</div>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-center leading-relaxed">
              Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất cho sức khỏe gia đình Việt Nam.
            </p>
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              Khám phá ngay bộ sản phẩm yến sào cao cấp của chúng tôi
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#a10000]">🏆 Về Chúng Tôi</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed text-center">
              Yến Sào Kim Sang tự hào là thương hiệu hàng đầu trong lĩnh vực cung cấp yến sào nguyên chất. 
              Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất cho sức khỏe gia đình Việt Nam.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#a10000]">🍯 Sản Phẩm Chính</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <product.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{product.name}</h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#a10000]">Bộ sản phẩm thanh tẩy nhà cửa mang may mắn này có gì?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <advantage.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-center">{advantage.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-center">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#a10000] to-red-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Khám phá ngay bộ sản phẩm yến sào cao cấp của chúng tôi</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#a10000] hover:bg-gray-100 font-semibold">
              Xem Tất Cả Sản Phẩm
            </Button>
            <Button size="lg" className="bg-white text-[#a10000] hover:bg-gray-100 font-semibold">
              Tìm Hiểu Thêm
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 