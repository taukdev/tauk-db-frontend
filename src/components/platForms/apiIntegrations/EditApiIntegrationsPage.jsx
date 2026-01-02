import React, { useEffect } from "react";
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

const apiTypes = [
    { label: "Regular API", value: "Regular API" },
    { label: "Ping/Post", value: "Ping/Post" },
];
const urlEncodeOptions = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
];
const requestTypes = [
    { label: "Post", value: "POST" },
    { label: "Get", value: "GET" },
];

const validationSchema = Yup.object({
    apiDescription: Yup.string().required("API description is required"),
    apiType: Yup.string().required("API type is required"),
    apiEndpoint: Yup.string().required("API endpoint is required"),
    timeout: Yup.number()
        .min(1, "Minimum 1 second")
        .max(60, "Maximum 60 seconds")
        .required("Timeout is required"),
    dateFormat: Yup.string().required("Date format is required"),
    urlEncode: Yup.string().required("URL encode is required"),
    requestType: Yup.string().required("Request type is required"),
    successfulResponse: Yup.string(),
    headers: Yup.string(),
    fieldMapping: Yup.string(),
});

function EditApiIntegrations() {
    const { id, integrationId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const cleanApiEndpoint = (url = "") => {
        if (!url) return "";
        const index = url.indexOf(".json");
        return index !== -1 ? url.substring(0, index + 5) : url;
    };

    const getInitialValues = (data) => {
        if (!data) return {
            apiDescription: "",
            apiType: "Regular API",
            serviceProvider: "Custom",
            apiEndpoint: "",
            timeout: 60,
            dateFormat: "",
            urlEncode: "Yes",
            requestType: "POST",
            successfulResponse: "",
            headers: "",
            postVariables: "",
            fieldMapping: "",
        };

        return {
            apiDescription: data.name || data.api_description || "",
            apiType: data.apiType || data.api_type || "Regular API",
            serviceProvider: data.serviceProvider || data.service_provider || "custom",
            apiEndpoint: cleanApiEndpoint(data.apiEndpoint || data.api_endpoint || data.postUrl),
            timeout: data.timeout || data.timeout_after || 60,
            postVariables: data.postVariables || data.post_variables || "",
            dateFormat: data.dateFormat || data.date_format || "",
            urlEncode: (data.urlEncode !== undefined ? data.urlEncode : data.url_encode) === true || data.url_encode === "Yes" ? "Yes" : "No",
            requestType: (data.requestType || data.request_type || "POST").toUpperCase(),
            successfulResponse: data.response || data.successful_response || "",
            headers: data.headers || "",
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

            const payload = {
                api_description: values.apiDescription,
                api_type: values.apiType,
                service_provider: capitalizeServiceProvider(values.serviceProvider) || "Custom",
                api_endpoint: values.apiEndpoint,
                timeout_after: parseInt(values.timeout) || 60,
                request_type: values.requestType.toUpperCase(),
                data_format: "json", // Based on payload structure, default to "json"
                url_encode: values.urlEncode === "Yes",
                date_format: values.dateFormat || "Y-m-d H:i:s",
                successful_response: values.successfulResponse || null,
                headers: parseJsonOrString(values.headers),
                post_variables: parseJsonOrString(values.postVariables),
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

                navigate(`/platforms/${platformId}/api-integrations`);
            } catch (error) {
                // alert("Failed to update integration: " + error);
                console.error("Failed to update integration:", error);
            }
        },
    });

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
                        <h2 className="text-md text-primary-dark font-bold">{`${integration?.name}`}</h2>
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
                            <div className="mx-6 w-40">
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
                            </div>

                            {/* Date Format */}
                            <div className="mx-6">
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
                            </div>

                            {/* URL Encode */}
                            <div className="mx-6">
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
                            </div>

                            {/* Request Type */}
                            <div className="mx-6">
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
                            </div>

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
                            <div className="mx-6">
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
                                <div className="text-sm text-gray-500">
                                    Read about field mapping{" "}
                                    <a
                                        href="#"
                                        className="border-b border-primary border-dashed rounded cursor-pointer text-primary text-sm"
                                    >
                                        here
                                    </a>
                                </div>
                            </div>

                            {/* Hide Advanced */}
                            <div className="mx-6">
                                <button
                                    type="button"
                                    className="border-b border-primary border-dashed rounded cursor-pointer text-primary text-sm"
                                >
                                    Hide Advanced Options
                                </button>
                            </div>

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
