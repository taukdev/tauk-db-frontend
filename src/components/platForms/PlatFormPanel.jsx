import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Search } from "lucide-react";
import CustomTitle from "../CustomTitle";
import AddPlatformForm from "./AddPlatform";
import { fetchPlatforms } from "../../features/platform/platformSlice";

import tableHeaderIcon from "../../assets/icons/t-header-icon.svg";
import tableSerchIcon from "../../assets/icons/table-search-icon.svg";
import plusIcon from "../../assets/icons/plus-icon.svg";
import { Link, useNavigate } from "react-router-dom";
import CustomButton from "../CustomButton";
import Pagination from "../common/Pagination"; // adjust path if needed

// <-- common Checkbox import
import Checkbox from "../common/Checkbox";
import LoadingSpinner from "../common/LoadingSpinner";

const PlateFormPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { platforms, loading, error } = useSelector((state) => state.platform || { platforms: [] });

  useEffect(() => {
    dispatch(fetchPlatforms());
  }, [dispatch]);

  // Local UI state
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting state
  const [sortBy, setSortBy] = useState(null); // header label
  const [sortDir, setSortDir] = useState(null); // "asc" | "desc" | null

  // Filtered data (safe)
  const filteredPlatforms = useMemo(() => {
    const q = (search || "").toString().trim().toLowerCase();
    if (!q) return platforms || [];
    return (platforms || []).filter(
      (p) =>
        (p.platform_name || p.name || "").toLowerCase().includes(q) ||
        (p.id?.toString() || "").includes(q)
    );
  }, [platforms, search]);


  // Headers & accessors
  const headers = [
    "Platform ID",
    "Platform Name",
    "Entered On",
    "Status",
    "Send Leads",
  ];

  // only headers present in this map will be sortable
  const headerToAccessor = {
    "Platform ID": (p) => p.id,
    "Platform Name": (p) => p.platform_name || p.name,
    "Entered On": (p) => p.entered_on || p.enteredOn || p.created_at,
    Status: (p) => p.status,
    // "Send Leads" intentionally not sortable
  };

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
  const sortedPlatforms = useMemo(() => {
    if (!sortBy || !sortDir) return filteredPlatforms;
    const accessor = headerToAccessor[sortBy];
    const sorted = [...filteredPlatforms].sort((a, b) => comparator(accessor(a), accessor(b)));
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [filteredPlatforms, sortBy, sortDir]);

  // Pagination logic
  const totalItems = sortedPlatforms.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedPlatforms.slice(start, end);
  }, [sortedPlatforms, currentPage, rowsPerPage]);

  // Reset page when search or rowsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  // Clamp currentPage if it’s greater than totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  // Checkbox handlers
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected((prev) => [
        ...new Set([...prev, ...paginatedData.map((p) => p.id)]),
      ]);
    } else {
      setSelected((prev) =>
        prev.filter((id) => !paginatedData.some((p) => p.id === id))
      );
    }
  };

  const toggleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Status style mapping
  const statusStyles = {
    Active: "bg-green-100 text-green-600 border border-[#17C65333]",
    Pending: "bg-yellow-100 text-yellow-600 border border-[#F6B10033]",
    Inactive: "bg-red-100 text-red-600 border border-[#FF000033]",
  };

  const dotColors = {
    Active: "bg-green-500",
    Pending: "bg-yellow-500",
    Inactive: "bg-red-500",
  };

  if (loading && platforms.length === 0) {
    return (
      <div className="p-10 text-center">
        <LoadingSpinner text="Loading platforms..." size="md" />
      </div>
    );
  }

  if (error && platforms.length === 0) {
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto lg:overflow-x-visible">
      <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 px-5 gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search lists by name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <Link to="/platforms/add" className="w-full sm:w-auto">
            <CustomButton
              type="button"
              fullWidth={false}
              className="gap-1 flex items-center justify-center sm:justify-start w-full"
            >
              <img src={plusIcon} alt="plus logo" />
              Add Platform
            </CustomButton>
          </Link>

        </div>

        {/* Table Wrapper with Always Scrollable X */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[800px] md:min-w-full text-sm border-collapse table-fixed">
            <thead>
              <tr className="text-[#4B5675] bg-neutral-input text-left text-xs">
                {/* Checkbox Header */}
                <th className="w-10 text-center px-3 py-3 border border-light">
                  <Checkbox
                    checked={
                      selected.length === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={toggleSelectAll}
                    checkboxSize="w-4 h-4"
                  />
                </th>

                {/* Dynamic Headers */}
                {headers.map((head) => {
                  const sortable = !!headerToAccessor[head];
                  const isActive = sortBy === head;
                  const ariaSort = isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none";

                  return (
                    <th
                      key={head}
                      className={`pl-4 pr-4 py-3 border border-light font-normal ${sortable ? "cursor-pointer select-none" : ""}`}
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
              {paginatedData.length > 0 ? (
                paginatedData.map((platform) => {
                  const displayStatus = platform.is_active ? "Active" : "Inactive";
                  return (
                    <tr key={platform.id} className="bg-white">
                      {/* Checkbox */}
                      <td className="w-10 text-center px-3 py-6 border border-light">
                        <Checkbox
                          checked={selected.includes(platform.id)}
                          onChange={() => toggleSelectOne(platform.id)}
                          checkboxSize="w-4 h-4"
                        />
                      </td>

                      {/* Platform ID */}
                      <td className="pl-4 py-6 border border-light text-[#071437] font-medium">
                        {platform.id}
                      </td>

                      {/* Platform Name */}
                      <td className="pl-4 py-6 border border-light text-primary font-medium underline decoration-dashed underline-offset-4">
                        <Link to={`/platforms/${platform.id}`}>
                          <span className="cursor-pointer">
                            {platform.platform_name || platform.name}
                          </span>
                        </Link>
                      </td>

                      {/* Entered On */}
                      <td className="pl-4 py-6 border border-light text-[#071437] font-medium">
                        {platform.entered_on ||
                          platform.enteredOn ||
                          platform.created_at}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-6 border border-light">
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full border border-[#17C65333] text-xs w-fit ${statusStyles[displayStatus] ||
                            "bg-gray-100 text-gray-600"
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${dotColors[displayStatus] || "bg-gray-400"
                              }`}
                          ></span>
                          {displayStatus}
                        </span>
                      </td>

                      {/* Send Leads */}
                      <td className="p-3 border border-light text-primary-dark">
                        <img
                          src={tableSerchIcon}
                          alt="Search"
                          className="cursor-pointer"
                          onClick={() => navigate(`/platforms/${platform.id}/send-leads`)}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-6 text-gray-500 border border-light"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer - reusable component */}
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

export default PlateFormPanel;
