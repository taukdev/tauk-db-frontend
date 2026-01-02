  // Pagination.jsx
  import React from "react";
  import Dropdown from "./Dropdown";

  const Pagination = ({
    currentPage = 1,
    rowsPerPage = 10,
    totalItems = 0,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 20, "Unlimited"],
  }) => {
    //Normalize values
    const page = Math.max(1, Number(currentPage) || 1);
    const isUnlimited = rowsPerPage === "Unlimited";
    const perPage = isUnlimited ? totalItems || 1 : Number(rowsPerPage);

    // Total pages
    const totalPages = isUnlimited
      ? 1
      : Math.max(1, Math.ceil(totalItems / perPage));

    //Clamp page within range
    const safePage = Math.min(page, totalPages);

    // Index calculation
    const startIndex =
      totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;

    const endIndex = Math.min(safePage * perPage, totalItems);

    // Arrow disable logic
    const isPrevDisabled = safePage <= 1;
    const isNextDisabled = safePage >= totalPages;

    return (
      <div className="flex flex-wrap justify-between items-center px-5 py-4 text-sm text-[#78829D] gap-3">

        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span>Show</span>

          <Dropdown
            value={rowsPerPage}
            options={rowsPerPageOptions}
            className="min-w-[80px]"
            onChange={(val) => {
              onRowsPerPageChange(val);
              onPageChange(1);
            }}
          />

          <span>per page</span>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {totalItems === 0
              ? "0 of 0"
              : `${startIndex}–${endIndex} of ${totalItems}`}
          </span>

          {/* Prev */}
          <button
            disabled={isPrevDisabled}
            onClick={() => !isPrevDisabled && onPageChange(safePage - 1)}
            className={`px-2 py-1 rounded-md ${
              isPrevDisabled
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100"
            }`}
          >
            ←
          </button>

          {/* Page Numbers (hide if unlimited) */}
          {!isUnlimited && (
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1 rounded-md cursor-pointer ${
                      p === safePage
                        ? "bg-[#F1F1F4] text-black font-medium"
                        : "text-gray-600 hover:bg-[#F1F1F4]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
          )}

          {/* Next */}
          <button
            disabled={isNextDisabled}
            onClick={() => !isNextDisabled && onPageChange(safePage + 1)}
            className={`px-2 py-1 rounded-md ${
              isNextDisabled
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100"
            }`}
          >
            →
          </button>
        </div>
      </div>
    );
  };

  export default Pagination;
