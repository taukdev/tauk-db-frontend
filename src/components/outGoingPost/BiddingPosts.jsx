import React, { useState, useEffect, useMemo } from 'react'
import CustomTextField from '../CustomTextField'
import ReportSearch from "../../assets/report-search.svg";
import { Search } from "lucide-react";
import CustomButton from '../CustomButton';
import Checkbox from "../common/Checkbox"; // <-- shared Checkbox import
import { getPlatformsApi } from '../../api/platforms'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBiddingPosts } from '../../features/outgoing/biddingPostsSlice'
import tableHeaderIcon from "../../assets/icons/t-header-icon.svg";
import NotepadIcon from "../../assets/icons/notepad-icon.svg";
import { Link } from "react-router-dom";
import Pagination from "../common/Pagination";

function BiddingPosts() {
    const dispatch = useDispatch();
    const { posts, loading, error, pagination } = useSelector((state) => state.biddingPosts || { posts: [], loading: false, error: null, pagination: null });
    
    const [selectedClient, setSelectedClient] = useState("")
    const [statusFilters, setStatusFilters] = useState({
        Active: false,
        Archived: false,
        Paused: false,
        Fulfilled: false,
    })
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    
    // Sorting state
    const [sortBy, setSortBy] = useState(null);
    const [sortDir, setSortDir] = useState(null);
    
    // State for platforms dropdown
    const [platformOptions, setPlatformOptions] = useState([
        { label: "Select Platforms...", value: "" },
    ])
    const [platformsLoading, setPlatformsLoading] = useState(true)

    // Headers for table
    const headers = [
        "ID",
        "Platform",
        "Created",
        "Integration",
        "Posted",
        "Posted Today",
        "Order Cap",
        "Daily Cap",
        "Status",
        "Modify",
    ];

    // Accessor map for sorting
    const headerToAccessor = {
        ID: (r) => r.id,
        Platform: (r) => typeof r.platform === 'object' ? r.platform?.name : r.platform,
        Created: (r) => r.created,
        Integration: (r) => r.integration,
        Posted: (r) => r.posted,
        "Posted Today": (r) => r.postedToday,
        "Order Cap": (r) => r.orderCap,
        "Daily Cap": (r) => r.dailyCap,
        Status: (r) => r.status,
    };

    // Comparator for sorting
    const comparator = (aVal, bVal) => {
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return -1;
        if (bVal == null) return 1;

        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;

        return String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" });
    };

    // Fetch bidding posts from API
    useEffect(() => {
        const params = {
            page: currentPage,
            limit: rowsPerPage,
        };

        if (search.trim()) {
            params.search = search.trim();
        }

        if (selectedClient) {
            params.platform_id = selectedClient;
        }

        // Note: Status filtering is done client-side since API might not support it
        // If API supports status filtering, uncomment below:
        // const activeStatuses = Object.keys(statusFilters).filter(key => statusFilters[key]);
        // if (activeStatuses.length > 0) {
        //     params.status = activeStatuses.join(',');
        // }

        dispatch(fetchBiddingPosts(params));
    }, [dispatch, currentPage, rowsPerPage, search, selectedClient, statusFilters]);

    // Fetch platforms on component mount
    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                setPlatformsLoading(true)
                const response = await getPlatformsApi()
                
                // Handle different response structures
                let platformsData = []
                if (Array.isArray(response)) {
                    platformsData = response
                } else if (response?.data && Array.isArray(response.data)) {
                    platformsData = response.data
                } else if (response?.data?.platforms && Array.isArray(response.data.platforms)) {
                    platformsData = response.data.platforms
                }

                // Format platforms for dropdown
                const formattedPlatforms = platformsData.map((platform) => ({
                    label: platform.platform_name || platform.name || String(platform.id || ""),
                    value: String(platform.id || "")
                }))

                setPlatformOptions([
                    { label: "Select Platforms...", value: "" },
                    ...formattedPlatforms
                ])
            } catch (error) {
                console.error("Error fetching platforms:", error)
                // Keep default option on error
            } finally {
                setPlatformsLoading(false)
            }
        }

        fetchPlatforms()
    }, [])

    // Filter and sort data (client-side filtering for status since API might not support it)
    const filteredData = useMemo(() => {
        return (posts || []).filter((row) => {
            const platformName = typeof row.platform === 'object' ? row.platform?.name : row.platform || "";
            const matchesSearch = !search.trim() || 
                platformName.toLowerCase().includes(search.toLowerCase()) ||
                (row.id?.toString() || "").includes(search);
            
            // Client-side status filtering
            const activeStatuses = Object.keys(statusFilters).filter(key => statusFilters[key]);
            const matchesStatus = activeStatuses.length === 0 || activeStatuses.includes(row.status);
            
            return matchesSearch && matchesStatus;
        });
    }, [posts, search, statusFilters]);

    const sortedData = useMemo(() => {
        if (!sortBy || !sortDir) return filteredData;
        const accessor = headerToAccessor[sortBy] || ((r) => r[sortBy]);
        const sorted = [...filteredData].sort((a, b) => comparator(accessor(a), accessor(b)));
        return sortDir === "asc" ? sorted : sorted.reverse();
    }, [filteredData, sortBy, sortDir]);

    // Pagination - API handles pagination, so use sortedData directly
    const totalItems = pagination?.total || sortedData.length;
    const totalPages = pagination?.totalPages || Math.ceil(totalItems / rowsPerPage);
    const paginatedData = sortedData;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, rowsPerPage, selectedClient, statusFilters, sortBy, sortDir]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages || 1);
        }
    }, [totalPages, currentPage]);

    // Checkbox logic
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(paginatedData.map((post) => post.id));
        } else {
            setSelected([]);
        }
    };

    const toggleSelectOne = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    // Toggle sort
    const toggleSort = (head) => {
        if (!headerToAccessor[head]) return;
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

    // Status style helper
    const getStatusStyle = (status) => {
        switch (status) {
            case "Active":
                return "bg-[#E6FFF2] text-[#13C37B]";
            case "Inactive":
                return "bg-[#FFF2E6] text-[#FF8C00]";
            case "Paused":
                return "bg-[#E6F3FF] text-primary";
            case "Suspended":
                return "bg-[#FFE6E6] text-[#FF4444]";
            default:
                return "bg-[#F5F5F5] text-[#666666]";
        }
    };


    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
                {/* Left bigger column */}
                <div className="lg:col-span-2">
                    <div>
                        {/* Main Card with box structure like filter box */}
                        <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)] p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-4">
                                {/* Report Title */}
                                <div className="text-center sm:text-left w-full sm:w-auto">
                                    <h2 className="text-md font-semibold text-primary-dark">Seeded Orders</h2>
                                </div>

                                {/* Search Bar */}
                                <div className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        placeholder="Search vendors by name or ID"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    />
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-[#E4E6EF] mb-5 -mx-5" />
                            
                            {/* Loading State */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                                    <p className="text-lg text-[#4B5563] max-w-md font-medium">
                                        Loading bidding posts...
                                    </p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !loading && (
                                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                                    <p className="text-lg text-red-500 max-w-md font-medium">
                                        Error: {error}
                                    </p>
                                </div>
                            )}

                            {/* Table */}
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
                                                            {typeof row.platform === 'object' && row.platform?.id ? (
                                                                <Link to={`/platforms/${row.platform.id}`}>
                                                                    {row.platform.name}
                                                                </Link>
                                                            ) : (
                                                                row.platform
                                                            )}
                                                        </td>

                                                        {/* Created */}
                                                        <td className="px-3 py-6 border border-light text-[#071437] font-medium">
                                                            {row.created}
                                                        </td>

                                                        {/* Integration */}
                                                        <td className="px-3 py-6 border border-light text-[#071437] font-medium">
                                                            {row.integration}
                                                        </td>

                                                        {/* Posted */}
                                                        <td className="pl-5 py-6 border border-light text-[#071437] font-medium">
                                                            {typeof row.posted === 'number' ? row.posted.toLocaleString() : row.posted}
                                                        </td>

                                                        {/* Posted Today */}
                                                        <td className="px-3 py-6 border border-light text-[#071437] font-medium">
                                                            {row.postedToday}
                                                        </td>

                                                        {/* Order Cap */}
                                                        <td className="px-3 py-6 border border-light text-[#071437] font-medium">
                                                            {row.orderCap}
                                                        </td>

                                                        {/* Daily Cap */}
                                                        <td className="px-3 py-6 border border-light text-[#071437] font-medium">
                                                            {row.dailyCap}
                                                        </td>

                                                        {/* Status pill */}
                                                        <td className="px-3 py-6 border border-light">
                                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap border border-[#17C65333] ${getStatusStyle(row.status)}`}>
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
                                                        colSpan="11"
                                                        className="text-center py-6 text-gray-500 border border-light"
                                                    >
                                                        No bidding posts found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
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
                </div>

                <div className="lg:col-span-1">
                    {/* Filter Card */}
                    <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-[0_3px_4px_rgba(0,0,0,0.03)] p-5">
                        <h3 className="text-md font-semibold text-primary-dark mb-4">Filter Orders...</h3>
                        <div className="border-t border-[#E4E6EF] -mx-5 mb-5" />

                        {/* Select Platforms */}
                        <div className="mb-4">
                            <p className="text-sm font-medium text-primary-dark mb-2">Select Platforms</p>
                            <CustomTextField
                                isSelect
                                placeholder={platformsLoading ? "Loading platforms..." : "Select Platforms..."}
                                size="sm"
                                value={selectedClient}
                                onChange={(e) => setSelectedClient(e.target.value)}
                                options={platformOptions}
                                disabled={platformsLoading}
                            />
                        </div>

                        {/* Platform Name / Status checkboxes */}
                        <div className="mb-4">
                            <p className="text-sm font-medium text-primary-dark mb-2">Platform Status</p>

                            {Object.keys(statusFilters).map((key) => (
                                <label key={key} className="flex items-center gap-2 select-none">
                                    <Checkbox
                                        checked={statusFilters[key]}
                                        onChange={(e) =>
                                            setStatusFilters((prev) => ({ ...prev, [key]: e.target.checked }))
                                        }
                                        checkboxSize="w-4 h-4"
                                    />
                                    <span className="text-primary-dark">{key}</span>
                                </label>
                            ))}
                        </div>

                        <CustomButton
                            type="submit"
                            position="end"
                            className="py-3 lg:w-"
                            onClick={() => {
                                // Reset to page 1 when filtering
                                setCurrentPage(1);
                                // The useEffect will automatically trigger API call with new filters
                            }}
                        >
                            Filter Posts
                        </CustomButton>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default BiddingPosts
