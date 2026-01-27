import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { createApiIntegration } from '../../../features/platform/editApiIntegrationsSlice';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { selectPlatformById } from "../../../features/platform/platformSlice";
import CustomTextField from "../../CustomTextField";
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import CustomButton from "../../CustomButton";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";

const apiTypes = [
  { label: "Regular API", value: "Regular API" },
  // { label: "Ping/Post", value: "Ping/Post" },
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
  serviceProvider: Yup.string(),
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
});

function NewApiIntegrationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const platform = useSelector((state) => selectPlatformById(state, id));

  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      apiDescription: '',
      apiType: 'Regular API',
      serviceProvider: 'custom', // Match the select option value
      apiEndpoint: '',
      timeout: 60,
      postVariables: '',
      dateFormat: 'Y-m-d H:i:s',
      urlEncode: 'No', // Based on payload: url_encode: false
      requestType: 'POST',
      successfulResponse: '',
      headers: '{\n  "Content-Type": "application/json"\n}', // JSON string format
      fieldMapping: '',
    },
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

      // Map form values to API payload snake_case
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
        await dispatch(createApiIntegration({ platformId: id, payload })).unwrap();
        navigate(`/platforms/${id}/api-integrations`);
      } catch (error) {
        // alert("Failed to create integration: " + error);
        console.error("Failed to create integration:", error);
      }
    },
  });

  useEffect(() => {
    if (platform) {
      dispatch(
        setBreadcrumbs([
          { label: "Platforms", path: "/platforms" },
          { label: platform.name || platform.platform_name || "Platform", path: "/platforms/" + platform.id + "/" },
          { label: "API Integration", path: "/platforms/" + platform.id + "/api-integrations" },
          { label: "Add New API Integration", path: "/platforms/" + platform.id + "/new-api-integration" },
        ])
      );
    }
  }, [dispatch, platform]);

  return (
    <>

      <div>
        <Link to={`/platforms/${id}/api-integrations`} style={{ textDecoration: 'none' }}>
          <div className='flex items-center gap-2 md:gap-4 text-primary-dark font-bold text-md'>
            <img src={UnionIcon} alt="" />
            <h2 className="text-md text-primary-dark font-bold">Add New API Integration</h2>
          </div>
        </Link>
      </div>

      <div className="mt-4 md:mt-10 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md">
          <div className="p-5">
            <h2 className="text-md text-primary-dark font-bold">API Information</h2>
          </div>

          <hr className="border-t border-[#F1F1F4]" />
          {/* <div className="mx-6 mt-5 md:m-10 md:mt-7"> */}
          <div>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-1">

              <div className='mx-6 mt-4'>
                <CustomTextField
                  size='md'

                  label="API Description"
                  name="apiDescription"
                  placeholder="Add description"
                  value={formik.values.apiDescription}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.apiDescription ? formik.errors.apiDescription : ''}
                />
              </div>

              <div className='mx-6'>
                <CustomTextField
                  label="API Type"
                  name="apiType"
                  isRadio={true}
                  options={apiTypes}
                  value={formik.values.apiType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.apiType ? formik.errors.apiType : ''}
                />
              </div>

              <hr className="border-t border-[#F1F1F4] mb-2" />

              {/* Service Provider */}
              <div className='mx-6 flex flex-col md:flex-row md:items-center gap-3'>
                <div className='md:w-[200px]'>
                  <CustomTextField
                    label="Service Provider"
                    name="serviceProvider"
                    isSelect={true}
                    options={[
                      { label: 'Custom', value: 'custom' },
                      { label: 'Active Campaign', value: 'active_campaign' },
                      { label: 'Adopia', value: 'adopia' },
                      { label: 'Drip', value: 'drip' },
                      { label: 'ListFlex', value: 'listflex' },

                    ]}
                    value={formik.values.serviceProvider}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.serviceProvider ? formik.errors.serviceProvider : ''}
                  />
                </div>

                <div className="text-xs text-gray-500 mb-2 pt-0 md:pt-2">
                  Click this dropdown to see if we have an API built for your service
                </div>
              </div>


              <div className='mx-6'>
                <CustomTextField
                  label="API Endpoint"
                  name="apiEndpoint"
                  placeholder="Enter API endpoint"
                  value={formik.values.apiEndpoint}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.apiEndpoint ? formik.errors.apiEndpoint : ''}
                />
              </div>

              <div className="mx-6 w-40">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex-1">
                    <CustomTextField
                      label="Timeout After"
                      name="timeout"
                      placeholder="00"
                      isSelect={true}
                      options={[
                        { label: '10', value: 10 },
                        { label: '20', value: 20 },
                        { label: '30', value: 30 },
                        { label: '60', value: 60 },
                      ]}
                      value={formik.values.timeout}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.timeout ? formik.errors.timeout : ''}
                    />
                  </div>
                  <span className="text-sm mt-1 sm:mt-0">Seconds</span>
                </div>
              </div>


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
                <div className="text-right mb-1">
                  <button type="button" className="border-b border-primary border-dashed rounded cursor-pointer text-primary text-sm">
                    Add Custom Fields
                  </button>
                </div>
              </div>

              {/* <div className='mx-6'>
                <CustomTextField
                  label="Date Format"
                  name="dateFormat"
                  placeholder="Y-m-d H:i:s"
                  value={formik.values.dateFormat}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.dateFormat ? formik.errors.dateFormat : ''}
                />
              </div> */}

              <div className='mx-6'>
                <CustomTextField
                  label="URL Encode"
                  name="urlEncode"
                  isRadio={true}
                  options={urlEncodeOptions}
                  value={formik.values.urlEncode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.urlEncode ? formik.errors.urlEncode : ''}
                />
              </div>

              <div className='mx-6'>
                <CustomTextField
                  label="Request Type"
                  name="requestType"
                  isRadio={true}
                  options={requestTypes}
                  value={formik.values.requestType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.requestType ? formik.errors.requestType : ''}
                />
              </div>

              <div className='mx-6'>
                <CustomTextField
                  label="Successful Response"
                  name="successfulResponse"
                  placeholder="Enter response"
                  value={formik.values.successfulResponse}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.successfulResponse ? formik.errors.successfulResponse : ''}
                />
              </div>

              <hr className="border-t border-[#F1F1F4] mb-2" />

              <div className='mx-6'>
                <CustomTextField
                  label="Headers"
                  name="headers"
                  isTextArea={true}
                  placeholder="Content-Type:application/json"
                  value={formik.values.headers}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.headers ? formik.errors.headers : ''}
                />
              </div>

              <div className='mx-6'>
                <CustomTextField
                  label="Field Mappings (JSON)"
                  name="fieldMapping"
                  isTextArea={true}
                  placeholder="Enter content"
                  value={formik.values.fieldMapping}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fieldMapping ? formik.errors.fieldMapping : ''}
                />
                <div className="text-sm text-gray-500">
                  Read about field mapping <a href="#" className="border-b border-primary border-dashed rounded cursor-pointer text-primary text-sm">here</a>
                </div>
              </div>

              <div className='mx-6'>
                <button type="button" className="border-b border-primary border-dashed rounded cursor-pointer text-primary text-sm">
                  Hide Advanced Options
                </button>
              </div>

              <CustomButton
                type="submit"
                position="end"
                className="mt-5 cursor-pointer py-2.5 sm:py-3 text-sm sm:text-base rounded-xl mb-8 mx-6"
              >
                Save New Integration
              </CustomButton>

            </form>
          </div>

          {/* </div> */}
        </div>
      </div>
    </>
  );
}

export default NewApiIntegrationPage;