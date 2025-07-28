import ProductsClient from "@/components/ProductsClient";
import { productsApi, Product } from "@/lib/api-service";

const FALLBACK_IMAGE = "/images/placeholder.png";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  try {
    console.log('🔍 Fetching products from API...');
    
    // Await searchParams before accessing its properties
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const search = params.search || '';
    
    // Fetch products from the API with pagination
    const response = await productsApi.getProducts({
      page,
      limit: 8,
      search: search || undefined,
    });
    console.log('📦 API Response:', response);
    
    const products = response.products || response.data?.products || [];
    console.log('📋 Products found:', products.length);
    
    // Map API products to UI format
    const uiProducts = products.map((product: Product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      images: product.images?.map((img: { url: string }) => img.url) || [FALLBACK_IMAGE],
      price: product.price,
      description: product.description,
      weight: (() => {
        if (product.name.includes("50g")) return 50;
        if (product.name.includes("100g")) return 100;
        if (product.name.includes("200g")) return 200;
        return 50;
      })(),
      type: (() => {
        if (product.name.includes("tinh chế")) return "Yến tinh chế";
        if (product.name.includes("rút lông")) return "Yến rút lông";
        if (product.name.includes("thô")) return "Tổ yến thô";
        return "Khác";
      })(),
      quantity: product.quantity || 0,
      reviews: product.reviews || [],
      sold: 0,
    }));

    console.log('🎯 UI Products mapped:', uiProducts.length);
    return <ProductsClient initialProducts={uiProducts} />;
  } catch (error) {
    console.error('❌ Failed to fetch products:', error);
    // Return empty products on error
    return <ProductsClient initialProducts={[]} />;
  }
} 