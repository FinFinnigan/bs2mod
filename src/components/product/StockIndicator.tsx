export function StockIndicator({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <span style={{ color: "var(--color-error)", fontWeight: 700 }}>Sold out</span>;
  }
  if (stock <= 3) {
    return <span style={{ color: "var(--color-warn)", fontWeight: 700 }}>Only {stock} left!</span>;
  }
  return <span style={{ color: "var(--color-ok)", fontWeight: 700 }}>In stock</span>;
}
