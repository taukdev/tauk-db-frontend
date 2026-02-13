import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Copy, Check } from 'lucide-react';
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import BookApiICon from "../../../assets/icons/Bookapis-icon.svg";
import { selectVendorById } from '../../../features/vendor/vendorSlice';
import { setBreadcrumbs } from '../../../features/breadcrumb/breadcrumbSlice';
import { fetchVendorById } from '../../../features/vendor/vendorSlice';
import { getVendorApiConfigsApi } from '../../../api/vendors';
import { API_BASE_URL } from '../../../api/BaseUrl';
import LoadingSpinner from '../../common/LoadingSpinner';

export default function ApiPostingInstruction() {
    const { id: vendorIdParam } = useParams();
    const [lists, setLists] = useState([]);
    const [vendorData, setVendorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const vendor = useSelector((state) => selectVendorById(state, vendorIdParam));
    const dispatch = useDispatch();

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!vendorIdParam || vendorIdParam === 'undefined') {
                setError("Invalid Vendor ID");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch vendor API configs
                const response = await getVendorApiConfigsApi(vendorIdParam);

                // Handle different response structures
                let vendorInfo = null;
                let listsData = [];

                if (response?.data) {
                    vendorInfo = response.data.vendor || response.data.Vendor || (response.data.api_config ? response.data.Vendor : response.data);
                    listsData = response.data.lists || (response.data.api_config ? [response.data] : []);
                } else if (response?.vendor || response?.Vendor) {
                    vendorInfo = response.vendor || response.Vendor;
                    listsData = response.lists || (response.api_config ? [response] : []);
                } else {
                    listsData = Array.isArray(response) ? response : (response?.api_config ? [response] : []);
                }

                setVendorData(vendorInfo);
                setLists(listsData);

                // Fetch vendor details if not in store
                if (!vendor && vendorInfo?.id) {
                    dispatch(fetchVendorById(vendorInfo.id));
                }
            } catch (err) {
                console.error("Error fetching vendor API configs:", err);
                setError(err?.data?.message || err?.message || "Failed to load API instructions");
                setLists([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [vendorIdParam, dispatch, vendor]);

    useEffect(() => {
        const vId = vendor?.id || vendorData?.id || vendorIdParam;
        const vName = vendor?.name || vendorData?.vendor_name || vendorData?.company_name || "Vendor";

        if (vId) {
            dispatch(
                setBreadcrumbs([
                    { label: "Vendors", path: "/vendors" },
                    {
                        label: `${vId} - ${vName}`,
                        path: `/vendor/${vId}`
                    },
                    { label: "API Instructions", path: `/vendor/list/${vendorIdParam}/api-posting-instruction` }
                ])
            );
        }
    }, [dispatch, vendor, vendorData, vendorIdParam]);

    // Transform lists data to instructions format
    const instructions = lists
        .filter((list) => list.api_config && list.api_config.api_url)
        .map((list) => {
            // Construct full URL - api_url from API is relative path starting with /api
            // API_BASE_URL already includes /api, so we need to remove /api from base if api_url starts with /api
            let fullApiUrl = list.api_config.api_url;
            if (fullApiUrl.startsWith('/api')) {
                // Remove /api from API_BASE_URL and prepend to api_url
                const baseUrlWithoutApi = API_BASE_URL.replace(/\/api$/, '');
                fullApiUrl = baseUrlWithoutApi + fullApiUrl;
            } else if (!fullApiUrl.startsWith('http')) {
                // If it doesn't start with http and doesn't start with /api, prepend base URL
                fullApiUrl = API_BASE_URL + (fullApiUrl.startsWith('/') ? '' : '/') + fullApiUrl;
            }

            return {
                id: list.id,
                name: list.list_name || list.listName || `List ${list.id}`,
                apiUrl: fullApiUrl,
                authToken: list.api_config.api_auth_token,
                notes: `Auth Token: ${list.api_config.api_auth_token}`
            };
        });

    const displayVendorId = vendor?.id || vendorData?.id || vendorIdParam;
    const displayVendorName = vendor?.name || vendorData?.vendor_name || vendorData?.company_name;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex flex-row flex-wrap items-center justify-between mb-6 gap-4">
                <div className="text-lg sm:text-2xl font-semibold text-primary-dark flex items-center gap-2">
                    <Link
                        to={displayVendorId ? `/vendor/${displayVendorId}` : "/vendors"}
                        className="flex items-center gap-2"
                        style={{ textDecoration: "none" }}
                    >
                        <img src={UnionIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
                        <h2 className="text-md sm:text-lg font-bold">
                            API Posting Instructions
                            {displayVendorName && ` - ${displayVendorName}`}
                        </h2>
                    </Link>
                </div>
            </div>

            {/* Instruction Cards */}
            <div className="space-y-4">
                {error ? (
                    <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-500">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="bg-white rounded-xl border border-[#E1E3EA] p-8 text-center">
                        <LoadingSpinner text="Loading API instructions..." size="md" />
                    </div>
                ) : instructions.length > 0 ? (
                    instructions.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl border border-[#E1E3EA] p-4 shadow-sm flex flex-col min-h-[120px]"
                        >
                            {/* Top Row: Name + Button */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-[16px] sm:text-[18px] text-primary-dark mb-1">
                                        {item.id} - {item.name}
                                    </div>
                                </div>
                                {/* Action Button */}
                                {/* <div className="flex flex-wrap md:flex-nowrap gap-2 sm:justify-end">
                                    <button className="w-auto px-[8px] py-[4px] flex items-center justify-center rounded border border-default bg-white hover:bg-gray-100 text-[#6B7280]">
                                        <img src={BookApiICon} alt="Book Icon" className="w-4 h-4 mr-1" />
                                        <span className="text-xs cursor-pointer">Get API Documentation</span>
                                    </button>
                                </div> */}
                            </div>
                            {/* API URL / Notes */}
                            {item.apiUrl && (
                                <div className="mt-3 flex flex-col lg:flex-row gap-3 flex-wrap">
                                    <div className="font-medium text-[13px] sm:text-[14px] text-neutral min-w-[80px]">
                                        API URL
                                    </div>
                                    <div className="flex-1 min-w-[200px] relative group">
                                        <pre className="bg-[#F7F9FB] bg-secondary-light border border-[#E1E3EA] rounded-lg p-3 pr-10 text-xs overflow-x-auto whitespace-pre-wrap break-words break-all font-mono">
                                            {item.apiUrl}
                                        </pre>
                                        <button
                                            onClick={() => handleCopy(item.apiUrl, `url-${item.id}`)}
                                            className="absolute right-2 top-2 p-1.5 hover:bg-white rounded transition-colors"
                                            title="Copy API URL"
                                        >
                                            {copiedId === `url-${item.id}` ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-400" />}
                                        </button>
                                        {item.notes && (
                                            <div className="text-xs text-neutral mt-2 flex items-center gap-2">
                                                <span className="font-semibold">Notes:</span> {item.notes}
                                                <button
                                                    onClick={() => handleCopy(item.authToken, `token-${item.id}`)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                    title="Copy Auth Token"
                                                >
                                                    {copiedId === `token-${item.id}` ? <Check size={10} className="text-green-600" /> : <Copy size={10} className="text-gray-400" />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Optional: Custom Fields */}
                            {/* <div className="mt-3 flex items-center gap-2 text-sm text-secondary justify-start sm:justify-end">
                                <span className="text-primary cursor-pointer border-b border-dashed">
                                    Add custom fields
                                </span>
                            </div> */}
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl border border-[#E1E3EA] p-8 text-center text-gray-500">
                        No API instructions found for this vendor.
                    </div>
                )}
            </div>
        </div>
    );
}
