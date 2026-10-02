// src/features/auth/components/AuthField.jsx
import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthField = forwardRef(({ label, icon: Icon, error, type = "text", hint, ...rest }, ref) => {
    const id = useId();
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="ml-1 text-[13px] font-bold text-gray-300">
                {label}
            </label>

            <div className="group relative">
                {Icon && (
                    <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-brand-red" />
                )}

                <input
                    id={id}
                    ref={ref}
                    type={isPassword && show ? "text" : type}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-err` : undefined}
                    className={`h-[54px] w-full rounded-xl border bg-[#241E1E] py-4 pr-12 text-white placeholder-gray-600 outline-none transition-all focus:border-brand-red focus:ring-1 focus:ring-brand-red ${Icon ? "pl-12" : "pl-5"
                        } ${error ? "border-red-500" : "border-white/5"}`}
                    {...rest}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-label={show ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>

            {error ? (
                <p id={`${id}-err`} className="ml-1 text-xs font-medium text-red-400">{error}</p>
            ) : (
                hint && <p className="ml-1 text-[11px] font-medium text-gray-500">{hint}</p>
            )}
        </div>
    );
});

AuthField.displayName = "AuthField";
export default AuthField;
