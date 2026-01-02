// PlatformOrders.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import DangerCircleIcon from '../../../assets/icons/Danger-Circle.svg';
import tableHeaderIcon from "../../../assets/icons/t-header-icon.svg";
import cloudUploadIcon from "../../../assets/icons/cloud-upload.svg";
import Pagination from "../../common/Pagination"; // <- adjust path if needed
import LoadingSpinner from "../../common/LoadingSpinner";
import { fetchPlatformOrders } from "../../../features/platform/platformOrdersSlice";

const PlatformOrders = ({ platformId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (platformId) {
      dispatch(fetchPlatformOrders(platformId));
    }
  }, [dispatch, platformId]);

  //  Select from redux slice
  const orders = useSelector((state) => state.platformOrders?.orders || []);
  const loading = useSelector((state) => state.platformOrders?.loading || false);
  const error = useSelector((state) => state.platformOrders?.error || null);

  // Local UI state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting state
  const [sortBy, setSortBy] = useState(null); // header label string
  const [sortDir, setSortDir] = useState(null); // "asc" | "desc" | null

  // Headers and accessors: only include accessors for sortable columns
  const headers = [
    "Order ID",
    "Time Entered",
    "Leads Delivered",
    "Order Type",
    "Post Status",
  ];

  const headerToAccessor = {
    "Order ID": (o) => o.id,
    "Time Entered": (o) => o.timeEntered,
    "Leads Delivered": (o) => o.leadsDelivered,
    "Order Type": (o) => o.orderType,
    "Post Status": (o) => o.postStatus,
  };

  // Filtered orders - memoized to prevent unnecessary rerenders
  const filteredOrders = useMemo(() => {
    const q = (search || "").toString().trim().toLowerCase();
    if (!q) return orders || [];
    return (orders || []).filter(
      (o) =>
        (o.id?.toString() || "").includes(q) ||
        (o.orderType || "").toLowerCase().includes(q)
    );
  }, [orders, search]);

  // comparator: dates > numbers > strings
  const comparator = (aVal, bVal) => {
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return -1;
    if (bVal == null) return 1;

    // try date
    const aDate = Date.parse(aVal);
    const bDate = Date.parse(bVal);
    const aIsDate = !Number.isNaN(aDate);
    const bIsDate = !Number.isNaN(bDate);
    if (aIsDate && bIsDate) return aDate - bDate;

    // numeric
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;

    // fallback to string compare
    return String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
  };

  // Sort before pagination
  const sortedOrders = useMemo(() => {
    if (!sortBy || !sortDir) return filteredOrders;
    const accessor = headerToAccessor[sortBy] || ((x) => x[sortBy]);
    const s = [...filteredOrders].sort((a, b) => comparator(accessor(a), accessor(b)));
    return sortDir === "asc" ? s : s.reverse();
  }, [filteredOrders, sortBy, sortDir]);

  // Pagination - memoized
  const totalItems = sortedOrders.length;
  const totalPages = useMemo(() => Math.ceil(totalItems / rowsPerPage), [totalItems, rowsPerPage]);

  const paginatedData = useMemo(
    () =>
      sortedOrders.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      ),
    [sortedOrders, currentPage, rowsPerPage]
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

  // Toggle sort: none -> asc -> desc -> none
  const toggleSort = (head) => {
    if (!headerToAccessor[head]) return; // not sortable
    if (sortBy !== head) {
      setSortBy(head);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortBy(null);
      setSortDir(null);
    }
    setCurrentPage(1);
  };

  // Status style mapping
  const statusStyles = {
    Active: "bg-green-100 text-green-600 border border-[#17C65333] ",
    Archived: "bg-yellow-100 text-yellow-600 border border-[#F6B10033]",
    Inactive: "bg-red-100 text-red-600 border border-[#F6B10033]",
  };

  // Handle order ID click
  const handleOrderClick = (orderId) => {
    if (!orderId || !platformId) {
      console.error("Missing orderId or platformId:", { orderId, platformId });
      return;
    }
    navigate(`/platform/${platformId}/orders/${orderId}`);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 px-2 xs:py-3 xs:px-3 sm:py-4 sm:px-5 gap-2 xs:gap-3">
          <h2 className="text-sm xs:text-base sm:text-lg font-semibold text-primary-dark">
            Platform Orders
          </h2>

          {/* Search */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search orders by ID or type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Platform Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm border-collapse">
            <thead>
              <tr className="text-[#4B5675] bg-neutral-input text-left text-xs">
                {headers.map((head) => {
                  const sortable = !!headerToAccessor[head];
                  const isActive = sortBy === head;
                  const ariaSort = isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none";

                  return (
                    <th
                      key={head}
                      className={`pl-5 pr-2 py-3 border border-light font-normal ${sortable ? "cursor-pointer select-none" : ""}`}
                      onClick={() => sortable && toggleSort(head)}
                      role={sortable ? "button" : undefined}
                      tabIndex={sortable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (sortable && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          toggleSort(head);
                        }
                      }}
                      aria-sort={sortable ? ariaSort : undefined}
                    >
                      <div className="flex gap-1 items-center">
                        <span>{head}</span>
                        <img
                          src={tableHeaderIcon}
                          alt="Sort"
                          className={`w-4 h-4 transition-transform ${isActive ? (sortDir === "asc" ? "rotate-0" : "rotate-0") : "opacity-60"}`}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 border border-light"
                  >
                    <LoadingSpinner text="Loading orders..." size="md" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 border border-light"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img src={DangerCircleIcon} alt="Error" className="w-8 h-8" />
                      <p className="text-red-600 font-medium">Error loading orders</p>
                      <p className="text-sm text-gray-500">{typeof error === 'string' ? error : 'Failed to fetch platform orders'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((order) => (
                  <tr
                    key={order.id}
                    className="w-full bg-white hover:bg-gray-50 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="pl-5 py-4 border border-light text-primary font-medium underline decoration-dashed underline-offset-4">
                      <span
                        className="cursor-pointer hover:text-[#0066CC] transition-colors"
                        onClick={() => handleOrderClick(order.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOrderClick(order.id);
                          }
                        }}
                      >
                        {order.id || 'N/A'}
                      </span>
                    </td>

                    {/* Time Entered */}
                    <td className="pl-5 py-4 border border-light text-[#071437] font-medium">
                      {order.timeEntered}
                    </td>

                    {/* Leads Delivered */}
                    <td className="px-5 py-4 border border-light text-[#071437] font-medium">
                      <div className="flex items-center justify-between gap-2">
                        <span>{order.leadsDelivered}</span>
                        <img
                          src={cloudUploadIcon}
                          alt="Upload"
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </td>

                    {/* Order Type */}
                    <td className="px-5 py-4 border border-light text-[#071437] font-medium">
                      <div className="flex items-center justify-between gap-2">
                        <span>{order.orderType}</span>
                        <img
                          src={DangerCircleIcon}
                          alt="Upload"
                          className="w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </td>

                    {/* Post Status */}
                    <td className="pl-5 py-4 border border-light">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.postStatus] || "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {order.postStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500 border border-light"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Platform Pagination - reusable component */}
        <Pagination
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={(page) => setCurrentPage(page)}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setCurrentPage(1);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
};

export default PlatformOrders;
