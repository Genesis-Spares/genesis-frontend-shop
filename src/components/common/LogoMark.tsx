export default function LogoMark({ size = 44, inverted = false }) {
    return (
        <span
            className={`rounded-xl flex items-center justify-center shrink-0 ${inverted ? "bg-white" : "bg-carbon"
                }`}
            style={{ width: size, height: size }}
        >
            <span
                className={`font-display font-black text-xl italic ${inverted ? "text-carbon" : "text-brand"}`}
            >
                G
            </span>
        </span>
    );
}
