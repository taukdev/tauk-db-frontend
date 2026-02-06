import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChevronDown, ChevronUp, Eye, Search } from "lucide-react";

import UnionIcon from "../../../assets/icons/Union-icon.svg";
import { getWebhookStatsApi } from "../../../api/vendors";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import LoadingSpinner from "../../common/LoadingSpinner";
import Pagination from "../../common/Pagination";

const WebhookStatistics = () => {
    const { id: vendorId } = useParams();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getWebhookStatsApi(vendorId);
            if (res?.status === "success") {
                setStats(res.data);
            } else {
                setError("Failed to fetch webhook statistics");
            }
        } catch (err) {
            console.error("Error fetching webhook stats:", err);
            setError(err?.message || "An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vendorId]);

    useEffect(() => {
        if (stats) {
            const vName = stats.Vendor?.vendor_name || stats.Vendor?.company_name || `Vendor ${vendorId}`;
            dispatch(
                setBreadcrumbs([
                    { label: "Vendors", path: "/vendors" },
                    { label: vName, path: `/vendor/${vendorId}` },
                    { label: "Webhook Statistics", path: `/vendor/list/${vendorId}/webhook` },
                ])
            );
        }
    }, [dispatch, vendorId, stats]);

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const filteredHistory = stats?.recent_webhooks?.filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            item.webhook_url?.toLowerCase().includes(q) ||
            item._id?.toLowerCase().includes(q)
        );
    }) || [];

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Link to={stats?.vendor_id ? `/vendor/${stats.vendor_id}` : "/vendors"} className="cursor-pointer">
                            <img src={UnionIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <h1 className="text-xl font-semibold text-primary-dark">
                            Webhook History - {stats?.Vendor?.vendor_name || `Vendor ${vendorId}`}
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Total Webhooks: <span className="font-semibold text-primary">{stats?.total_webhooks || 0}</span>
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search history..."
                        className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-xl border border-secondary-lighter p-12 text-center">
                        <LoadingSpinner text="Loading webhook data..." size="md" />
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl border border-red-200 p-12 text-center text-red-500">
                        {error}
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="bg-white rounded-xl border border-secondary-lighter p-12 text-center text-gray-500 italic">
                        No webhook history found.
                    </div>
                ) : (
                    filteredHistory.map((item) => (
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
                                                            navigator.clipboard.writeText(JSON.stringify(item.payload, null, 2));
                                                        }}
                                                        className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors"
                                                        title="Copy JSON"
                                                    >
                                                        Copy
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
                    ))
                )}
            </div>
        </div>
    );
};

export default WebhookStatistics;
