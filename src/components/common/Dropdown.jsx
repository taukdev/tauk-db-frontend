import React, { useEffect, useRef, useState } from "react";
import ArrowIcon from "/src/assets/vector.svg";

export default function Dropdown({
  value,
  onChange,
  placeholder = "Select",
  options = [],
  className = "",
  placement = "auto", // "auto" | "top" | "bottom"
}) {
  const [open, setOpen] = useState(false);
  const [calculatedPlacement, setCalculatedPlacement] = useState(placement);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Determine placement based on available space when needed
  useEffect(() => {
    function updatePlacement() {
      if (!ref.current) return;
      if (placement !== "auto") {
        setCalculatedPlacement(placement);
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Estimated needed dropdown height (you can tweak this)
      const needed = Math.min(300, options.length * 36 + 8); // approx per item
      // Prefer bottom if it fits, otherwise top if that fits better
      if (spaceBelow >= needed || spaceBelow >= spaceAbove) {
        setCalculatedPlacement("bottom");
      } else {
        setCalculatedPlacement("top");
      }
    }

    // Recompute when menu opens, and on resize/scroll
    if (open) updatePlacement();
    window.addEventListener("resize", updatePlacement);
    // use capture so scrolling inside parent is also caught
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open, placement, options.length]);

  const displayLabel = !value || value === "All" ? placeholder : value;

  const listPositionClasses =
    calculatedPlacement === "top" ? "bottom-full mb-1" : "top-full mt-1";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          appearance-none
          w-full
          rounded-xl
          border border-gray-300
          pl-4 pr-8 py-2
          text-sm
          text-gray-700
          text-left
          focus:outline-none
          focus:ring focus:ring-indigo-200
          cursor-pointer
        "
      >
        {displayLabel}
      </button>

      <img
        src={ArrowIcon}
        alt="arrow"
        className={`w-[10px] h-[5px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150 ${
          open ? "rotate-180" : "rotate-0"
        }`}
      />

      {open && (
        <div
          className={`
            absolute left-0 right-0
            bg-white
            border border-gray-200
            rounded-xl
            z-20
            ${listPositionClasses}
            max-h-60
            overflow-auto
            shadow-md
          `}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 text-sm cursor-pointer
                hover:bg-gray-100
                ${value === opt ? "bg-gray-100 font-medium text-black" : "text-gray-600"}
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
