// DailyDeliveryBreakdown.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

import tableHeaderIcon from "../../../assets/icons/t-header-icon.svg";

const DailyDeliveryBreakdown = ({ dailyBreakdown, loading }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // Filtered data
  const filteredData = useMemo(
    () =>
      dailyBreakdown.filter(
        (item) =>
          item.date.includes(search) ||
          item.leadsDelivered.toString().includes(search)
      ),
    [dailyBreakdown, search]
  );

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / rowsPerPage),
    [filteredData.length, rowsPerPage]
  );

  const paginatedData = useMemo(
    () =>
      filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      ),
    [filteredData, currentPage, rowsPerPage]
  );

  // Reset page when search or rowsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  // Clamp currentPage
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E4E6EF] shadow-sm p-4 sm:p-5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E4E6EF] rounded-custom-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-3">
        <h2 className="text-sm font-semibold text-black">
          Daily Delivery Breakdown
        </h2>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E4E6EF] bg-white rounded-md pl-8 pr-3 py-2 text-sm text-secondary focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="text-secondary bg-neutral-input text-left text-[13px]">

              <th className="px-5 py-3 border border-light">
                <div className="flex items-center gap-2 font-normal">
                  Date <img src={tableHeaderIcon} alt="Sort" />
                </div>
              </th>

              <th className="px-5 py-3 border border-light">
                <div className="flex items-center gap-2 font-normal">
                  Leads Delivered
                  <img src={tableHeaderIcon} alt="Sort" />
                </div>  
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className="bg-white hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-6 border border-light text-[#071437] font-medium">
                    {item.date}
                  </td>
                  <td className="px-5 py-6 border border-light text-primary-dark">
                    <span className="text-primary font-medium underline decoration-dashed underline-offset-4 cursor-pointer hover:text-[#0066CC] transition-colors">
                      {item.leadsDelivered}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="text-center py-6 text-gray-500 border border-light"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 text-sm text-secondary gap-3">
        {/* Rows per page */}
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <span className="bg-secondary-light">Show</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-[#E4E6EF] rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {[12, 24, 48].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="bg-secondary-light">per page</span>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <span className="text-gray-500">
            {filteredData.length > 0
              ? `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(
                currentPage * rowsPerPage,
                filteredData.length
              )} of ${filteredData.length}`
              : "0 of 0"}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-1 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              ←
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm ${page === currentPage
                    ? "bg-[#F1F1F4] text-font"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-1 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>                                      
  );
};

export default DailyDeliveryBreakdown;
