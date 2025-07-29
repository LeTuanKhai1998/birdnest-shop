import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order – Birdnest Shop',
  description: 'Track your guest orders by entering your email or phone number. Check order status, delivery information, and order history.',
  openGraph: {
    title: 'Track Order – Birdnest Shop',
    description: 'Track your guest orders by entering your email or phone number.',
    type: 'website',
  },
};

export default function GuestOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 