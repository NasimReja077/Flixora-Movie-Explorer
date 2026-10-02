// src/components/OtpInput.jsx
import { useEffect, useRef, useState } from "react";

/**
 * 6-box OTP input. Supports typing, backspace, arrow keys and pasting a full code.
 * onChange receives the joined string, e.g. "483920".
 */
const OtpInput = ({ length = 6, onChange, error, disabled }) => {
    const [digits, setDigits] = useState(() => Array(length).fill(""));
    const refs = useRef([]);

    useEffect(() => {
        refs.current[0]?.focus();
    }, []);

    const update = (next) => {
        setDigits(next);
        onChange?.(next.join(""));
    };

    const handleChange = (i, e) => {
        const d = e.target.value.replace(/\D/g, "").slice(-1);
        if (!d) return;
        const next = [...digits];
        next[i] = d;
        update(next);
        if (i < length - 1) refs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const next = [...digits];
            if (next[i]) {
                next[i] = "";
                update(next);
            } else if (i > 0) {
                next[i - 1] = "";
                update(next);
                refs.current[i - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && i > 0) {
            refs.current[i - 1]?.focus();
        } else if (e.key === "ArrowRight" && i < length - 1) {
            refs.current[i + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!text) return;
        const next = Array(length).fill("");
        text.split("").forEach((d, i) => (next[i] = d));
        update(next);
        refs.current[Math.min(text.length, length - 1)]?.focus();
    };

    return (
        <div>
            <div className="flex justify-between gap-2" role="group" aria-label="One-time code">
                {digits.map((d, i) => (
                    <input
                        key={i}
                        ref={(el) => (refs.current[i] = el)}
                        value={d}
                        disabled={disabled}
                        inputMode="numeric"
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        aria-label={`Digit ${i + 1}`}
                        onChange={(e) => handleChange(i, e)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        className={`h-14 w-full min-w-0 rounded-xl border bg-[#241E1E] text-center text-xl font-bold text-white outline-none transition-all focus:border-brand-red focus:ring-1 focus:ring-brand-red disabled:opacity-50 ${error ? "border-red-500" : "border-white/10"
                            }`}
                    />
                ))}
            </div>
            {error && <p role="alert" className="mt-2 text-xs font-medium text-red-400">{error}</p>}
        </div>
    );
};

export default OtpInput;