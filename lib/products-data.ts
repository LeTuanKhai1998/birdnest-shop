import { Product } from "@/components/ProductCard";

export const products: Product[] = [
  {
    name: "Premium Refined Birdnest 50g",
    images: ["/images/p1.png", "/images/p2.png", "/images/p3.png"],
    price: 2500000,
    description: "High quality, ready-to-cook refined birdnest from Kien Giang.",
    weight: 50,
    type: "Refined Nest",
    quantity: 12,
    reviews: [
      { user: "Nguyen Van A", rating: 5, comment: "Sản phẩm rất chất lượng, đóng gói đẹp." },
      { user: "Tran Thi B", rating: 4, comment: "Yến ngon, giao hàng nhanh." }
    ]
  },
  {
    name: "Raw Birdnest 100g",
    images: ["/images/p2.png", "/images/p3.png", "/images/p1.png"],
    price: 4200000,
    description: "Raw, natural birdnest, carefully selected and packed.",
    weight: 100,
    type: "Raw Nest",
    quantity: 0,
    reviews: [
      { user: "Le Minh C", rating: 5, comment: "Yến thô nguyên chất, rất hài lòng." },
      { user: "Pham Thi D", rating: 3, comment: "Chất lượng ổn, giá hơi cao." }
    ]
  },
  {
    name: "Feather-removed Birdnest 200g",
    images: ["/images/p3.png", "/images/p1.png", "/images/p2.png"],
    price: 7900000,
    description: "Feather-removed, premium birdnest for health and gifting.",
    weight: 200,
    type: "Feather-removed Nest",
    quantity: 7,
    reviews: [
      { user: "Vo Quoc E", rating: 4, comment: "Yến sạch, tiện lợi cho chế biến." },
      { user: "Nguyen Thi F", rating: 5, comment: "Rất thích hợp làm quà tặng." }
    ]
  },
  {
    name: "Premium Refined Birdnest 100g",
    images: ["/images/p1.png"],
    price: 4800000,
    description: "Premium refined birdnest, 100g pack.",
    weight: 100,
    type: "Refined Nest",
    quantity: 10,
  },
  {
    name: "Raw Birdnest 50g",
    images: ["/images/p2.png"],
    price: 2100000,
    description: "Raw birdnest, 50g pack.",
    weight: 50,
    type: "Raw Nest",
    quantity: 10,
  },
  {
    name: "Feather-removed Birdnest 100g",
    images: ["/images/p3.png"],
    price: 3900000,
    description: "Feather-removed birdnest, 100g pack.",
    weight: 100,
    type: "Feather-removed Nest",
    quantity: 10,
  },
  {
    name: "Premium Refined Birdnest 200g",
    images: ["/images/p1.png"],
    price: 9500000,
    description: "Premium refined birdnest, 200g pack.",
    weight: 200,
    type: "Refined Nest",
    quantity: 10,
  },
  {
    name: "Raw Birdnest 200g",
    images: ["/images/p2.png"],
    price: 8200000,
    description: "Raw birdnest, 200g pack.",
    weight: 200,
    type: "Raw Nest",
    quantity: 10,
  },
  {
    name: "Feather-removed Birdnest 50g",
    images: ["/images/p3.png"],
    price: 2100000,
    description: "Feather-removed birdnest, 50g pack.",
    weight: 50,
    type: "Feather-removed Nest",
    quantity: 10,
  },
  // Combos (from homepage)
  {
    name: "Combo 1",
    images: ["/images/p1.png"],
    price: 6500000,
    description: "Combo yến cao cấp, tiết kiệm hơn.",
    weight: 150,
    type: "Combo",
    quantity: 10,
  },
  {
    name: "Combo 2",
    images: ["/images/p2.png"],
    price: 7000000,
    description: "Combo yến đa dạng, phù hợp làm quà tặng.",
    weight: 200,
    type: "Combo",
    quantity: 10,
  },
  // Homepage products
  {
    name: "Yến tinh chế Khánh Hòa",
    images: ["/images/p1.png"],
    price: 3500000,
    weight: 50,
    description: "Yến tinh chế chất lượng cao từ Khánh Hòa.",
    type: "Refined Nest",
    quantity: 10,
  },
  {
    name: "Yến rút lông Nha Trang",
    images: ["/images/p2.png"],
    price: 4000000,
    weight: 100,
    description: "Yến rút lông tự nhiên, đóng gói tại Nha Trang.",
    type: "Raw Nest",
    quantity: 10,
  },
  {
    name: "Tổ yến thô Bình Định",
    images: ["/images/p3.png"],
    price: 3000000,
    weight: 200,
    description: "Tổ yến thô nguyên chất từ Bình Định.",
    type: "Feather-removed Nest",
    quantity: 10,
  },
]; 