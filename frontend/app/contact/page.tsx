'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    title: 'Email Us',
    value: 'info@birdnestshop.com',
    description: 'We&apos;ll respond within 24 hours',
    action: 'mailto:info@birdnestshop.com',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+84 123 456 789',
    description: 'Mon-Fri: 8:00 AM - 6:00 PM (GMT+7)',
    action: 'tel:+84123456789',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: 'Kien Giang, Vietnam',
    description: 'Main office and processing facility',
    action: '#',
  },
]

const operatingHours = [
  { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
  { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
]

const faqLinks = [
  {
    title: 'Shipping Information',
    description: 'Learn about our shipping methods and delivery times',
    icon: Truck,
    href: '#',
  },
  {
    title: 'Returns & Exchanges',
    description: 'Our return policy and exchange procedures',
    icon: ArrowRight,
    href: '#',
  },
  {
    title: 'Payment Methods',
    description: 'Accepted payment options and security',
    icon: CreditCard,
    href: '#',
  },
]

const inquiryTopics = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'product', label: 'Product Information' },
  { value: 'order', label: 'Order Status' },
  { value: 'shipping', label: 'Shipping & Delivery' },
  { value: 'return', label: 'Returns & Exchanges' },
  { value: 'wholesale', label: 'Wholesale Inquiry' },
  { value: 'other', label: 'Other' },
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
        setSubmitMessage(result.message || 'Something went wrong. Please try again.')
      }
    } catch (_error) {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
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
          className="object-contain sm:object-cover md:object-cover w-full h-full lg:hidden"
          priority
          quality={100}
          sizes="100vw"
          style={{ zIndex: 0, objectPosition: 'center top' }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center" style={{ minHeight: '600px' }}>
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              How Can We Help?
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Get in touch with our team for any questions about our premium bird&apos;s nest products
            </p>
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Send Us a Message
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">
              Choose your preferred way to reach us
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
                    Contact via {method.title.split(' ')[0]}
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
                Operating Hours
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
                All times are in Vietnam Standard Time (GMT+7)
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="contact-form" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Send Us a Message</h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and we&apos;ll get back to you within 24 hours
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  Inquiry Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Enter your first name" 
                        required 
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Enter your last name" 
                        required 
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email address" 
                      required 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="Enter your phone number (optional)" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="topic">Inquiry Topic *</Label>
                    <Select value={formData.topic} onValueChange={(value: string) => handleInputChange('topic', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
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
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us how we can help you..." 
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  
                  <p className="text-sm text-gray-500 text-center">
                    By submitting this form, you agree to our privacy policy and terms of service.
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
                      <h3 className="text-xl font-semibold mb-2">Quick Response Time</h3>
                      <p className="text-gray-600 mb-4">
                        We typically respond to inquiries within 24 hours during business days. 
                        For urgent matters, please call us directly.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Email inquiries:</span>
                          <span className="font-medium">Within 24 hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone calls:</span>
                          <span className="font-medium">Immediate</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Weekend inquiries:</span>
                          <span className="font-medium">Next business day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Links */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Help</CardTitle>
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Location</h2>
            <p className="text-lg text-gray-600">
              Visit our main office and processing facility in Kien Giang, Vietnam
            </p>
          </div>
          
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Interactive map will be embedded here</p>
                <p className="text-sm text-gray-400 mt-2">Kien Giang Province, Vietnam</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Main Office</h3>
                  <p className="text-gray-600">
                    123 Bird&apos;s Nest Street<br />
                    Kien Giang Province<br />
                    Vietnam
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Processing Facility</h3>
                  <p className="text-gray-600">
                    Premium Quality Processing Center<br />
                    Kien Giang Province<br />
                    Vietnam
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Premium Quality?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Browse our products or get in touch for wholesale inquiries
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Browse Products
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Wholesale Inquiry
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 