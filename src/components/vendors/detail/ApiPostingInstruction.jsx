import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import BookApiICon from "../../../assets/icons/bookapis-icon.svg";
import { selectVendorById } from '../../../features/vendor/vendorSlice';
import { setBreadcrumbs } from '../../../features/breadcrumb/breadcrumbSlice';

import { fetchListById } from '../../../features/vendor/vendorListingSlice';
import { fetchVendorById } from '../../../features/vendor/vendorSlice';

export default function ApiPostingInstruction() {
    const { id: listId } = useParams();
    const currentList = useSelector((state) => state.vendorListing.currentList);
    const vendorId = currentList?.vendor_id || currentList?.vendorId || currentList?.created_by || currentList?.createdBy;
    const vendor = useSelector((state) => selectVendorById(state, vendorId));
    const loading = useSelector((state) => state.vendors.loading);

    const dispatch = useDispatch();

    useEffect(() => {
        if (listId && listId !== 'undefined') {
            dispatch(fetchListById(listId));
        }
    }, [dispatch, listId]);

    useEffect(() => {
        if (vendorId && vendorId !== 'undefined' && !vendor && !loading) {
            dispatch(fetchVendorById(vendorId));
        }
    }, [dispatch, vendorId, vendor, loading]);

    useEffect(() => {
        if (currentList) {
            const vId = vendor?.id || vendorId;
            const vName = vendor?.name || (loading ? "Loading..." : (vendorId ? "Vendor" : "Vendor"));

            dispatch(
                setBreadcrumbs([
                    { label: "Vendors", path: "/vendors" },
                    {
                        label: vId ? `${vId} - ${vName}` : "Vendor",
                        path: vId ? `/vendor/${vId}` : "/vendors"
                    },
                    { label: "API Instructions", path: `/vendor/list/${listId}/api-posting-instruction` }
                ])
            );
        }
    }, [dispatch, currentList, vendor, listId, vendorId, loading]);

    const apiConfig = currentList?.apiConfig;

    const instructions = apiConfig ? [{
        id: apiConfig.id,
        name: currentList.listName,
        apiUrl: apiConfig.apiUrl,
        notes: `Auth Token: ${apiConfig.apiAuthToken}`
    }] : [];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex flex-row flex-wrap items-center justify-between mb-6 gap-4">
                <div className="text-lg sm:text-2xl font-semibold text-primary-dark flex items-center gap-2">
                    <Link
                        to={vendor?.id ? `/vendor/${vendor.id}` : (vendorId ? `/vendor/${vendorId}` : "/vendors")}
                        className="flex items-center gap-2"
                        style={{ textDecoration: "none" }}
                    >
                        <img src={UnionIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
                        <h2 className="text-md sm:text-lg font-bold">
                            API Posting Instructions
                            {vendor?.name && ` - ${vendor.name}`}
                        </h2>
                    </Link>
                </div>
            </div>

            {/* Instruction Cards */}
            <div className="space-y-4">
                {listId === 'undefined' ? (
                    <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-500">
                        Invalid List ID. Please select a list from the vendor page to view its API instructions.
                    </div>
                ) : instructions.length > 0 ? (
                    instructions.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl border border-[#E1E3EA] p-4 shadow-sm flex flex-col min-h-[120px]"
                        >
                            {/* ... (rest of the map remains the same, but I'll provide the start to ensure correct replacement) */}
                            {/* Top Row: Name + Button */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-[16px] sm:text-[18px] text-primary-dark mb-1">
                                        {item.id} - {item.name}
                                    </div>
                                </div>
                                {/* Action Button */}
                                <div className="flex flex-wrap md:flex-nowrap gap-2 sm:justify-end">
                                    <button className="w-auto px-[8px] py-[4px] flex items-center justify-center rounded border border-default bg-white hover:bg-gray-100 text-[#6B7280]">
                                        <img src={BookApiICon} alt="Book Icon" className="w-4 h-4 mr-1" />
                                        <span className="text-xs cursor-pointer">Get API Documentation</span>
                                    </button>
                                </div>
                            </div>
                            {/* API URL / Notes */}
                            {item.apiUrl && (
                                <div className="mt-3 flex flex-col lg:flex-row gap-3 flex-wrap">
                                    <div className="font-medium text-[13px] sm:text-[14px] text-neutral min-w-[80px]">
                                        API URL
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <pre className="bg-[#F7F9FB] bg-secondary-light border border-[#E1E3EA] rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-words break-all font-mono">
                                            {item.apiUrl}
                                        </pre>
                                        {item.notes && (
                                            <div className="text-xs text-neutral mt-2">
                                                <span className="font-semibold">Notes:</span> {item.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Optional: Custom Fields */}
                            <div className="mt-3 flex items-center gap-2 text-sm text-secondary justify-start sm:justify-end">
                                <span className="text-primary cursor-pointer border-b border-dashed">
                                    Add custom fields
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-xl border border-[#E1E3EA] p-8 text-center text-gray-500">
                        {loading ? "Loading instructions..." : "No API instructions found for this list."}
                    </div>
                )}
            </div>
        </div>
    );
}