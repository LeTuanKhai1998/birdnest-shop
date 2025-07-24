import { prisma } from "@/lib/prisma";
import ProductsClient from "@/components/ProductsClient";
import Footer from "@/components/Footer";

const mockProducts = [
  {
    id: "mock-1",
    slug: "yen-tinh-che-khanh-hoa-50g",
    name: "Yến tinh chế Khánh Hòa 50g",
    images: ["/images/p1.png"],
    price: 3500000,
    description: "Yến tinh chế Khánh Hòa, nguồn gốc tự nhiên, tốt cho sức khỏe, trọng lượng 50g.",
    weight: 50,
    type: "Yến tinh chế",
    quantity: 20,
    reviews: [],
    sold: 0,
  },
  {
    id: "mock-2",
    slug: "yen-tinh-che-can-gio-100g",
    name: "Yến tinh chế Cần Giờ 100g",
    images: ["/images/p2.png"],
    price: 6500000,
    description: "Yến tinh chế Cần Giờ, bổ dưỡng, tăng cường sức đề kháng, trọng lượng 100g.",
    weight: 100,
    type: "Yến tinh chế",
    quantity: 10,
    reviews: [],
    sold: 0,
  },
  {
    id: "mock-3",
    slug: "yen-tinh-che-kien-giang-200g",
    name: "Yến tinh chế Kiên Giang 200g",
    images: ["/images/p3.png"],
    price: 12000000,
    description: "Yến tinh chế Kiên Giang, chất lượng cao, trọng lượng 200g.",
    weight: 200,
    type: "Yến tinh chế",
    quantity: 5,
    reviews: [],
    sold: 0,
  },
  {
    id: "mock-4",
    slug: "yen-rut-long-nha-trang-50g",
    name: "Yến rút lông Nha Trang 50g",
    images: ["/images/p3.png"],
    price: 4000000,
    description: "Yến rút lông Nha Trang, sạch lông, giữ nguyên dưỡng chất, trọng lượng 50g.",
    weight: 50,
    type: "Yến rút lông",
    quantity: 15,
    reviews: [],
    sold: 0,
  },
  {
    id: "mock-5",
    slug: "to-yen-tho-binh-dinh-50g",
    name: "Tổ yến thô Bình Định 50g",
    images: ["/images/p2.png"],
    price: 3000000,
    description: "Tổ yến thô Bình Định, nguyên chất, chưa qua chế biến, trọng lượng 50g.",
    weight: 50,
    type: "Tổ yến thô",
    quantity: 25,
    reviews: [],
    sold: 0,
  },
];

export default async function ProductsPage() {
  // Fetch products from the database
  const dbProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  // Map DB fields to ProductCard props
  const products = dbProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    images: p.images,
    price: Number(p.price),
    description: p.description,
    weight: (() => {
      if (p.name.includes("50g")) return 50;
      if (p.name.includes("100g")) return 100;
      if (p.name.includes("200g")) return 200;
      return 50;
    })(),
    type: (() => {
      if (p.name.includes("tinh chế")) return "Yến tinh chế";
      if (p.name.includes("rút lông")) return "Yến rút lông";
      if (p.name.includes("thô")) return "Tổ yến thô";
      return "Khác";
    })(),
    quantity: p.quantity,
    reviews: [],
    sold: 0,
  }));
  const displayProducts = products.length > 0 ? products : mockProducts;
  return <ProductsClient products={displayProducts} />;
} 