import LogoMark from "./LogoMark";

export default function Logo({ className = "", dark = false, withMark = false }) {
    const base = dark ? "text-white" : "text-carbon";
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            {withMark && <LogoMark inverted={dark} />}
            <div className="leading-none">
                <div className="font-display font-black text-2xl tracking-[-0.03em]">
                    <span className={base}>GENESIS</span>
                    <span className="text-brand">.</span>
                </div>
                <div className="text-[10px] font-semibold text-brand-ink tracking-[0.22em] mt-0.5">
                    INVESTMENT
                </div>
            </div>
        </div>
    );
}
