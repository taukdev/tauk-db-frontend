import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Plus, Search, ChevronDown, ChevronUp, Eye, Copy, Check } from "lucide-react";
import crossIcon from "../../assets/icons/cross-icon.svg";
import ReportSearch from "../../assets/report-search.svg";

import CustomButton from "../CustomButton";
import CustomTextField from "../CustomTextField";
import DatePickerField from "../DatePickerField";
import LoadingSpinner from "../common/LoadingSpinner";
import { setBreadcrumbs } from "../../features/breadcrumb/breadcrumbSlice";
import { getVendorsApi, getVendorListsApi, getWebhookStatsApi } from "../../api/vendors";

const WebhookHistoryReport = () => {
    const dispatch = useDispatch();

    // Filter States
    const [showPanel, setShowPanel] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [lists, setLists] = useState([]);
    const [selectedVendorId, setSelectedVendorId] = useState("");
    const [selectedListId, setSelectedListId] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Loading/Error States
    const [dropdownLoading, setDropdownLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [validationError, setValidationError] = useState("");

    // Report Data
    const [reportData, setReportData] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedId, setCopiedId] = useState(null);

    // Fetch Vendors on mount
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setDropdownLoading(true);
                const res = await getVendorsApi(1, 100);
                let vendorData = [];
                if (res?.data?.vendors) vendorData = res.data.vendors;
                else if (Array.isArray(res?.data)) vendorData = res.data;
                else if (Array.isArray(res)) vendorData = res;

                setVendors(vendorData);

            } catch (err) {
                console.error("Error fetching vendors:", err);
            } finally {
                setDropdownLoading(false);
            }
        };
        fetchVendors();

        dispatch(
            setBreadcrumbs([
                { label: "Reports", path: "/report" },
                { label: "Webhook History Report", path: "/report/webhook-history-report" },
            ])
        );
    }, [dispatch]);

    // Fetch Lists when Vendor is selected
    useEffect(() => {
        if (selectedVendorId) {
            const fetchLists = async () => {
                try {
                    setDropdownLoading(true);
                    setLists([]); // Clear lists when vendor changes
                    setSelectedListId(""); // Reset selected list
                    const res = await getVendorListsApi(1, 100, selectedVendorId);
                    let listData = [];

                    if (Array.isArray(res)) {
                        listData = res;
                    } else if (res?.data && Array.isArray(res.data)) {
                        listData = res.data;
                    } else if (res?.data?.data && Array.isArray(res.data.data)) {
                        listData = res.data.data;
                    } else if (Array.isArray(res?.data?.lists)) {
                        listData = res.data.lists;
                    }

                    setLists(listData);

                } catch (err) {
                    console.error("Error fetching lists:", err);
                } finally {
                    setDropdownLoading(false);
                }
            };
            fetchLists();
        } else {
            setLists([]);
            setSelectedListId("");
        }
    }, [selectedVendorId]);

    const handleRunReport = async () => {
        setValidationError("");
        setReportError(null);

        if (!selectedVendorId) {
            setValidationError("Please select a Vendor.");
            return;
        }
        if (!selectedListId) {
            setValidationError("Please select a List.");
            return;
        }
        if (!startDate || !endDate) {
            setValidationError("Please select both Start Date and End Date.");
            return;
        }

        try {
            setReportLoading(true);
            setShowPanel(false); // Close panel on run
            const res = await getWebhookStatsApi(selectedListId, {
                startDate: startDate,
                endDate: endDate,
                vendor_id: selectedVendorId,
            });

            if (res?.status === "success" && res.data) {
                setReportData(res.data);
            } else {
                setReportError(res?.message || "Failed to fetch report.");
                setReportData(null);
            }
        } catch (err) {
            console.error("Error fetching report:", err);
            setReportError(err?.message || "An error occurred fetching the report.");
            setReportData(null);
        } finally {
            setReportLoading(false);
        }
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };


    const filteredHistory = reportData?.recent_webhooks?.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.webhook_url?.toLowerCase().includes(q) ||
            item._id?.toLowerCase().includes(q)
        );
    }) || [];

    return (
        <div>
            {/* Header */}
            <div className="text-primary-dark font-bold text-md mb-3">
                <h2 className="text-xl text-primary-dark font-medium">
                    Webhook History Report
                </h2>
            </div>

            {/* Main Container */}
            <div className="bg-white rounded-2xl border border-[#E1E3EA] shadow p-3 sm:p-4 md:p-6 min-h-[500px]">
                {/* Top Controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 border-b border-[#F1F1F4] pb-3">
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto">
                        {/* Search Box - Only show if we have results */}
                        {reportData && (
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        )}

                        <button
                            onClick={() => setShowPanel(true)}
                            className="flex items-center justify-center sm:justify-start w-full sm:w-auto text-primary px-4 py-2 gap-2 border border-[#1B84FF33] rounded-[6px] bg-[#EFF6FF] hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                            <Plus size={16} />
                            <span className="whitespace-nowrap font-medium">Search Report</span>
                        </button>
                    </div>
                    {reportData && (
                        <div className="text-sm text-gray-500">
                            Total Webhooks: <span className="font-bold text-primary">{reportData.total_webhooks || 0}</span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                {reportLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                        <LoadingSpinner text="Generating report..." size="lg" />
                    </div>
                ) : reportError ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                        <div className="text-red-500 text-lg font-medium mb-2">Error Loading Report</div>
                        <div className="text-gray-500">{reportError}</div>
                    </div>
                ) : !reportData ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                        <div className="mb-4">
                            <img src={ReportSearch} alt="Search" className="w-[120px] opacity-75" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Report Generated</h3>
                        <p className="text-gray-500 max-w-md">
                            Please click "Search Report" to select a Vendor, List, and Date Range to view webhook history.
                        </p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <p className="text-gray-500 text-lg">No webhook history found for the selected criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Vendor/List Header if needed */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex flex-wrap gap-4 text-sm">
                            <div><span className="font-semibold text-gray-600">Vendor:</span> <span className="text-primary-dark font-medium">{reportData.Vendor?.vendor_name || selectedVendorId}</span></div>
                            <div><span className="font-semibold text-gray-600">List:</span> <span className="text-primary-dark font-medium">{selectedListId}</span></div>
                            {reportData.date_range && (
                                <div>
                                    <span className="font-semibold text-gray-600">Date Range:</span> <span className="text-primary-dark font-medium">
                                        {new Date(reportData.date_range.start).toLocaleDateString()} - {new Date(reportData.date_range.end).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {filteredHistory.map((item) => (
                            <div
                                key={item._id}
                                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${expandedRows.has(item._id)
                                    ? 'border-primary shadow-md ring-1 ring-primary/10'
                                    : 'border-secondary-lighter hover:border-primary/40 shadow-sm'
                                    }`}
                            >
                                {/* Card Header */}
                                <div
                                    className="px-5 py-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    onClick={() => toggleRow(item._id)}
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`mt-1 p-1 rounded transition-colors ${expandedRows.has(item._id) ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}>
                                            {expandedRows.has(item._id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-secondary-dark text-[10px] font-bold uppercase tracking-wider mb-1">Webhook URL</div>
                                            <div className="text-primary-dark font-medium break-all text-sm md:text-base">
                                                {item.webhook_url || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:gap-1">
                                        <div className="text-secondary-dark text-[10px] font-bold uppercase tracking-wider md:hidden">Date & Time</div>
                                        <div className="text-gray-500 text-xs md:text-sm whitespace-nowrap">
                                            {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRow(item._id);
                                            }}
                                            className="hidden md:flex items-center gap-1.5 text-primary hover:text-primary-dark font-bold text-xs transition-colors mt-1"
                                        >
                                            <Eye size={14} /> {expandedRows.has(item._id) ? 'Hide Payload' : 'View Payload'}
                                        </button>
                                    </div>
                                </div>

                                {/* Card Body (Expanded) */}
                                {expandedRows.has(item._id) && (
                                    <div className="border-t border-secondary-lighter bg-gray-50/50">
                                        <div className="px-5 py-6 md:px-8">
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <h4 className="text-sm font-bold text-primary-dark uppercase tracking-wide flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                        Payload Details
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${item.processing_status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                            item.processing_status === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                                                                'bg-red-50 border-red-200 text-red-700'
                                                            }`}>
                                                            {item.processing_status}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-mono">ID: {item._id}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-[#1e293b] rounded-xl p-5 shadow-inner border border-gray-700 max-h-[500px] overflow-auto custom-scrollbar group relative">
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(JSON.stringify(item.payload, null, 2), `payload-${item._id}`);
                                                            }}
                                                            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors flex items-center gap-1"
                                                            title="Copy JSON"
                                                        >
                                                            {copiedId === `payload-${item._id}` ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                                            {copiedId === `payload-${item._id}` ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>
                                                    <pre className="text-xs text-blue-200 font-mono whitespace-pre-wrap leading-relaxed">
                                                        {JSON.stringify(item.payload, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter Side Panel */}
            {showPanel && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
                        onClick={() => setShowPanel(false)}
                    />

                    {/* Panel */}
                    <div className="fixed rounded-l-2xl inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Filter Report
                                </h2>
                                <button
                                    onClick={() => setShowPanel(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <img src={crossIcon} alt="Close" className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                                {/* Vendor Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Vendor</label>
                                    <CustomTextField
                                        isSelect
                                        placeholder="Select Vendor"
                                        options={vendors.map(v => ({ label: v.name || v.vendor_name, value: v.id }))}
                                        value={selectedVendorId}
                                        onChange={(e) => setSelectedVendorId(e.target.value)}
                                        disabled={dropdownLoading}
                                    />
                                </div>

                                {/* List Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select List</label>
                                    <CustomTextField
                                        isSelect
                                        placeholder={selectedVendorId ? "Select List" : "Select Vendor first"}
                                        options={lists.map(l => ({ label: l.list_name, value: l.id }))}
                                        value={selectedListId}
                                        onChange={(e) => setSelectedListId(e.target.value)}
                                        disabled={!selectedVendorId || dropdownLoading}
                                    />
                                </div>

                                {/* Date Range */}
                                <div className="space-y-4">
                                    <div>
                                        <DatePickerField
                                            label="Start Date"
                                            value={startDate}
                                            onChange={setStartDate}
                                        />
                                    </div>
                                    <div>
                                        <DatePickerField
                                            label="End Date"
                                            value={endDate}
                                            onChange={setEndDate}
                                        />
                                    </div>
                                </div>

                                {/* Validation Error */}
                                {validationError && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                        {validationError}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <CustomButton
                                    className="w-full py-3 text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] transition-all"
                                    onClick={handleRunReport}
                                >
                                    Run Report
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WebhookHistoryReport;
