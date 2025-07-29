import { Metadata } from 'next'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Award, 
  Users, 
  Heart, 
  Shield, 
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - Birdnest Shop',
  description: 'Discover our story, mission, and the team behind Birdnest Shop. We specialize in premium bird&apos;s nest products from Kien Giang, Vietnam.',
  openGraph: {
    title: 'About Us - Birdnest Shop',
    description: 'Discover our story, mission, and the team behind Birdnest Shop. We specialize in premium bird&apos;s nest products from Kien Giang, Vietnam.',
    images: ['/images/logo.png'],
  },
}

const teamMembers = [
  {
    name: 'Nguyen Van Yen',
    role: 'Founder & CEO',
    image: '/images/to-yen-nguyen-chat.jpg',
    bio: 'With over 15 years of experience in the bird&apos;s nest industry, Yen leads our mission to bring premium quality products to customers worldwide.',
  },
  {
    name: 'Tran Thi Mai',
    role: 'Quality Control Manager',
    image: '/images/user.jpeg',
    bio: 'Ensuring every product meets our strict quality standards through rigorous testing and inspection processes.',
  },
  {
    name: 'Le Van Minh',
    role: 'Operations Director',
    image: '/images/user.jpeg',
    bio: 'Managing our supply chain and ensuring smooth operations from harvest to delivery.',
  },
]

const milestones = [
  {
    year: '2010',
    title: 'Company Founded',
    description: 'Started as a small family business in Kien Giang, Vietnam',
    icon: Heart,
  },
  {
    year: '2015',
    title: 'Quality Certification',
    description: 'Achieved international quality standards and certifications',
    icon: Award,
  },
  {
    year: '2018',
    title: 'Market Expansion',
    description: 'Expanded to serve customers across Vietnam and Asia',
    icon: MapPin,
  },
  {
    year: '2023',
    title: 'Digital Transformation',
    description: 'Launched online platform to reach global customers',
    icon: Star,
  },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Health Enthusiast',
    content: 'The quality of bird&apos;s nest from Birdnest Shop is exceptional. I&apos;ve been a loyal customer for 3 years.',
    rating: 5,
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Traditional Medicine Practitioner',
    content: 'I recommend Birdnest Shop to my patients. Their products are authentic and of the highest quality.',
    rating: 5,
  },
  {
    name: 'Linda Wong',
    role: 'Wellness Coach',
    content: 'The customer service and product quality are outstanding. Highly recommended!',
    rating: 5,
  },
]

const partners = [
  { name: 'Vietnam Food Safety Authority', logo: '/images/logo.png' },
  { name: 'Kien Giang Agriculture Department', logo: '/images/logo.png' },
  { name: 'International Bird\'s Nest Association', logo: '/images/logo.png' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/bg_banner_top.jpg"
            alt="Bird's nest background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Bringing premium bird&apos;s nest from the pristine caves of Kien Giang to your table
          </p>
          <Button size="lg" className="bg-white text-black hover:bg-gray-100">
            Explore Our Products
          </Button>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To provide the highest quality bird&apos;s nest products while preserving traditional harvesting methods 
              and supporting sustainable practices that protect both the environment and the swiftlet population.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality First</h3>
                <p className="text-gray-600">
                  Every product undergoes rigorous quality control to ensure the highest standards.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sustainable Harvesting</h3>
                <p className="text-gray-600">
                  We practice responsible harvesting that protects swiftlet populations and their habitats.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                <p className="text-gray-600">
                  Supporting local communities and preserving traditional knowledge and practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">
              From humble beginnings to becoming a trusted name in premium bird&apos;s nest products
            </p>
          </div>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className={`flex items-center gap-8 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <milestone.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <Badge variant="secondary" className="text-sm">
                        {milestone.year}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
                <div className="flex-1">
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Timeline Image</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">
              The passionate individuals behind our success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">
              Trusted by thousands of satisfied customers worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-8">Our Partners & Certifications</h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {partners.map((partner) => (
                <div key={partner.name} className="flex items-center gap-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <span className="text-sm text-gray-600">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Premium Quality?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get in touch with us to learn more about our products or place your order
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 