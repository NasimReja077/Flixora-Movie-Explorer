import { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuCheck } from "react-icons/lu";

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select options",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-xl bg-[#1f1f22] border border-white/10 px-4 py-3 text-sm text-white cursor-pointer focus:border-[#d62b70] focus:ring-1 focus:ring-[#d62b70] outline-none transition-all"
      >
        <span className={selected.length === 0 ? "text-[#94a3b8]/60" : ""}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <LuChevronDown
          size={16}
          className={`text-[#94a3b8] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-[#d62b70]/15 border border-[#d62b70]/40 px-2.5 py-0.5 text-[10.5px] font-semibold text-[#ffb1c4] capitalize"
            >
              {item}
              <button
                type="button"
                onClick={() => toggleOption(item)}
                className="cursor-pointer hover:text-white"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#16161a] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                type="button"
                key={option}
                onClick={() => toggleOption(option)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] capitalize cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? "bg-[#d62b70]/15 text-[#ffb1c4]"
                    : "text-[#e4e1e6] hover:bg-white/5"
                }`}
              >
                {option}
                {isSelected && <LuCheck size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;