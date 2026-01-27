// ImportedData.jsx
import React, { useState, useEffect, useMemo } from "react";
import CustomTextField from "../CustomTextField";
import tableHeaderIcon from "../../assets/icons/t-header-icon.svg";
import NotepadIcon from "../../assets/icons/notepad-icon.svg";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import Pagination from "../common/Pagination"; // adjust path if needed
import { fetchImportedData } from "../../features/outgoing/importedDataSlice";
import { getPlatformsApi } from "../../api/platforms";

// <-- import shared Checkbox
import Checkbox from "../common/Checkbox";
import LoadingSpinner from "../common/LoadingSpinner";

function ImportedData() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const { rows: data, loading, error, pagination } = useSelector((state) => state.importedData || { rows: [], loading: false, error: null, pagination: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedClient, setSelectedClient] = useState("All");
  const [postStatus, setPostStatus] = useState("all");
  const [selected, setSelected] = useState([]);

  // State for client/platforms dropdown
  const [clientOptions, setClientOptions] = useState([
    { label: "Select Platform", value: "All" },
  ]);
  const [clientsLoading, setClientsLoading] = useState(true);

  // Sorting state
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  // Fetch platforms/clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setClientsLoading(true);
        const response = await getPlatformsApi();

        // Handle different response structures
        let platformsData = [];
        if (Array.isArray(response)) {
          platformsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          platformsData = response.data;
        } else if (response?.data?.platforms && Array.isArray(response.data.platforms)) {
          platformsData = response.data.platforms;
        }

        // Format platforms for dropdown - use platform ID as value for API filtering
        const formattedClients = platformsData.map((platform) => ({
          label: platform.platform_name || platform.name || String(platform.id || ""),
          value: String(platform.id || "")
        }));

        setClientOptions([
          { label: "Select Platform", value: "All" },
          ...formattedClients
        ]);
      } catch (error) {
        console.error("Error fetching clients:", error);
        // Keep default option on error
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Fetch data from API
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: rowsPerPage,
    };

    // Add search parameter if provided
    if (search.trim()) {
      params.search = search.trim();
    }

    // Add status filter if not "all"
    if (postStatus !== "all") {
      params.status = postStatus;
    }

    // Add client/platform filter if not "All"
    if (selectedClient && selectedClient !== "All") {
      params.platform_id = selectedClient;
    }

    dispatch(fetchImportedData(params));
  }, [dispatch, currentPage, rowsPerPage, search, postStatus, selectedClient]);

  // Headers (used for rendering)
  const headers = [
    "ID",
    "Platform",
    "Created",
    "Integration",
    "Status",
    "Modify",
  ];

  // accessor map: only headers present here will be sortable
  const headerToAccessor = {
    ID: (r) => r.id,
    Platform: (r) => (typeof r.platform === "string" ? r.platform : r.platform?.name || ""),
    Created: (r) => r.created,
    Integration: (r) => r.integration,
    Status: (r) => r.status,
    // Modify is intentionally not sortable
  };

  // comparator: dates > numbers > strings
  const comparator = (aVal, bVal) => {
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return -1;
    if (bVal == null) return 1;

    // date compare
    const aDate = Date.parse(aVal);
    const bDate = Date.parse(bVal);
    const aIsDate = !Number.isNaN(aDate);
    const bIsDate = !Number.isNaN(bDate);
    if (aIsDate && bIsDate) return aDate - bDate;

    // numeric compare
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;

    // fallback string compare
    return String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
  };

  // Sorted data (client-side sorting only, filtering is handled by API)
  const sortedData = useMemo(() => {
    if (!sortBy || !sortDir) return data || [];
    const accessor = headerToAccessor[sortBy] || ((r) => r[sortBy]);
    const sorted = [...(data || [])].sort((a, b) => comparator(accessor(a), accessor(b)));
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [data, sortBy, sortDir]);

  // Use sorted data directly (pagination is handled by API)
  const paginatedData = sortedData;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, postStatus, selectedClient]);

  // Calculate pagination from API response
  const totalItems = pagination?.total || (data || []).length;
  const totalPages = pagination?.totalPages || Math.ceil(totalItems / rowsPerPage);

  // Checkbox logic
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedData.map((list) => list.id));
    } else {
      setSelected([]);
    }
  };
  const toggleSelectOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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

  return (
    <div className="overflow-x-auto lg:overflow-x-visible">
      <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start sm:items-center pt-4 px-5 gap-3">
          {/* Search (left) */}
          <div className="relative w-full md:w-72 pb- md:pb-4">
            <input
              type="text"
              placeholder="Search posts by name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 bg-neutral-input rounded-xl pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Filters (right) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto flex-wrap pb-4">
            {/* Platform Filter */}
            <div className="w-full sm:w-40">
              <CustomTextField
                isSelect
                options={clientOptions}
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                placeholder={clientsLoading ? "Loading platforms..." : "Platform"}
                size="sm"
                disabled={clientsLoading}
              />
            </div>

            {/* Post Status */}
            <div className="w-full sm:w-40">
              <CustomTextField
                isSelect
                options={[
                  { label: "Post Status", value: "all" },
                  { label: "Active", value: "Active" },
                  { label: "Archived", value: "Archived" },
                  { label: "Paused", value: "Paused" },
                  { label: "Fulfilled", value: "Fulfilled" },
                ]}
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value)}
                placeholder="Post Status"
                size="sm"
              />
            </div>

            {/* Status pill (only shows if filtered) */}
            {postStatus !== "all" && (
              <div className="flex items-center justify-center px-3 py-1 mb- bg-neutral-input text-[#252F4A] text-sm font-normal gap-2 border border-gray-200 rounded-custom-md">
                <span className="bg-secondary-light text-gray-400 font-normal">Post Status:</span>{" "}
                {postStatus}
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600 text-lg font-bold focus:outline-none"
                  onClick={() => setPostStatus("all")}
                  aria-label="Clear status filter"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="w-full text-center py-12">
            <LoadingSpinner text="Loading..." size="md" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="w-full text-center py-12">
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}

        {/* Table Wrapper */}
        {!loading && !error && (
          <div className="w-full overflow-x-auto">
            <table className="md:min-w-full text-sm border-collapse table-fixed">
              <thead>
                <tr className="text-secondary bg-neutral-input text-left text-xs">
                  {/* Checkbox Column Header */}
                  <th className="min-w-10 text-center px-3 py-3 border border-light">
                    <Checkbox
                      checked={
                        selected.length === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={toggleSelectAll}
                      checkboxSize="w-4 h-4"
                    />
                  </th>

                  {/* Other Headers */}
                  {headers.map((head) => {
                    const sortable = !!headerToAccessor[head];
                    const isActive = sortBy === head;
                    const ariaSort = isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none";

                    return (
                      <th
                        key={head}
                        className={`px-3 py-3 border border-light font-normal ${sortable ? "cursor-pointer select-none" : ""}`}
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
                  paginatedData.map((row) => (
                    <tr key={row.id} className="bg-white">
                      {/* Checkbox Column */}
                      <td className="w-10 text-center px-3 py-6 border border-light">
                        <Checkbox
                          checked={selected.includes(row.id)}
                          onChange={() => toggleSelectOne(row.id)}
                          checkboxSize="w-4 h-4"
                        />
                      </td>

                      {/* ID */}
                      <td className="px-3 py-6 border border-light text-[#071437] font-medium">
                        {row.id}
                      </td>

                      {/* Platform (with link) */}
                      <td className="px-3 py-6 border border-light text-primary underline">
                        <Link to={`/platforms/${row.platform?.id || ""}`}>
                          {row.platform?.name || row.platform}
                        </Link>
                      </td>

                      {/* Created */}
                      <td className="px-3 py-6 border border-light text-[#071437] font-medium">
                        {row.created}
                      </td>

                      {/* Integration */}
                      <td className="px-3 py-6 border border-light text-[#071437] font-medium">
                        {row.integration}
                      </td>

                      {/* Status pill */}
                      <td className="px-3 py-6 border border-light">
                        <span className="inline-flex items-center px-3 py-1 bg-[#E6FFF2] text-[#13C37B] text-xs font-medium rounded-full whitespace-nowrap border border-[#17C65333]">
                          ● {row.status}
                        </span>
                      </td>

                      {/* Modify icon */}
                      <td className="px-6 py-6 border border-light border-r border-r-[#F1F1F4]">
                        <Link to={`/outgoing-post/${row.id}/modify`}>
                          <button className="cursor-pointer">
                            <img src={NotepadIcon} alt="Edit" className="w-6 h-6" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-6 text-gray-500 border border-light"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer - reusable component */}
        {!loading && !error && (
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
        )}
      </div>
    </div>
  );
}

export default ImportedData;
