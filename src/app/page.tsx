import { QuoteApp } from "@/components/quote/quote-app";
import { getQuoteItems } from "@/lib/paint-items";

export default async function HomePage() {
  const items = await getQuoteItems();

  return <QuoteApp items={items} />;
}
