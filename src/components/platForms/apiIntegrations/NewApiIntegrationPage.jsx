import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { createApiIntegration } from '../../../features/platform/editApiIntegrationsSlice';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { selectPlatformById } from "../../../features/platform/platformSlice";
import CustomTextField from "../../CustomTextField";
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import CustomButton from "../../CustomButton";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import { getPlatformPresetsByProviderApi, getListsDropdownApi } from "../../../api/platforms";

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
  // { label: "Get", value: "GET" },
];

const validationSchema = Yup.object({
  apiDescription: Yup.string().required("API description is required"),
  apiType: Yup.string().required("API type is required"),
  platform: Yup.string().required("Platform is required"),
  campaignId: Yup.string(),
  apiEndpoint: Yup.string().required("API endpoint is required"),
  timeout: Yup.number()
    .min(1, "Minimum 1 second")
    .max(60, "Maximum 60 seconds")
    .required("Timeout is required"),
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
  const [listsDropdown, setListsDropdown] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      apiDescription: '',
      apiType: 'Regular API',
      platform: 'custom',
      presetId: '',
      campaignId: '',
      apiEndpoint: '',
      timeout: 60,
      postVariables: '',
      countryCode: false,
      dateFormat: 'Y-m-d H:i:s',
      urlEncode: 'No',
      requestType: 'POST',
      successfulResponse: '',
      headers: '{\n  "Content-Type": "application/json"\n}',
      fieldMapping: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);

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
        platform: capitalizeServiceProvider(values.platform) || "Custom",
        campaign_id: values.campaignId,
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
        toast.success("API Integration created successfully!");
        navigate(`/platforms/${id}/api-integrations`);
      } catch (error) {
        toast.error(error || "Failed to create integration");
        console.error("Failed to create integration:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

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
  }, []);

  // Auto-populate fields when platform changes
  useEffect(() => {
    if (formik.values.platform && formik.values.platform !== 'custom') {
      const fetchAndApplyPreset = async () => {
        try {
          const response = await getPlatformPresetsByProviderApi(formik.values.platform);

          // Normalize: API returns single object or array
          let preset = null;
          if (response?.data) {
            if (Array.isArray(response.data) && response.data.length > 0) {
              preset = response.data[0];
            } else if (typeof response.data === 'object' && response.data !== null && !Array.isArray(response.data)) {
              preset = response.data;
            }
          }

          if (preset) {
            // Parse headers
            let headersString = '{\n  "Content-Type": "application/json"\n}';
            try {
              if (preset.headers) {
                headersString = JSON.stringify(JSON.parse(preset.headers), null, 2);
              }
            } catch (e) {
              headersString = preset.headers || headersString;
            }

            // Parse post_variables
            let postVarsString = '';
            try {
              if (preset.post_variables) {
                postVarsString = JSON.stringify(JSON.parse(preset.post_variables), null, 2);
              }
            } catch (e) {
              postVarsString = preset.post_variables || '';
            }

            const currentCampaignId = formik.values.campaignId;
            const currentCountryCode = formik.values.countryCode;

            let finalPostVars = postVarsString;

            // Apply campaignId if already selected
            if (currentCampaignId && finalPostVars) {
              try {
                const parsed = JSON.parse(finalPostVars);
                if ('campaignId' in parsed) {
                  parsed.campaignId = parseInt(currentCampaignId) || currentCampaignId;
                  finalPostVars = JSON.stringify(parsed, null, 2);
                }
              } catch (e) { }
            }

            // Apply countryCode
            if (finalPostVars) {
              try {
                const parsed = JSON.parse(finalPostVars);
                for (const key of Object.keys(parsed)) {
                  const val = String(parsed[key]);
                  if (val.includes('%%phone%%') || val.includes('+1%%phone%%')) {
                    parsed[key] = currentCountryCode ? '+1%%phone%%' : '%%phone%%';
                  }
                }
                finalPostVars = JSON.stringify(parsed, null, 2);
              } catch (e) { }
            }

            formik.setValues({
              ...formik.values,
              apiEndpoint: preset.api_endpoint || '',
              postVariables: finalPostVars,
              successfulResponse: preset.successful_response || '',
              headers: headersString,
            });
          }
        } catch (error) {
          console.error('Error fetching preset for', formik.values.platform, ':', error);
        }
      };

      fetchAndApplyPreset();
    } else {
      // Reset fields when Custom is selected
      formik.setValues({
        ...formik.values,
        apiEndpoint: '',
        postVariables: '',
        successfulResponse: '',
        headers: '{\n  "Content-Type": "application/json"\n}',
      });
    }
  }, [formik.values.platform]);

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

              {/* <div className='mx-6'>
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
              </div> */}

              <hr className="border-t border-[#F1F1F4] mb-2" />

              {/* Platform Selection */}
              <div className='mx-6 flex flex-col md:flex-row md:items-center gap-3'>
                <div className='md:w-[200px]'>
                  <CustomTextField
                    label="Platform"
                    name="platform"
                    isSelect={true}
                    options={[
                      // { label: 'Custom', value: 'custom' },
                      { label: 'Active Campaign', value: 'active_campaign' },
                      { label: 'Adopia', value: 'adopia' },
                      { label: 'Drip', value: 'drip' },
                      { label: 'ListFlex', value: 'listflex' },
                      { label: 'Daily Story', value: 'daily_story' },
                      { label: 'TaukDial', value: 'taukdial' },
                    ]}
                    value={formik.values.platform}
                    onChange={(e) => {
                      formik.setFieldValue('platform', e.target.value);
                      formik.setFieldValue('presetId', ''); // Reset preset when platform changes
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.platform ? formik.errors.platform : ''}
                  />
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
                      const selectedId = e.target.value;
                      formik.setFieldValue('campaignId', selectedId);

                      // Auto-update campaignId in postVariables
                      if (selectedId && formik.values.postVariables) {
                        try {
                          const parsed = JSON.parse(formik.values.postVariables);
                          if ('campaignId' in parsed) {
                            parsed.campaignId = parseInt(selectedId) || selectedId;
                            formik.setFieldValue('postVariables', JSON.stringify(parsed, null, 2));
                          }
                        } catch (e) {
                          // Not valid JSON, skip
                        }
                      }
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.campaignId ? formik.errors.campaignId : ''}
                  />
                </div>
              )}

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

              {/* <div className="mx-6 w-40">
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
              </div> */}


              {/* Country Code toggle */}
              <div className='mx-6 flex items-center gap-3 py-1'>
                <label className="text-sm font-medium text-gray-700">Country Code</label>
                <div
                  onClick={() => {
                    const newValue = !formik.values.countryCode;
                    formik.setFieldValue('countryCode', newValue);

                    // Update phone in postVariables
                    if (formik.values.postVariables) {
                      try {
                        const parsed = JSON.parse(formik.values.postVariables);
                        // Find phone field (mobilePhone, phone, etc.)
                        for (const key of Object.keys(parsed)) {
                          const val = String(parsed[key]);
                          if (val.includes('%%phone%%')) {
                            parsed[key] = newValue ? '+1%%phone%%' : '%%phone%%';
                          }
                        }
                        formik.setFieldValue('postVariables', JSON.stringify(parsed, null, 2));
                      } catch (e) {
                        // Not valid JSON, skip
                      }
                    }
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
                {/* <div className="text-right mb-1">
                  <button type="button" className="border-b border-primary border-dashed rounded cursor-pointer text-primary text-sm">
                    Add Custom Fields
                  </button>
                </div> */}
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

              {/* <div className='mx-6'>
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
              </div> */}

              {/* <div className='mx-6'>
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
              </div> */}

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

              {/* <div className='mx-6'>
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
              </div> */}



              <CustomButton
                type="submit"
                position="end"
                className="mt-5 cursor-pointer py-2.5 sm:py-3 text-sm sm:text-base rounded-xl mb-8 mx-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save New Integration'}
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