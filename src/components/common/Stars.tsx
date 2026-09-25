import { Star } from "lucide-react";

export default function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            <div className="flex text-brand">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        size={13}
                        fill={rating >= i ? "currentColor" : rating >= i - 0.5 ? "currentColor" : "none"}
                        strokeWidth={1.5}
                        className={rating >= i - 0.5 ? "" : "text-line-strong"}
                    />
                ))}
            </div>
        </div>
    );
}
