import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import { Link, useParams } from "react-router-dom";
import plusIcon from "../../../assets/icons/plus-icon.svg";
import dangerCircleIcon from "../../../assets/icons/DangerCircle-icon.svg";
import EditIcon from "../../../assets/icons/Edit-icon.svg";
import LinkIcon from "../../../assets/icons/Link-icon.svg";
import { setCurrentIntegration } from "../../../features/platform/editApiIntegrationsSlice";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import CustomButton from "../../CustomButton";
import { fetchApiIntegrations } from "../../../features/platform/apiIntegrationsSlice";
import { fetchPlatformDetail } from "../../../features/platform/platformDetailSlice";
import LoadingSpinner from "../../common/LoadingSpinner";

export default function ApiIntegrationPage({ header = "API Integration", showBackIcon = true, }) {
    const { integrations, loading } = useSelector((state) => state.apiIntegrations);
    const { id: platformId } = useParams();

    // Select from platformDetail slice instead of list slice for better single-item management on refresh
    const { selectedPlatform: platform } = useSelector((state) => state.platformDetail); // Changed selector
    const dispatch = useDispatch();

    useEffect(() => {
        if (platformId) {
            dispatch(fetchApiIntegrations(platformId));
            if (!platform || String(platform.id) !== String(platformId)) {
                dispatch(fetchPlatformDetail(platformId));
            }
        }
    }, [dispatch, platformId]);

    useEffect(() => {
        if (platform) {
            dispatch(
                setBreadcrumbs([
                    { label: "Platforms", path: "/platforms" },
                    { label: platform.name || platform.platform_name || "Platform", path: "/platforms/" + platform.id + "/" },
                    { label: "API Integration", path: "/platforms/" + platform.id + "/api-integrations" },
                ])
            );
        }
    }, [dispatch, platform]);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="flex flex-row flex-wrap items-center justify-between mb-6 gap-4">
                {/* Back + Title */}
                <div className="text-lg sm:text-2xl font-semibold text-primary-dark flex items-center gap-2">
                    <Link
                        to={`/platforms/${platformId}`}
                        className="flex items-center gap-2"
                        style={{ textDecoration: "none" }}
                    >
                        {showBackIcon && (
                            <img
                                src={UnionIcon}
                                alt="Back"
                                className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                        )}
                        <h2 className="text-md sm:text-lg font-bold">{header}</h2>
                    </Link>
                </div>

                {/* Add Button */}
                <Link to={`/platforms/${platformId}/new-api-integration`}>
                    <CustomButton
                        className="flex items-center gap-1 justify-center rounded-xl"
                        fullWidth={true}
                    >
                        <img src={plusIcon} alt="plus logo" className="w-6 h-6" />
                        <span className="text-sm sm:text-base">Add New Integration</span>
                    </CustomButton>

                </Link>
            </div>

            {/* Integrations */}
            <div className="space-y-4">
                {loading && integrations.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner text="Loading integrations..." size="lg" />
                    </div>
                ) : integrations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-[#E1E3EA]">
                        <p className="text-secondary">No integrations found.</p>
                    </div>
                ) : (
                    integrations.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl border border-[#E1E3EA] p-4 shadow-sm relative min-h-[120px] flex flex-col"
                        >
                            {/* Top Row */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                {/* Name + Date */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-[16px] sm:text-[18px] text-primary-dark mb-1 truncate">
                                        {item.id}. {item.name || item.api_description}
                                    </div>
                                    <div className="text-[12px] sm:text-[13px] text-secondary mb-1">
                                        Entered on {item.date || item.created_at}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:justify-end">
                                    {!item.system && (
                                        <>
                                            <Link
                                                to={`/platforms/${platformId}/edit-api-integration/${item.id}`}
                                                onClick={() => dispatch(setCurrentIntegration(item))}
                                            >
                                                <button className="w-auto px-[8px] py-[4px] flex items-center justify-center cursor-pointer rounded border border-default bg-white hover:bg-gray-100 text-[#6B7280]">
                                                    <img src={EditIcon} alt="Edit" className="w-4 h-4 mr-1" />
                                                    <span className="text-xs">Edit</span>
                                                </button>
                                            </Link>

                                            <button className="w-auto px-[8px] py-[4px] flex items-center justify-center rounded border border-default bg-white hover:bg-gray-100 text-[#6B7280] cursor-pointer">
                                                <img src={LinkIcon} alt="Test API" className="w-4 h-4 mr-1" />
                                                <span className="text-xs">Test API</span>
                                            </button>
                                        </>
                                    )}
                                    <button className="text-[11px] sm:text-xs px-2 py-1 rounded bg-[#F1F1F4] text-secondary font-medium">
                                        {item.api_type || "Regular API"}
                                    </button>
                                </div>
                            </div>


                            {/* Post URL */}
                            {
                                (item.api_endpoint || item.postUrl) && (
                                    <div className="mt-3 flex flex-col md:flex-row gap-3 flex-wrap">
                                        <div className="font-medium text-[13px] sm:text-[14px] text-neutral min-w-[80px]">
                                            Post URL
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <textarea
                                                readOnly
                                                value={item.api_endpoint || item.postUrl}
                                                className="w-full border border-[#E1E3EA] rounded-lg p-3 text-xs font-mono resize-none outline-none focus:ring-0"
                                                rows={1}
                                                style={{
                                                    minHeight: '40px',
                                                    overflowY: 'auto',
                                                    lineHeight: '1.5'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            }

                            {/* Post Variables */}
                            {/* {
                            (item.post_variables || item.postVariables) && (
                                <div className="mt-3 flex flex-col md:flex-row gap-3 flex-wrap">
                                    <div className="font-medium text-[13px] sm:text-[14px] text-neutral min-w-[80px]">
                                        Post Variables
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <textarea
                                            readOnly
                                            value={(() => {
                                                const postVars = item.post_variables || item.postVariables;
                                                if (!postVars) return '';
                                                // If it's a string, try to parse and format as JSON
                                                if (typeof postVars === 'string') {
                                                    try {
                                                        const parsed = JSON.parse(postVars);
                                                        return JSON.stringify(parsed, null, 2);
                                                    } catch (e) {
                                                        // If not valid JSON, return as is
                                                        return postVars;
                                                    }
                                                }
                                                // If it's already an object, stringify it
                                                return JSON.stringify(postVars, null, 2);
                                            })()}
                                            className="w-full  border border-[#E1E3EA] rounded-lg p-3 text-xs font-mono resize-none outline-none focus:ring-0"
                                            rows={12}
                                            style={{ 
                                                minHeight: '200px',
                                                lineHeight: '1.5'
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        } */}

                            {/* Successful Response */}
                            {
                                (item.successful_response || item.response) && (
                                    <div className="mt-3 flex flex-col md:flex-row gap-3 flex-wrap">
                                        <div className="font-medium text-[13px] sm:text-[14px] text-neutral min-w-[80px]">
                                        </div>
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="text-xs text-neutral">
                                                <span className="font-semibold">Successful Response:</span>{" "}
                                                {item.successful_response || item.response}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }


                            {/* System API Notice */}
                            {
                                item.system && (
                                    <div className="flex items-center gap-1 text-[12px] text-[#6B7280] bg-transparent mt-2">
                                        <img
                                            src={dangerCircleIcon}
                                            alt="Danger Circle"
                                            className="w-4 h-4"
                                        />
                                        This is a system-generated API. It cannot be modified.
                                    </div>
                                )
                            }
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
