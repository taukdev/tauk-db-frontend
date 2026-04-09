import React, { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import { Link, useParams } from "react-router-dom";
import CustomTextField from "../../CustomTextField";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { updateApiIntegration, setCurrentIntegration, fetchApiIntegrationById } from "../../../features/platform/editApiIntegrationsSlice";
import ApiIntegrationPage from "./ApiIntegrationPage";
import CustomButton from "../../CustomButton";
import { useNavigate } from "react-router-dom";
import { getListsDropdownApi, getActiveCountriesApi, getActivePlatformPresetsApi } from "../../../api/platforms";
import LoadingSpinner from "../../common/LoadingSpinner";

const apiTypes = [
    { label: "Regular API", value: "Regular API" },
    // { label: "Ping/Post", value: "Ping/Post" },
];


const validationSchema = Yup.object({
    apiDescription: Yup.string().required("API description is required"),
    apiType: Yup.string().required("API type is required"),
    apiEndpoint: Yup.string().required("API endpoint is required"),
    timeout: Yup.number()
        .min(1, "Minimum 1 second")
        .max(60, "Maximum 60 seconds")
        .required("Timeout is required"),
    // dateFormat: Yup.string().required("Date format is required"),
    urlEncode: Yup.string().required("URL encode is required"),
    requestType: Yup.string().required("Request type is required"),
    successfulResponse: Yup.string(),
    headers: Yup.string(),
    fieldMapping: Yup.string(),
    platform: Yup.string(),
    campaignId: Yup.string(),
});

function EditApiIntegrations() {
    const { id, integrationId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [listsDropdown, setListsDropdown] = useState([]);
    const [lastListId, setLastListId] = useState('');
    const [isFirstListIdSet, setIsFirstListIdSet] = useState(false);
    const [countryOptions, setCountryOptions] = useState([]);
    const [platformOptions, setPlatformOptions] = useState([]);
    const [platformsLoading, setPlatformsLoading] = useState(true);

    // Get all integrations from redux
    const integrations = useSelector((state) => state.apiIntegrations.integrations || []);
    const integration = useSelector(
        (state) => state.editApiIntegrations.currentIntegration
    );

    const platformId = id; // Assuming route is /platforms/:id/edit-api-integration/:integrationId

    useEffect(() => {
        // If we don't have the current integration, or if it doesn't match the URL param ID
        if (!integration || String(integration.id) !== String(integrationId)) {
            // First try to find it in the list if available
            const selected = integrations.find((item) => String(item.id) === String(integrationId));
            if (selected) {
                dispatch(setCurrentIntegration(selected));
            } else {
                // Otherwise fetch it from API
                dispatch(fetchApiIntegrationById({ platformId, integrationId }));
            }
        }
    }, [integrationId, integrations, dispatch, integration, platformId]);

    // Fetch lists dropdown on mount
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await getListsDropdownApi();
                if (response?.data && Array.isArray(response.data)) {
                    setListsDropdown(response.data.map(list => ({
                        label: list.list_name,
                        value: String(list.id),
                    })));
                }
            } catch (error) {
                console.error('Error fetching lists dropdown:', error);
            }
        };
        fetchLists();

        const fetchCountries = async () => {
            try {
                const response = await getActiveCountriesApi();
                if (response?.data && Array.isArray(response.data)) {
                    setCountryOptions(response.data.map(country => ({
                        label: country.country_name,
                        value: String(country.id),
                    })));
                }
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };
        fetchCountries();

        const fetchProviders = async () => {
            try {
                setPlatformsLoading(true);
                const response = await getActivePlatformPresetsApi();
                let data = [];
                if (Array.isArray(response)) data = response;
                else if (Array.isArray(response?.data)) data = response.data;
                else if (Array.isArray(response?.data?.presets)) data = response.data.presets;

                const seen = new Set();
                const options = [
                    { label: 'Custom', value: 'custom' },
                    ...data.map(preset => {
                        const label = preset.platform_name || preset.preset_name || preset.name;
                        const value = preset.service_provider || preset.provider || preset.platform || preset.id;
                        return label && value ? { label: String(label), value: String(value) } : null;
                    })
                        .filter(opt => {
                            if (!opt) return false;
                            const key = `${opt.label}|${opt.value}`;
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                        })
                ];
                setPlatformOptions(options);
            } catch (error) {
                console.error('Error fetching platform presets:', error);
                setPlatformOptions([{ label: 'Custom', value: 'custom' }]);
            } finally {
                setPlatformsLoading(false);
            }
        };
        fetchProviders();
    }, []);

    const cleanApiEndpoint = (url = "") => {
        if (!url) return "";
        const index = url.indexOf(".json");
        return index !== -1 ? url.substring(0, index + 5) : url;
    };

    const getInitialValues = (data) => {
        if (!data) return {
            apiDescription: "",
            apiType: "Regular API",
            platform: "custom",
            campaignId: "",
            apiEndpoint: "",
            timeout: 60,
            dateFormat: "",
            urlEncode: "Yes",
            requestType: "POST",
            successfulResponse: "",
            headers: "",
            postVariables: "",
            countryCode: false,
            countryId: "",
            fieldMapping: "",
        };

        return {
            apiDescription: data.name || data.api_description || "",
            apiType: data.apiType || data.api_type || "",
            platform: data.platform || (data.service_provider ? String(data.service_provider) : 'custom'),
            campaignId: (() => {
                if (data.campaign_id) return String(data.campaign_id);
                try {
                    const postVars = typeof data.post_variables === 'string' ? JSON.parse(data.post_variables) : data.post_variables;
                    if (postVars && (postVars.campaignId || postVars.campaign_id)) {
                        return String(postVars.campaignId || postVars.campaign_id);
                    }
                } catch (e) {
                    // Ignore parse error
                }
                return "";
            })(),
            apiEndpoint: cleanApiEndpoint(data.apiEndpoint || data.api_endpoint || data.postUrl),
            timeout: data.timeout || data.timeout_after || 60,
            postVariables: (() => {
                if (!data.postVariables && !data.post_variables) return "";
                const val = data.postVariables || data.post_variables;
                try {
                    return typeof val === 'string' ? JSON.stringify(JSON.parse(val), null, 2) : JSON.stringify(val, null, 2);
                } catch (e) {
                    return val;
                }
            })(),
            dateFormat: data.dateFormat || data.date_format || "",
            urlEncode: (data.urlEncode !== undefined ? data.urlEncode : data.url_encode) === true || data.url_encode === "Yes" ? "Yes" : "No",
            requestType: (data.requestType || data.request_type || "POST").toUpperCase(),
            successfulResponse: data.response || data.successful_response || "",
            headers: data.headers || "",
            countryCode: (data.is_country_code_enabled !== undefined ? data.is_country_code_enabled : data.countryCode) === true || data.countryCode === 'Yes',
            countryId: data.country_id !== undefined ? String(data.country_id) : (data.countryId !== undefined ? String(data.countryId) : ""),
            fieldMapping: typeof (data.fieldMapping || data.field_mappings) === 'object'
                ? JSON.stringify(data.fieldMapping || data.field_mappings, null, 2)
                : (data.fieldMapping || data.field_mappings || ""),
        };
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: getInitialValues(integration),
        validationSchema,
        onSubmit: async (values) => {
            // Helper function to capitalize first letter of each word
            const capitalizeServiceProvider = (value) => {
                if (!value) return value;
                // Convert snake_case to Title Case: 'custom' -> 'Custom', 'active_campaign' -> 'Active Campaign'
                return value
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
            };

            // Helper function to parse JSON string if valid, otherwise return as string
            const parseJsonOrString = (value) => {
                if (!value || value.trim() === '') return null;
                try {
                    // Try to parse as JSON
                    const parsed = JSON.parse(value);
                    // If it's already a string representation of JSON, return the string
                    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
                } catch (e) {
                    // If not valid JSON, return as string
                    return value;
                }
            };

            const processPlaceholders = (text) => {
                if (!text) return text;
                let processedText = text;

                // Replace %%CampaignID%% (case-insensitive)
                processedText = processedText.replace(/%%+CampaignID%%+/gi, values.campaignId || '');

                // Replace %%CountryCode%% (case-insensitive)
                const countryCodeValue = values.countryCode ? '+1' : '';
                processedText = processedText.replace(/%%+CountryCode%%+/gi, countryCodeValue);

                return processedText;
            };

            // For phone patterns like +1%%phone%% -> %%phone%%
            const processPhone = (text) => {
                if (!text) return text;
                const isCountryCode = values.countryCode === true || values.countryCode === 'Yes';
                return text.replace(/(\+1)?%%phone%%/gi, isCountryCode ? '+1%%phone%%' : '%%phone%%');
            };

            const payload = {
                api_description: values.apiDescription,
                api_type: values.apiType,
                service_provider: capitalizeServiceProvider(values.platform) || "Custom",
                platform: values.platform,
                campaign_id: values.campaignId,
                api_endpoint: values.apiEndpoint,
                timeout_after: parseInt(values.timeout) || 60,
                request_type: values.requestType.toUpperCase(),
                data_format: "json", // Based on payload structure, default to "json"
                url_encode: values.urlEncode === "Yes",
                date_format: values.dateFormat || values.date_format || "Y-m-d H:i:s",
                successful_response: values.successfulResponse || null,
                headers: processPlaceholders(parseJsonOrString(values.headers)),
                post_variables: processPlaceholders(parseJsonOrString(values.postVariables)),
                is_country_code_enabled: values.countryCode,
                country_id: values.countryId || null,
                field_mappings: values.fieldMapping ? (() => {
                    try {
                        return typeof values.fieldMapping === 'string'
                            ? JSON.parse(values.fieldMapping || "{}")
                            : values.fieldMapping;
                    } catch (e) {
                        console.error("Error parsing field_mappings:", e);
                        return {};
                    }
                })() : {},
            };

            try {
                await dispatch(updateApiIntegration({
                    platformId,
                    integrationId,
                    payload
                })).unwrap();

                toast.success("API Integration updated successfully!");
                navigate(`/platforms/${platformId}/api-integrations`);
            } catch (error) {
                toast.error(error || "Failed to update integration");
                console.error("Failed to update integration:", error);
            }
        },
    });

    // Live replacement logic for postVariables
    useEffect(() => {
        if (formik.values.campaignId && formik.values.postVariables) {
            let text = formik.values.postVariables;
            const newId = formik.values.campaignId;

            // 1. Try to replace original placeholder (case-insensitive)
            if (/%%+CampaignID%%+/gi.test(text)) {
                text = text.replace(/%%+CampaignID%%+/gi, newId);
                setIsFirstListIdSet(true);
            }
            // 2. If already replaced once, swap the old ID with the new one
            else if (isFirstListIdSet && lastListId && text.includes(lastListId)) {
                text = text.split(lastListId).join(newId);
            }

            if (text !== formik.values.postVariables) {
                formik.setFieldValue('postVariables', text);
            }
            setLastListId(newId);
        }
    }, [formik.values.campaignId]);

    useEffect(() => {
        if (formik.values.postVariables) {
            let text = formik.values.postVariables;
            const isCountryCode = formik.values.countryCode === true || formik.values.countryCode === 'Yes';

            // Case 1: Simple placeholder replacement
            if (/%%+CountryCode%%+/gi.test(text)) {
                text = text.replace(/%%+CountryCode%%+/gi, isCountryCode ? '+1' : '');
            }

            // Case 2: Standard phone anchor replacement
            if (isCountryCode) {
                if (!text.includes('+1%%phone%%') && /%%phone%%/gi.test(text)) {
                    text = text.replace(/%%phone%%/gi, '+1%%phone%%');
                }
            } else {
                // If "No", remove any +1 prefix attached to phone
                const messyPhoneRegex = /\+1[^a-zA-Z0-9]*%%phone%%/gi;
                if (messyPhoneRegex.test(text)) {
                    text = text.replace(messyPhoneRegex, '%%phone%%');
                }
            }

            if (text !== formik.values.postVariables) {
                formik.setFieldValue('postVariables', text);
            }
        }
    }, [formik.values.countryCode]);

    return (
        <>
            {/* Top Navigation */}
            <div>
                <Link to={`/platforms/${id}/api-integrations`} style={{ textDecoration: "none" }}>
                    <div className="flex items-center gap-2 md:gap-4 text-primary-dark font-bold text-md">
                        <img src={UnionIcon} alt="" />
                        <h2 className="text-md text-primary-dark font-bold">
                            Edit API Integration
                        </h2>
                    </div>
                </Link>
            </div>

            {/* Page Wrapper */}
            <div className="p-0 mt-4 md:mt-0 md:p-10 min-h-screen">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md">
                    <div className="p-5">
                        <h2 className="text-md text-primary-dark font-bold">{integration?.name || integration?.api_description || 'Edit API Integration'}</h2>
                    </div>

                    <hr className="border-t border-[#F1F1F4]" />

                    <div>
                        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-1">
                            {/* API Description */}
                            <div className="mx-6 mt-4">
                                <CustomTextField
                                    label="API Description"
                                    name="apiDescription"
                                    placeholder={`${integration?.name}`}
                                    value={formik.values.apiDescription}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.apiDescription
                                            ? formik.errors.apiDescription
                                            : ""
                                    }
                                />
                            </div>

                            {/* API Type */}
                            <div className="mx-6">
                                <CustomTextField
                                    label="API Type"
                                    name="apiType"
                                    isRadio={true}
                                    options={apiTypes}
                                    value={formik.values.apiType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.apiType ? formik.errors.apiType : ""}
                                />
                            </div>

                            <hr className="border-t border-[#F1F1F4] mb-2" />

                            {/* Platform Selection */}
                            <div className='mx-6 flex flex-col md:flex-row md:items-center gap-3'>
                                <div className='md:w-[200px]'>
                                    {platformsLoading ? (
                                        <div className="py-2">
                                            <LoadingSpinner text="Loading platforms..." size="md" />
                                        </div>
                                    ) : (
                                        <CustomTextField
                                            label="Platform"
                                            name="platform"
                                            isSelect={true}
                                            options={platformOptions}
                                            value={formik.values.platform}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.platform ? formik.errors.platform : ''}
                                        />
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 mb-2 pt-0 md:pt-2">
                                    Select a platform to configure API integration
                                </div>
                            </div>

                            {/* List ID dropdown - Show when platform is selected */}
                            {formik.values.platform && formik.values.platform !== 'custom' && (
                                <div className='mx-6'>
                                    <CustomTextField
                                        label="List ID"
                                        name="campaignId"
                                        isSelect={true}
                                        options={[
                                            { label: 'Please Select List', value: '' },
                                            ...listsDropdown,
                                        ]}
                                        value={formik.values.campaignId}
                                        onChange={(e) => {
                                            formik.setFieldValue('campaignId', e.target.value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.campaignId ? formik.errors.campaignId : ''}
                                    />
                                </div>
                            )}

                            {/* API Endpoint */}
                            <div className="mx-6">
                                <CustomTextField
                                    label="API Endpoint"
                                    name="apiEndpoint"
                                    placeholder="Enter API endpoint"
                                    value={formik.values.apiEndpoint}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.apiEndpoint ? formik.errors.apiEndpoint : ""
                                    }
                                />
                            </div>

                            {/* Timeout */}
                            {/* <div className="mx-6 w-40">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <div className="flex-1">
                                        <CustomTextField
                                            label="Timeout After"
                                            name="timeout"
                                            isSelect={true}
                                            options={[
                                                { label: "10", value: 10 },
                                                { label: "20", value: 20 },
                                                { label: "30", value: 30 },
                                                { label: "60", value: 60 },
                                            ]}
                                            value={formik.values.timeout}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.timeout ? formik.errors.timeout : ""}
                                        />
                                    </div>
                                    <span className="text-sm mt-1 sm:mt-0">Seconds</span>
                                </div>
                            </div> */}

                            {/* Date Format */}
                            {/* <div className="mx-6">
                                <CustomTextField
                                    label="Date Format"
                                    name="dateFormat"
                                    placeholder="Y-m-d H:i:s"
                                    value={formik.values.dateFormat}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.dateFormat ? formik.errors.dateFormat : ""
                                    }
                                />
                            </div> */}

                            {/* URL Encode */}
                            {/* <div className="mx-6">
                                <CustomTextField
                                    label="URL Encode"
                                    name="urlEncode"
                                    isRadio={true}
                                    options={urlEncodeOptions}
                                    value={formik.values.urlEncode}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.urlEncode ? formik.errors.urlEncode : ""}
                                />
                            </div> */}

                            {/* Country Code toggle */}
                            <div className='mx-6 flex items-center gap-3 py-1'>
                                <label className="text-sm font-medium text-gray-700">Country Code</label>
                                <div
                                    onClick={() => {
                                        const newValue = !formik.values.countryCode;
                                        formik.setFieldValue('countryCode', newValue);
                                    }}
                                    className="relative w-10 h-5 rounded-full cursor-pointer transition-colors duration-200"
                                    style={{ backgroundColor: formik.values.countryCode ? '#4f46e5' : '#d1d5db' }}
                                >
                                    <div
                                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                                        style={{ left: formik.values.countryCode ? '22px' : '2px' }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500">{formik.values.countryCode ? 'Yes' : 'No'}</span>
                            </div>

                            {/* Country dropdown - Show when country code is enabled */}
                            {formik.values.countryCode && (
                                <div className='mx-6'>
                                    <CustomTextField
                                        label="Country"
                                        name="countryId"
                                        isSelect={true}
                                        options={[
                                            { label: 'Select Country', value: '', disabled: true },
                                            ...countryOptions,
                                        ]}
                                        value={formik.values.countryId}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.countryId ? formik.errors.countryId : ''}
                                    />
                                </div>
                            )}

                            <div className='mx-6'>
                                <CustomTextField
                                    label="Post Variables"
                                    name="postVariables"
                                    isTextArea={true}
                                    placeholder="Enter content"
                                    value={formik.values.postVariables}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.postVariables ? formik.errors.postVariables : ''}
                                />
                            </div>

                            {/* Request Type */}
                            {/* <div className="mx-6">
                                <CustomTextField
                                    label="Request Type"
                                    name="requestType"
                                    isRadio={true}
                                    options={requestTypes}
                                    value={formik.values.requestType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.requestType ? formik.errors.requestType : ""
                                    }
                                />
                            </div> */}

                            {/* Successful Response */}
                            <div className="mx-6">
                                <CustomTextField
                                    label="Successful Response"
                                    name="successfulResponse"
                                    placeholder="Enter response"
                                    value={formik.values.successfulResponse}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.successfulResponse
                                            ? formik.errors.successfulResponse
                                            : ""
                                    }
                                />
                            </div>

                            <hr className="border-t border-[#F1F1F4] mb-2" />

                            {/* Headers */}
                            <div className="mx-6">
                                <CustomTextField
                                    label="Headers"
                                    name="headers"
                                    isTextArea={true}
                                    placeholder="Content-Type:application/json"
                                    value={formik.values.headers}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.headers ? formik.errors.headers : ""}
                                />
                            </div>

                            {/* Field Mapping */}
                            {/* <div className="mx-6">
                                <CustomTextField
                                    label="Field Mappings (JSON)"
                                    name="fieldMapping"
                                    isTextArea={true}
                                    placeholder="Enter content"
                                    value={formik.values.fieldMapping}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.fieldMapping ? formik.errors.fieldMapping : ""
                                    }
                                />
                            </div> */}


                            {/* Save Button */}
                            <CustomButton
                                type="submit"
                                position="end"
                                className="mt-5 cursor-pointer py-2.5 sm:py-3 text-sm sm:text-base rounded-xl mb-8 mx-6"
                            >
                                Save New Integration
                            </CustomButton>

                        </form>
                    </div>
                </div>
            </div>

            <div className="p-0 mt-6 md:mt-0 md:p-10 min-h-screen">
                <div className="max-w-4xl mx-auto ">
                    <ApiIntegrationPage header="Client API Integrations" showBackIcon={false} />
                </div>
            </div>



        </>
    );
}

export default EditApiIntegrations;
