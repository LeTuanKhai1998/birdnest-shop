export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string[] };
};

export type Order = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  orderItems: OrderItem[];
};

export const mockOrders: Order[] = [
  {
    id: 'mock1',
    createdAt: new Date(2024, 0, 1, 10, 0, 0).toISOString(),
    status: 'DELIVERED',
    total: 4200000,
    orderItems: [
      {
        id: 'item1',
        quantity: 2,
        price: 2100000,
        product: {
          id: 'p5',
          name: 'Raw Birdnest 50g',
          images: ['/images/p2.png'],
        },
      },
    ],
  },
  {
    id: 'mock2',
    createdAt: new Date(2024, 0, 3, 15, 30, 0).toISOString(),
    status: 'SHIPPED',
    total: 7900000,
    orderItems: [
      {
        id: 'item2',
        quantity: 1,
        price: 7900000,
        product: {
          id: 'p3',
          name: 'Feather-removed Birdnest 200g',
          images: ['/images/p3.png'],
        },
      },
    ],
  },
];
