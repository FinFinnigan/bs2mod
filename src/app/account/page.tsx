import { allProducts } from "@/lib/backend/catalog-facade";
import { AccountView } from "@/components/account/AccountView";

export default async function AccountPage() {
  const products = await allProducts();
  return <AccountView products={products} />;
}