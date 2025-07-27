export function mapOrderToApi(order: unknown): unknown {
  const o = order as Record<string, unknown>;
  return {
    id: o.id,
    createdAt: (o.createdAt as Date).toISOString(),
    status: o.status,
    total: Number(o.total),
    orderItems: (o.orderItems as unknown[]).map((item: unknown) => {
      const i = item as Record<string, unknown>;
      return {
        id: i.id,
        quantity: i.quantity,
        price: Number(i.price),
        product: {
          id: (i.product as Record<string, unknown>).id,
          name: (i.product as Record<string, unknown>).name,
          images: Array.isArray((i.product as Record<string, unknown>).images)
            ? ((i.product as Record<string, unknown>).images as unknown[]).map((img: unknown) => (img as Record<string, unknown>).url as string)
            : [],
        },
      };
    }),
  };
} 