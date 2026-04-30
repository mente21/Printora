import { redirect } from "next/navigation";

const PRODUCT_TYPE_ALIASES = {
  tshirt: "t-shirts",
  "t-shirt": "t-shirts",
  tshirts: "t-shirts",
  hoodie: "hoodies",
  cap: "hats",
  phone: "phone-cases",
  poster: "posters",
};

export default async function ProductTypeRoute({ params }) {
  const resolvedParams = await params;
  const rawType = resolvedParams?.type || "";
  const normalizedType = PRODUCT_TYPE_ALIASES[rawType] || rawType;

  redirect(`/products?type=${normalizedType}`);
}
