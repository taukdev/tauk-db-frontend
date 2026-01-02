// ActiveList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Search } from "lucide-react";
import CustomTextField from "../CustomTextField";
import tableHeaderIcon from "../../assets/icons/t-header-icon.svg";
import { Link, useParams } from "react-router-dom";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import SearchBox from "../SearchBox";
import Pagination from "../common/Pagination";
// <-- import the shared Checkbox component
import Checkbox from "../common/Checkbox";
import { getVendorListsApi } from "../../api/vendors";
import LoadingSpinner from "../common/LoadingSpinner";

/* Inline LeadCountRangeDropdown (kept as provided) */
function LeadCountRangeDropdown() {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center border rounded-custom-md bg-neutral-input text-gray-700 focus:outline-none px-3 py-2 text-sm border-default focus:ring-0 focus:border-[#DBDFE9] cursor-pointer"
      >
        <span>Lead Count Range</span>
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className={`ml-2 transform transition-transform cursor-pointer ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-5 flex flex-col gap-3">
          <div className="text-base font-semibold mb-2">Lead Count Range</div>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-1/2 border border-default rounded-custom-md px-3 py-2 text-sm bg-neutral-input focus:outline-none cursor-pointer"
            />
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-1/2 border border-default rounded-custom-md px-3 py-2 text-sm bg-neutral-input focus:outline-none cursor-pointer"
            />
          </div>
          <button
            className="w-full py-2 rounded-custom-md bg-gradient-primary text-white font-semibold cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Set
          </button>
        </div>
      )}
    </div>
  );
}

const ActiveList = ({ title = "Active Lists" }) => {
  const dispatch = useDispatch();
  const vendorsData = useSelector((state) => state.vendors.vendors || []);
  
  // Ensure vendors is always an array
  const vendors = Array.isArray(vendorsData) ? vendorsData : [];
  
  // State for selected vendor
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  
  // Initialize selected vendor on mount or when vendors change
  useEffect(() => {
    if (vendors.length > 0 && !selectedVendorId) {
      // Set first vendor as default
      setSelectedVendorId(vendors[0]?.id);
    }
  }, [vendors, selectedVendorId]);
  
  // Get selected vendor object
  const selectedVendor = vendors.find(v => String(v.id) === String(selectedVendorId)) || vendors[0] || null;

  // State for vendor lists
  const [vendorLists, setVendorLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch vendor lists for selected vendor (random or first) - fetch all, then filter and paginate client-side
  useEffect(() => {
    const fetchVendorLists = async () => {
      if (!selectedVendorId) {
        setVendorLists([]);
        return;
      }
      
      try {
        setListsLoading(true);
        // Fetch a large number of lists to get all vendor lists
        const res = await getVendorListsApi(1, 1000);

        let rawData = [];

        if (Array.isArray(res)) {
          rawData = res;
        } else if (res?.data && Array.isArray(res.data)) {
          rawData = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          rawData = res.data.data;
        } else if (Array.isArray(res?.data?.lists)) {
          rawData = res.data.lists;
        }

        // Filter lists by selected vendor ID and transform data
        const transformedData = rawData
          .filter((item) => {
            const vendorId = item.vendor_id || item.vendorId || item.created_by || item.createdBy;
            return String(vendorId) === String(selectedVendorId);
          })
          .map((item) => ({
            id: item.id,
            name: item.listName || item.list_name || "-",
            totalLeadCount: item.records || item.sell_times || 0,
            importStats: {
              imported: 0, // These would come from import stats API if available
              failed: 0,
              skipped: 0,
            },
            vendorName: selectedVendor?.name || "Unknown Vendor",
          }));

        setVendorLists(transformedData);
      } catch (error) {
        console.error("Error fetching vendor lists:", error);
        setVendorLists([]);
      } finally {
        setListsLoading(false);
      }
    };

    fetchVendorLists();
  }, [selectedVendorId, selectedVendor?.name]);

  // get vendor by name or fallback to first vendor
  const getVendorById = (vendorName) => {
    if (!Array.isArray(vendors) || vendors.length === 0) {
      return { id: null, name: vendorName || "Unknown Vendor" };
    }
    const defaultVendor = vendors[0] || {};
    const vendor = vendors.find((v) => v.name === vendorName);
    return vendor || { id: defaultVendor.id, name: defaultVendor.name || vendorName || "Unknown Vendor" };
  };

  const handleListClick = (list) => {
    const vendor = getVendorById(list.vendorName);
    dispatch(
      setBreadcrumbs([
        { label: "Vendors", path: "/vendors" },
        {
          label: `${vendor.id} - ${vendor.name}`,
          path: `/vendor/${vendor.id}`,
        },
        {
          label: `${list.id} - ${list.name}`,
          path: `/vendor/${vendor.id}/list/${list.id}`,
        },
      ])
    );
  };

  // UI state
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  // Sorting state
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState(null); 

  const headers = [
    "List ID",
    "List Name",
    "Total Lead Count",
    "Today's Import Stats",
    "Vendors",
  ];

  // map human headers to data keys or accessor functions
  const headerToKey = {
    "List ID": (item) => item.id,
    "List Name": (item) => item.name,
    "Total Lead Count": (item) => item.totalLeadCount,
    "Today's Import Stats": (item) => item.importStats?.imported ?? 0,
    Vendors: (item) => item.vendorName,
  };

  const toggleSort = (head) => {
    if (sortBy !== head) {
      setSortBy(head);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortBy(null);
      setSortDir(null);
    }
    // reset to page 1 when sorting changes
    setCurrentPage(1);
  };

  // comparator that handles numbers and strings
  const comparator = (aVal, bVal) => {
    // Normalize undefined/null
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return -1;
    if (bVal == null) return 1;

    const aNum = Number(aVal);
    const bNum = Number(bVal);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      // numeric compare
      return aNum - bNum;
    }

    // string compare
    return String(aVal).localeCompare(String(bVal), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  // Filtering based on search (name or id)
  const filteredLists = useMemo(() => {
    const q = search?.toString().trim().toLowerCase() || "";
    if (!q) return vendorLists;
    return vendorLists.filter(
      (list) =>
        (list.name || "").toLowerCase().includes(q) ||
        (list.id?.toString() || "").includes(q)
    );
  }, [vendorLists, search]);

  // Sorted data (sort before pagination)
  const sortedLists = useMemo(() => {
    if (!sortBy || !sortDir) return filteredLists;
    const accessor = headerToKey[sortBy] || ((item) => item[sortBy]);
    const sorted = [...filteredLists].sort((a, b) => {
      const aVal = accessor(a);
      const bVal = accessor(b);
      return comparator(aVal, bVal);
    });
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [filteredLists, sortBy, sortDir]);

  // Pagination
  const totalItems = sortedLists.length;
  // handle "Unlimited" if ever passed — here it's always a number
  const effectiveRowsPerPage =
    rowsPerPage === "Unlimited" ? totalItems || 1 : Number(rowsPerPage || 1);
  const totalPages = Math.max(1, Math.ceil(totalItems / effectiveRowsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * effectiveRowsPerPage;
    const end = start + effectiveRowsPerPage;
    return sortedLists.slice(start, end);
  }, [sortedLists, currentPage, effectiveRowsPerPage]);

  // Reset page to 1 when search or rowsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  // Checkbox logic
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedData.map((list) => list.id));
    } else {
      setSelected([]);
    }
  };
  const toggleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="overflow-x-auto lg:overflow-x-visible mt-5">
      <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-5 pt-4 pb-5 lg:pb-0 gap-4 sm:gap-6 w-full">
          {/* Title */}
          <div className="flex-shrink-0 pb-0 sm:pb-5 text-center">
            <p className="text-md text-primary-dark font-semibold">{title}</p>
          </div>

          {/* Filters & Search */}
          <div
            className="
      w-full sm:w-auto mb-4 sm:mt-0
      grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4
      gap-3 sm:gap-4
    "
          >
            {/* Lead Type Dropdown */}
            <div className="w-full">
              <CustomTextField
                size="sm"
                isSelect
                options={[
                  { label: "Lead Types", value: "" },
                  { label: "Total Leads", value: "total" },
                  { label: "Total Abandons Leads", value: "abandons" },
                  { label: "Buyers Leads", value: "buyers" },
                  { label: "Declines Leads", value: "declines" },
                ]}
                name="leadType"
              />
            </div>

            {/* Lead Count Range Dropdown */}
            <div className="w-full">
              <LeadCountRangeDropdown />
            </div>

            {/* Vendor Dropdown */}
            <div className="w-full">
              <CustomTextField
                size="sm"
                isSelect
                options={[
                  { label: "Select Vendor", value: "" },
                  ...vendors.map((vendor) => ({
                    label: `${vendor.id} - ${vendor.name}`,
                    value: String(vendor.id),
                  })),
                ]}
                name="selectedVendor"
                value={selectedVendorId ? String(selectedVendorId) : ""}
                onChange={(e) => {
                  const vendorId = e.target.value;
                  setSelectedVendorId(vendorId ? Number(vendorId) : null);
                  setCurrentPage(1); // Reset to first page when vendor changes
                }}
              />
            </div>

            {/* Search Box */}
            <div className="w-full md:col-span-3 lg:col-span-1">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search lists by name or ID"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[700px] md:min-w-full text-sm border-collapse table-fixed">
            <thead>
              <tr className="text-gray-400 bg-neutral-input text-left text-md">
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

                {headers.map((head) => {
                  const isActive = sortBy === head;
                  const ariaSort = isActive
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";

                  return (
                    <th
                      key={head}
                      className="pl-5 pr-2 py-3 border border-light font-normal cursor-pointer select-none"
                      onClick={() => toggleSort(head)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleSort(head);
                        }
                      }}
                      aria-sort={ariaSort}
                    >
                      <div className="flex items-center gap-1">
                        <span>{head}</span>
                        <img
                          src={tableHeaderIcon}
                          alt="Sort"
                          className={`w-4 h-4 transition-transform ${
                            isActive
                              ? sortDir === "asc"
                                ? ""
                                : ""
                              : "opacity-60"
                          }`}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {listsLoading && (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    <LoadingSpinner text="Loading..." size="md" />
                  </td>
                </tr>
              )}

              {!listsLoading && paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    {selectedVendorId ? "No lists found for this vendor" : "No vendor selected"}
                  </td>
                </tr>
              )}

              {!listsLoading && paginatedData.map((list) => (
                <tr key={list.id} className="bg-white">
                  <td className="w-10 text-center px-3 py-6 border border-light">
                    <Checkbox
                      checked={selected.includes(list.id)}
                      onChange={() => toggleSelectOne(list.id)}
                      checkboxSize="w-4 h-4"
                    />
                  </td>
                  <td className="pl-5 py-6 border border-light text-black font-medium">
                    {list.id}
                  </td>
                  <td className="pl-5 py-6 border border-light text-primary font-medium underline decoration-dashed underline-offset-4">
                    <Link
                      to={`/vendor/${getVendorById(list.vendorName).id}/list/${
                        list.id
                      }`}
                      className="cursor-pointer"
                      onClick={() => handleListClick(list)}
                    >
                      {list.name}
                    </Link>
                  </td>
                  <td className="pl-5 py-6 border border-light text-black font-medium">
                    {list.totalLeadCount}
                  </td>
                  <td className="pl-5 py-6 border border-light text-black font-medium">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block border border-light px-2 py-1 rounded-md text-xs font-medium">
                        {list.importStats?.imported ?? 0}
                      </span>
                      <span className="inline-block border border-light px-2 py-1 rounded-md text-xs font-medium text-transparent bg-clip-text bg-gradient-primary">
                        {list.importStats?.failed ?? 0}
                      </span>
                      <span className="inline-block border border-light px-2 py-1 rounded-md text-xs font-medium text-transparent bg-clip-text bg-gradient-primary">
                        {list.importStats?.skipped ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="pl-5 py-6 border border-light text-primary font-medium underline decoration-dashed underline-offset-4">
                    <Link
                      to={`/vendor/${getVendorById(list.vendorName).id}`}
                      className="cursor-pointer"
                      onClick={() => {
                        const vendor = getVendorById(list.vendorName);
                        dispatch(
                          setBreadcrumbs([
                            { label: "Vendors", path: "/vendors" },
                            {
                              label: `${vendor.id} - ${vendor.name}`,
                              path: `/vendor/${vendor.id}`,
                            },
                          ])
                        );
                      }}
                    >
                      {list.vendorName}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - using common Pagination component */}
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

export default ActiveList;
