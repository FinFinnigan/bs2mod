import { IconStar } from "./icons";

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="stars" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar key={n} size={size} filled={n <= rounded} />
      ))}
    </span>
  );
}
