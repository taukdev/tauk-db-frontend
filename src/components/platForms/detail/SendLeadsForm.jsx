// SendLeadsForm.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useParams } from "react-router-dom";
import CustomTextField from "../../CustomTextField";
import Checkbox from "../../common/Checkbox";
import { setFormValues } from "../../../features/platform/sendLeadsSlice";
import UnionIcon from "../../../assets/icons/Union-icon.svg";
import { ChevronDown, ChevronRight } from "lucide-react";
import DangerIcon from "../../../assets/icons/DangerCircle-icon.svg";
import trush from "../../../assets/icons/trush.svg";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import { selectPlatformById } from "../../../features/platform/platformSlice";
import { createPlatformOrder, fetchPlatformOrders } from "../../../features/platform/platformOrdersSlice";
import { fetchApiIntegrations } from "../../../features/platform/apiIntegrationsSlice";
import { getListsDropdownApi, getCountriesApi, getStatesApi } from "../../../api/platforms";
import DatePickerField from "../../DatePickerField";
import LiveFeedForm from "./sendleadRadio/LiveFeedForm";
import PriorityOrderForm from "./sendleadRadio/PriorityOrderForm";
import OneTimeBatchPostForm from "./sendleadRadio/OneTimeBatchPostForm";
import BiddingOrderForm from "./sendleadRadio/BiddingOrderForm";

// Validation Schema
const leadFieldsList = [
  "Email Address",
  "First Name",
  "Last Name",
  "Phone Number",
  "Alternative Phone Number",
  "Country",
  "IP Address",
  "Physical Address",
  "City",
  "State",
  "Zip Code",
  "Gender",
  "Offer Form URL",
  "Signup Date",
  "Date of Birth",
  "Comments",
];

const validationSchema = Yup.object({
  // Only pickLists is required
  pickLists: Yup.array().min(1, "Please select at least one list"),
  
  // All other fields are optional
  orderType: Yup.string().nullable(),
  testPurpose: Yup.bool().nullable(),
  internalView: Yup.bool().nullable(),
  leadsQuantity: Yup.number().nullable(),
  pricePerRecord: Yup.number().nullable(),
  sortOrder: Yup.string().nullable(),
  leadFields: Yup.array().nullable(), // Removed min requirement
  fieldStrictness: Yup.string().oneOf(["strict", "loose"]).nullable(),
  areaCodes: Yup.string()
    .nullable()
    .test(
      "area-codes-format",
      "Invalid format. Use numbers separated by comma or newline.",
      (value) => {
        if (!value) return true;
        const validCharacters = /^[0-9,\s\n]*$/;
        return validCharacters.test(value);
      }
    ),
  excludeAreaCodes: Yup.bool().nullable(),
  excludeIsps: Yup.string().nullable(),
  includeIsps: Yup.string().nullable(),
  genderMale: Yup.boolean().nullable(),
  genderFemale: Yup.boolean().nullable(),
  selectedStates: Yup.array().of(Yup.string()).nullable(),
  excludeStates: Yup.bool().nullable(),
  customFilters: Yup.array().of(
    Yup.object({
      customField: Yup.string().nullable(), // Made optional
      customValue: Yup.string()
        .nullable()
        .test(
          "not-numeric-only",
          "Numeric values are not allowed here",
          (value) => {
            if (!value) return true;
            return isNaN(Number(value));
          }
        ),
      filterType: Yup.string().oneOf(["Include", "Exclude"]).nullable(), // Made optional
    })
  ).nullable(),
  
  disregardLocks: Yup.bool().nullable(),
  dedupeDaysBack: Yup.string().nullable(),
});

const SendLeadsForm = () => {
  const { id } = useParams();
  const platform = useSelector((state) => selectPlatformById(state, id));
  const { integrations } = useSelector((state) => state.apiIntegrations || { integrations: [] });
  const { creating } = useSelector((state) => state.platformOrders || { creating: false });

  // Format integrations for dropdown options
  // Include "Backoffice" as first option, then API integrations
  const integrationOptions = React.useMemo(() => {
    const options = [
      { label: "Backoffice", value: "backoffice" }
    ];
    
    if (Array.isArray(integrations) && integrations.length > 0) {
      const apiOptions = integrations
        .filter(integration => integration && (integration.id || integration._id)) // Filter out invalid entries
        .map(integration => {
          const id = String(integration.id || integration._id || "");
          const label = integration.api_description || integration.name || `Integration ${id}`;
          return { label, value: id };
        });
      options.push(...apiOptions);
    }
    
    return options;
  }, [integrations]);

  // Dedupe Days options
  const daysBackOptions = [
    { label: "Select Days Back", value: "" },
    { label: "No Limit", value: "no-limit" },
    { label: "7 Days", value: "7" },
    { label: "14 Days", value: "14" },
    { label: "30 Days", value: "30" },
    { label: "60 Days", value: "60" },
    { label: "90 Days", value: "90" },
  ];

  // Filter section state (expand/collapse)
  const [expanded, setExpanded] = React.useState("Lead Validation");
  const [selectedCountry, setSelectedCountry] = React.useState("United States");

  const filterSections = [
    "Lead Validation",
    "Countries",
    "US Area Codes",
    "ZIP Codes",
    "Exclude ISPS",
    "Include ISPS",
    "Gender",
    "States",
    "Filter by Custom Field",
    "Filter by Offer URL",
    "Block Domains",
    "Lead Locking",
  ];

  // Fetch countries dropdown on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        const response = await getCountriesApi();
        
        // Handle different response structures
        let countriesData = [];
        if (Array.isArray(response)) {
          countriesData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          countriesData = response.data;
        } else if (response?.data?.countries && Array.isArray(response.data.countries)) {
          countriesData = response.data.countries;
        }

        // Format countries - extract country names
        const formattedCountries = countriesData.map((country) => {
          // If it's already a string, use it
          if (typeof country === 'string') {
            return country;
          }
          // If it's an object, try to get the name
          return country.name || country.country_name || country.country || String(country);
        });

        setCountriesList(formattedCountries);
      } catch (error) {
        console.error("Error fetching countries dropdown:", error);
        // Keep default countries on error
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // State for states dropdown
  const [statesList, setStatesList] = useState([
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ]);
  const [statesLoading, setStatesLoading] = useState(true);

  // Fetch states dropdown on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setStatesLoading(true);
        const response = await getStatesApi();
        
        // Handle different response structures
        let statesData = [];
        if (Array.isArray(response)) {
          statesData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          statesData = response.data;
        } else if (response?.data?.states && Array.isArray(response.data.states)) {
          statesData = response.data.states;
        }

        // Format states - extract state names
        const formattedStates = statesData.map((state) => {
          // If it's already a string, use it
          if (typeof state === 'string') {
            return state;
          }
          // If it's an object, try to get the name
          return state.name || state.state_name || state.state || String(state);
        });

        setStatesList(formattedStates);
      } catch (error) {
        console.error("Error fetching states dropdown:", error);
        // Keep default states on error
      } finally {
        setStatesLoading(false);
      }
    };

    fetchStates();
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for lists dropdown
  const [pickListOptions, setPickListOptions] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);

  // State for countries dropdown
  const [countriesList, setCountriesList] = useState([
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "New Zealand",
    "South Africa",
    "Ireland",
    "Germany",
    "France",
    "Italy",
    "china",
    "Spain",
  ]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  // Fetch lists dropdown on component mount
  useEffect(() => {
    const fetchLists = async () => {
      try {
        setListsLoading(true);
        const response = await getListsDropdownApi();
        
        // Handle different response structures
        let listsData = [];
        if (Array.isArray(response)) {
          listsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          listsData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          listsData = response.data.data;
        }

        // Format lists as "ID - Name" for display
        const formattedLists = listsData.map((list) => {
          const id = list.id || list.list_id || "";
          const name = list.name || list.list_name || "";
          return `${id} - ${name}`;
        });

        setPickListOptions(formattedLists);
      } catch (error) {
        console.error("Error fetching lists dropdown:", error);
        // Fallback to empty array on error
        setPickListOptions([]);
      } finally {
        setListsLoading(false);
      }
    };

    fetchLists();
  }, []);

  const initialValues = {
    orderType: "leadFile",
    testPurpose: true,
    internalView: true,
    leadsQuantity: "",
    pricePerRecord: "",
    sortOrder: "ascending",
    leadFields: [],
    fieldStrictness: "strict",
    pickLists: [],
    signupStartDate: "",
    signupEndDate: "",
    importStartDate: "",
    importEndDate: "",
    dedupeDaysBack: "",
    previewOnly: false,
    areaCodes: "",
    excludeAreaCodes: false,
    excludeIsps: "",
    includeIsps: "",
    genderMale: false,
    genderFemale: false,
    selectedStates: [],
    excludeStates: false,
    customFilters: [
      {
        customField: "",
        customValue: "",
        filterType: "Include",
        showDropdown: false,
      },
    ],
    disregardLocks: false,
    // Additional fields
    zipCodes: "",
    excludeZipCodes: false,
    filterOfferUrl: "",
    dateSeeded: "",
    blockDomainGroups: [],
    deliveryStartHour: "",
    deliveryStartMinute: "",
    deliveryEndHour: "",
    deliveryEndMinute: "",
    deliveryWeekdays: [],
    orderTypeCategory: null,
    orderNotes: "",
    paymentAssociationId: null,
    // Live Feed fields
    liveFeedIntegration: "backoffice",
    liveFeedCutOffDate: "",
    liveFeedLeadTurn: "0",
    liveFeedDailyCap: "",
    liveFeedPostStatus: "paused",
    liveFeedPostStartTime: "",
    liveFeedPostingFrequency: "every5min",
    liveFeedDelayBetweenPosts: 0,
    // Priority Order fields
    priorityIntegration: "backoffice",
    priorityDailyCap: "",
    priorityPostStatus: "paused",
    priorityPostStartTime: "",
    // One-Time Batch Post fields
    batchPostIntegration: "backoffice",
    batchPostStatus: "paused",
    batchPostStartTime: "",
    // Bidding Order fields
    biddingIntegration: "backoffice",
    biddingDailyCap: "",
    biddingPostStatus: "paused",
    biddingPostStartTime: "",
  };

  // Helper function to remove null, undefined, and empty string values from payload
  const cleanPayload = (payload) => {
    const cleaned = {};
  
    Object.entries(payload).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
  
      if (Array.isArray(value) && value.length === 0) return;
  
      if (value === "All") return;
  
      cleaned[key] = value;
    });
  
    return cleaned;
  };
  

  // Helper function to map form values to API payload
  const mapFormValuesToApiPayload = (values) => {
    // Map order_kind: Only 'Lead File' OR 'Live Feed'
    // Map order_type_category: 'Priority Order', 'One-Time Batch Post', OR 'Bidding Order'
    const orderKindMap = {
      leadFile: "Lead File",
      liveFeed: "Live Feed",
      priority: "Live Feed", // Priority Order uses Live Feed as order_kind
      batchPost: "Live Feed", // One-Time Batch Post uses Live Feed as order_kind
      bidding: "Live Feed", // Bidding Order uses Live Feed as order_kind
    };

    const orderTypeCategoryMap = {
      leadFile: null,
      liveFeed: null,
      priority: "Priority Order",
      batchPost: "One-Time Batch Post",
      bidding: "Bidding Order",
    };

    // Map sort order
    const sortOrderMap = {
      ascending: "Ascending",
      descending: "Descending",
    };

    // Map field selection type
    const fieldStrictnessMap = {
      strict: "Strict",
      loose: "Loose",
    };

    // Map lead fields from display names to API field names
    const fieldNameMap = {
      "Email Address": "email_address",
      "First Name": "first_name",
      "Last Name": "last_name",
      "Phone Number": "phone_number",
      "Alternative Phone Number": "alternative_phone_number",
      "Country": "country",
      "IP Address": "ip_address",
      "Physical Address": "physical_address",
      "City": "city",
      "State": "state",
      "Zip Code": "zip_code",
      "Gender": "gender",
      "Offer Form URL": "offer_form_url",
      "Signup Date": "signup_date",
      "Date of Birth": "date_of_birth",
      "Comments": "comments",
    };

    // Extract list IDs from pick lists (assuming format: "ID - Name")
    const listIds = values.pickLists
      .map((list) => {
        const match = list.match(/^(\d+)\s*-/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((id) => id !== null);

    // Get API integration ID based on order type
    let apiIntegrationId = null;
    if (values.orderType === "liveFeed") {
      if (values.liveFeedIntegration !== "backoffice") {
        // Try to find integration by ID first, then by name
        const integration = integrations.find(
          (int) => String(int.id) === String(values.liveFeedIntegration) || 
                   int.name === values.liveFeedIntegration ||
                   int.api_description === values.liveFeedIntegration
        );
        apiIntegrationId = integration?.id || (isNaN(values.liveFeedIntegration) ? null : parseInt(values.liveFeedIntegration, 10));
      }
    } else if (values.orderType === "priority") {
      if (values.priorityIntegration !== "backoffice") {
        const integration = integrations.find(
          (int) => String(int.id) === String(values.priorityIntegration) || 
                   int.name === values.priorityIntegration ||
                   int.api_description === values.priorityIntegration
        );
        apiIntegrationId = integration?.id || (isNaN(values.priorityIntegration) ? null : parseInt(values.priorityIntegration, 10));
      }
    } else if (values.orderType === "batchPost") {
      if (values.batchPostIntegration !== "backoffice") {
        const integration = integrations.find(
          (int) => String(int.id) === String(values.batchPostIntegration) || 
                   int.name === values.batchPostIntegration ||
                   int.api_description === values.batchPostIntegration
        );
        apiIntegrationId = integration?.id || (isNaN(values.batchPostIntegration) ? null : parseInt(values.batchPostIntegration, 10));
      }
    } else if (values.orderType === "bidding") {
      if (values.biddingIntegration !== "backoffice") {
        const integration = integrations.find(
          (int) => String(int.id) === String(values.biddingIntegration) || 
                   int.name === values.biddingIntegration ||
                   int.api_description === values.biddingIntegration
        );
        apiIntegrationId = integration?.id || (isNaN(values.biddingIntegration) ? null : parseInt(values.biddingIntegration, 10));
      }
    }
    
    // If no integration selected and integrations exist, use first one (or set to null if backoffice)
    if (apiIntegrationId === null && integrations.length > 0 && values.orderType !== "leadFile") {
      // Only set default if not explicitly "backoffice"
      const integrationValue = values.orderType === "liveFeed" ? values.liveFeedIntegration :
                             values.orderType === "priority" ? values.priorityIntegration :
                             values.orderType === "batchPost" ? values.batchPostIntegration :
                             values.biddingIntegration;
      if (integrationValue !== "backoffice") {
        apiIntegrationId = integrations[0].id;
      }
    }

    // Map selected fields - handle empty array
    const selectedFields = (values.leadFields && values.leadFields.length > 0)
      ? values.leadFields.map((field) => fieldNameMap[field] || field.toLowerCase().replace(/\s+/g, "_"))
      : [];

    // Format signup dates
    const signupDatesString = values.signupStartDate && values.signupEndDate
      ? `${values.signupStartDate} to ${values.signupEndDate}`
      : null;

    // Format gender as array
    const genderArray = [];
    if (values.genderMale) genderArray.push("Male");
    if (values.genderFemale) genderArray.push("Female");
    const genderValue = genderArray.length === 0 ? "All" : (genderArray.length === 2 ? ["Male", "Female"] : genderArray);

    // Format area codes - convert newlines to commas if needed
    const areaCodesFormatted = values.areaCodes 
      ? values.areaCodes.replace(/\n/g, ',').replace(/\s+/g, '').replace(/,+/g, ',')
      : null;

    // Format zip codes
    const zipCodesFormatted = values.zipCodes 
      ? values.zipCodes.replace(/\n/g, ',').replace(/\s+/g, '').replace(/,+/g, ',')
      : null;

    // Format ESPs with newlines
    const excludedEspsFormatted = values.excludeIsps 
      ? values.excludeIsps.replace(/,/g, '\n')
      : null;
    const includedEspsFormatted = values.includeIsps 
      ? values.includeIsps.replace(/,/g, '\n')
      : null;

    // Map custom filters - handle empty/null values
    const customFieldFilter = (values.customFilters || [])
      .filter(
        filter =>
          filter &&
          filter.customField &&
          filter.customValue &&
          isNaN(Number(filter.customValue))
      )
      .map(filter => ({
        field_name: filter.customField,
        field_value: filter.customValue
      }));

    // Build base payload with all fields
    // Ensure list_ids is always sent if pickLists has values (required field)
    const payload = {
      order_kind: orderKindMap[values.orderType] || "Lead File",
      order_type_category: orderTypeCategoryMap[values.orderType] || null,
      api_integration_id: apiIntegrationId,
      is_test_file: values.testPurpose ?? true,
      internal_view_only: values.internalView ?? true,
      lead_quantity: values.leadsQuantity ? parseInt(values.leadsQuantity, 10) : null,
      price_per_lead: values.pricePerRecord ? parseFloat(values.pricePerRecord) : 0.0,
      sort_order: sortOrderMap[values.sortOrder] || values.sortOrder || "Ascending",
      field_selection_type: fieldStrictnessMap[values.fieldStrictness] || values.fieldStrictness || "Strict",
      selected_fields: selectedFields.length > 0 ? selectedFields : null,
      list_ids: listIds.length > 0 ? listIds : null, // Required - validation ensures this is not null
      // Single list_id if only one list selected
      list_id: listIds.length === 1 ? listIds[0] : null,
      ...(values.dedupeDaysBack && values.dedupeDaysBack !== "no-limit"
        ? { dedupe_back_days: parseInt(values.dedupeDaysBack, 10) }
        : {}),
      date_seeded: values.dateSeeded || null,
      order_type: "POST",
      order_notes: values.orderNotes || "",
      payment_association_id: values.paymentAssociationId || null,
      // Signup dates - both string format and separate dates
      signup_dates: signupDatesString || null,
      signup_date_from: values.signupStartDate || null,
      signup_date_to: values.signupEndDate || null,
      // Import dates
      import_dates_from: values.importStartDate || null,
      import_dates_to: values.importEndDate || null,
      // Countries - send as array of IDs if available, otherwise as string
      countries: Array.isArray(selectedCountry) ? selectedCountry : (selectedCountry || "All"),
      // Area codes
      area_codes: areaCodesFormatted || null,
      exclude_area_codes: values.excludeAreaCodes || false,
      // Zip codes
      zip_codes: zipCodesFormatted || null,
      exclude_zip_codes: values.excludeZipCodes || false,
      // Gender as array
      gender: genderArray.length > 0 ? genderArray : null,
      // States
      excluded_states: values.selectedStates && values.selectedStates.length > 0 
        ? values.selectedStates.join(', ') 
        : null,
      exclude_states: values.excludeStates || false,
      // ESPs
      excluded_esps: excludedEspsFormatted || null,
      included_esps: includedEspsFormatted || null,
      // Offer URL
      offer_url: values.filterOfferUrl || null,
      // Custom field filters
      custom_field_filter: customFieldFilter.length > 0 ? customFieldFilter : null,
      // Block domain groups
      block_domain_groups: values.blockDomainGroups && values.blockDomainGroups.length > 0 
        ? values.blockDomainGroups 
        : null,
      // Disregard locks
      disregard_locks: values.disregardLocks || false,
      // Delivery settings
      delivery_start_hour: values.deliveryStartHour ? parseInt(values.deliveryStartHour, 10) : null,
      delivery_start_minute: values.deliveryStartMinute ? parseInt(values.deliveryStartMinute, 10) : null,
      delivery_end_hour: values.deliveryEndHour ? parseInt(values.deliveryEndHour, 10) : null,
      delivery_end_minute: values.deliveryEndMinute ? parseInt(values.deliveryEndMinute, 10) : null,
      delivery_weekdays: values.deliveryWeekdays && values.deliveryWeekdays.length > 0 
        ? values.deliveryWeekdays 
        : null,
    };

    if (values.orderType === "liveFeed") {
      // Live Feed specific fields
      payload.cutoff_date = values.liveFeedCutOffDate || null;
      payload.when_leads_turn = `${values.liveFeedLeadTurn} Hours`;
      payload.daily_cap = values.liveFeedDailyCap ? parseInt(values.liveFeedDailyCap, 10) : null;
      payload.post_status = values.liveFeedPostStatus === "paused" ? "Paused" : "Active";
      payload.post_start_time = values.liveFeedPostStartTime || null;
      payload.post_frequency = values.liveFeedPostingFrequency === "every5min" ? "Every 5 minutes" : "Once daily";
      payload.delay_between_posts = values.liveFeedDelayBetweenPosts || 0;
    } else if (values.orderType === "priority") {
      // Priority Order specific fields
      payload.daily_cap = values.priorityDailyCap ? parseInt(values.priorityDailyCap, 10) : null;
      payload.post_status = values.priorityPostStatus === "paused" ? "Paused" : "Active";
      payload.post_start_time = values.priorityPostStartTime || null;
      // order_type_category already set above
    } else if (values.orderType === "batchPost") {
      // One-Time Batch Post specific fields
      payload.post_status = values.batchPostStatus === "paused" ? "Paused" : "Active";
      payload.post_start_time = values.batchPostStartTime || null;
      // order_type_category already set above
    } else if (values.orderType === "bidding") {
      // Bidding Order specific fields
      payload.daily_cap = values.biddingDailyCap ? parseInt(values.biddingDailyCap, 10) : null;
      payload.post_status = values.biddingPostStatus === "paused" ? "Paused" : "Active";
      payload.post_start_time = values.biddingPostStartTime || null;
      // order_type_category already set above
    }
    // Lead File: No additional fields needed (basic order)
    
    // Add post_status for all order types if not already set
    if (!payload.post_status) {
      payload.post_status = "Paused";
    }

    // Remove null, undefined, and empty string values from payload
    return cleanPayload(payload);
  };

  const handleSubmit = async (values) => {
    // Prevent double submission
    if (creating) {
      return;
    }

    // Validate pickLists is not empty (should be caught by validation schema, but double-check)
    if (!values.pickLists || values.pickLists.length === 0) {
      formik.setFieldTouched('pickLists', true);
      return;
    }

    try {
      const payload = mapFormValuesToApiPayload(values);
      console.log('Submitting payload:', payload); // Debug log
      const result = await dispatch(createPlatformOrder({ platformId: id, payload })).unwrap();
      
      // Refresh orders list to show the newly created order
      await dispatch(fetchPlatformOrders(id));
      
      // On success, navigate to confirmation or order detail
      if (result?.id) {
        navigate(`/platform/${id}/orders/${result.id}`);
      } else {
        navigate(`/platforms/${id}`);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      
      // Extract error message from API response
      let errorMessage = "Failed to create order. Please try again.";
      
      // Handle error from Redux thunk (can be string or object)
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      // Set error message for form display
      setErrorMessage(errorMessage);
      
      // Log detailed error for debugging
      console.error("Order creation error details:", {
        error,
        errorMessage,
        platformId: id,
        payload: mapFormValuesToApiPayload(values)
      });
      
      // Show more detailed error for enum validation
      if (errorMessage.includes("enum") && errorMessage.includes("order_kind")) {
        const orderKindMap = {
          leadFile: "Lead File",
          liveFeed: "Live Feed",
          priority: "Priority Order",
          batchPost: "One-Time Batch Post",
          bidding: "Bidding Order",
        };
        const attemptedValue = orderKindMap[values.orderType] || values.orderType;
        errorMessage = `Invalid order type "${attemptedValue}". The API may not support Bidding Orders. Please try: Lead File, Live Feed, Priority Order, or One-Time Batch Post.`;
      }
      
      alert(errorMessage);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  // Pick lists logic
  const availablePickLists = pickListOptions.filter(
    (item) => !formik.values.pickLists.includes(item)
  );
  const selectedPickLists = formik.values.pickLists;

  const handleSelectPickList = (item) => {
    formik.setFieldValue("pickLists", [...formik.values.pickLists, item]);
  };
  const handleDeselectPickList = (item) => {
    formik.setFieldValue(
      "pickLists",
      formik.values.pickLists.filter((i) => i !== item)
    );
  };
  const handleSelectAllPickLists = () => {
    formik.setFieldValue("pickLists", [...pickListOptions]);
  };
  const handleDeselectAllPickLists = () => {
    formik.setFieldValue("pickLists", []);
  };

  useEffect(() => {
    if (platform) {
      dispatch(
        setBreadcrumbs([
          { label: "Platforms", path: "/platforms" },
          { label: platform.name, path: "/platforms/" + platform.id + "/" },
          {
            label: "Send Leads",
            path: "/platforms/" + platform.id + "/send-leads",
          },
        ])
      );
    }
  }, [dispatch, platform]);

  // Fetch API integrations on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchApiIntegrations(id));
    }
  }, [dispatch, id]);

  // Helper to toggle state selection
  const toggleStateSelection = (stateName) => {
    const currentStates = formik.values.selectedStates || [];
    let newStates;

    if (currentStates.includes(stateName)) {
      newStates = currentStates.filter((s) => s !== stateName);
    } else {
      newStates = [...currentStates, stateName];
    }

    formik.setFieldValue("selectedStates", newStates);
  };

  // toggle lead field selection (uses Checkbox component)
  const toggleLeadField = (field) => {
    const current = formik.values.leadFields || [];
    if (current.includes(field)) {
      formik.setFieldValue(
        "leadFields",
        current.filter((f) => f !== field)
      );
    } else {
      formik.setFieldValue("leadFields", [...current, field]);
    }
  };

  // Custom filters handlers
  const handleAddCustomFilter = () => {
    const newFilter = {
      customField: "",
      customValue: "",
      filterType: "Include",
      showDropdown: false,
    };
    formik.setFieldValue("customFilters", [
      ...(formik.values.customFilters || []),
      newFilter,
    ]);
  };

  const handleRemoveCustomFilter = (index) => {
    const newFilters = (formik.values.customFilters || []).filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("customFilters", newFilters);
  };

  const customFieldOptions = [
    "Custom Field 1 (API)",
    "Lead Source",
    "Affiliate ID",
    "Campaign ID",
  ];

  return (
    <>
      <div>
        <Link
          to={`/platforms/${id}`}
          className="cursor-pointer flex items-center gap-2"
        >
          <img src={UnionIcon} alt="Back" />
          <h2 className="text-xl text-primary-dark font-bold">Leader Order Form</h2>
        </Link>
      </div>

      <div className="p-0 md:p-10 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md">
          <div className="p-5">
            <h2 className="text-lg text-primary-dark font-bold">API Information</h2>
          </div>

          <hr className="border-t border-[#F1F1F4]" />

          <form onSubmit={formik.handleSubmit} className="py-7 flex flex-col">
            {/* Order Type section -> using CustomTextField radios */}
            <div className="flex flex-col gap-2 p-3 mx-5 mb-5 rounded-lg border border-[#8B92A633]">
              <label className="text-sm text-primary-dark font-medium">
                What kind of order is this?
              </label>

              <div className="flex flex-col gap-2">
                <CustomTextField
                  name="orderType"
                  isRadio
                  options={[
                    // { label: "Lead File", value: "leadFile" },
                    { label: "Live Feed", value: "liveFeed" },
                    // { label: "Priority Order", value: "priority" },
                    // { label: "One-Time Batch Post", value: "batchPost" },
                    // { label: "Bidding Order", value: "bidding" },
                  ]}
                  direction="column"
                  value={formik.values.orderType}
                  onChange={formik.handleChange}
                />

                {/* Conditionally render the sub-forms */}
                {formik.values.orderType === "liveFeed" && (
                  <LiveFeedForm formik={formik} integrationOptions={integrationOptions} />
                )}
                {formik.values.orderType === "priority" && (
                  <PriorityOrderForm formik={formik} integrationOptions={integrationOptions} />
                )}
                {formik.values.orderType === "batchPost" && (
                  <OneTimeBatchPostForm formik={formik} integrationOptions={integrationOptions} />
                )}
                {formik.values.orderType === "bidding" && (
                  <BiddingOrderForm formik={formik} integrationOptions={integrationOptions} />
                )}
              </div>

              {formik.touched.orderType && formik.errors.orderType && (
                <p className="mt-1 text-sm text-red-500">{formik.errors.orderType}</p>
              )}
            </div>

            {/* Test Purpose -> boolean radios stored as booleans */}
            {/* <div className="flex flex-col gap-2 py-5 border-t px-5 border-[#F1F1F4]">
              <label className="text-sm text-primary-dark font-medium">
                Are these leads just for testing purposes?
              </label>
              <div className="flex flex-col gap-2">
                <CustomTextField
                  name="testPurpose"
                  isRadio
                  options={[
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                  ]}
                  direction="row"
                  value={String(formik.values.testPurpose)}
                  onChange={(e) =>
                    formik.setFieldValue("testPurpose", e.target.value === "true")
                  }
                  error={formik.touched.testPurpose && formik.errors.testPurpose}
                />
              </div>
            </div> */}

            {/* Internal View -> boolean radios */}
            {/* <div className="flex flex-col gap-2 py-5 border-t px-5 border-[#F1F1F4]">
              <label className="text-sm text-primary-dark font-medium">
                Is this order for internal view only?
              </label>
              <div className="flex flex-col gap-2">
                <CustomTextField
                  name="internalView"
                  isRadio
                  options={[
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                  ]}
                  direction="row"
                  value={String(formik.values.internalView)}
                  onChange={(e) =>
                    formik.setFieldValue("internalView", e.target.value === "true")
                  }
                  error={formik.touched.internalView && formik.errors.internalView}
                />
              </div>
            </div> */}

            {/* Leads Quantity */}
            {/* <div className="flex flex-col gap-2 py-5 border-t px-5 border-[#F1F1F4]">
              <label className="text-sm text-primary-dark font-medium">How many leads are you ordering?</label>

              <div className="flex flex-wrap md:flex-nowrap gap-2">
                <div className="w-[70px]">
                  <CustomTextField
                    name="leadsQuantity"
                    type="number"
                    placeholder="00"
                    value={formik.values.leadsQuantity}
                    onChange={formik.handleChange}
                    error={formik.touched.leadsQuantity && formik.errors.leadsQuantity}
                  />
                </div>

                <span className="text-sm text-gray-500 pt-4">leads at $</span>

                <div className="w-[70px]">
                  <CustomTextField
                    name="pricePerRecord"
                    type="number"
                    placeholder="00"
                    value={formik.values.pricePerRecord}
                    onChange={formik.handleChange}
                    error={formik.touched.pricePerRecord && formik.errors.pricePerRecord}
                  />
                </div>

                <span className="text-sm text-gray-500 pt-0 sm:pt-4">per record (e.g. 0.2 for 20 cents type: 0.03)</span>
              </div>

              <p className="text-xs text-gray-400">leave quantity empty to get as many leads as there are available</p>
            </div> */}

            {/* Sort Order -> using CustomTextField radio */}
            {/* <div className="flex flex-col gap-2 py-5 border-t px-5 border-[#F1F1F4]">
              <label className="text-sm text-primary-dark font-medium">How do you want your leads sorted?</label>
              <div className="flex flex-col gap-2">
                <CustomTextField
                  name="sortOrder"
                  isRadio
                  options={[
                    { label: "Ascending", value: "ascending" },
                    { label: "Descending", value: "descending" },
                  ]}
                  direction="row"
                  value={formik.values.sortOrder}
                  onChange={formik.handleChange}
                  error={formik.touched.sortOrder && formik.errors.sortOrder}
                />
              </div>
            </div> */}

            {/* Pick lead fields... USING Checkbox component */}
            <div className="flex flex-col gap-2 py-5 border-t px-5 border-[#F1F1F4]">
              <label className="text-sm text-primary-dark font-medium mb-2">Pick lead fields...</label>

              <div className="w-full flex flex-row gap-4">
                {(() => {
                  const columns = 1;
                  const perCol = Math.ceil(leadFieldsList.length / columns);
                  const cols = Array.from({ length: columns }, (_, i) =>
                    leadFieldsList.slice(i * perCol, (i + 1) * perCol)
                  );

                  return cols.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2 flex-1 font-medium">
                      {col.map((field) => (
                        <Checkbox
                          key={field}
                          name="leadFields"
                          value={field}
                          label={field}
                          checked={formik.values.leadFields.includes(field)}
                          onChange={() => toggleLeadField(field)}
                          className=""
                          checkboxSize="w-5 h-5"
                          labelClassName="text-neutral text-sm"
                        />
                      ))}
                    </div>
                  ));
                })()}
              </div>

              <div className="mt-2">
                <a href="#" className="text-[13px] text-primary underline decoration-dashed underline-offset-4 cursor-pointer">Show Custom Fields</a>
              </div>

              {formik.touched.leadFields && formik.errors.leadFields && (
                <div className="text-xs text-red-500 mt-1">{formik.errors.leadFields}</div>
              )}
            </div>

            {/* strict & loose -> using CustomTextField radio */}
            <div className="flex flex-col gap-2 border-b px-5 border-light py-5">
              <label className="text-[13px] text-primary-dark font-medium">Field selection strictness</label>
              <div className="flex items-center gap-6">
                <CustomTextField
                  name="fieldStrictness"
                  isRadio
                  options={[
                    { label: "Strict", value: "strict" },
                    { label: "Loose", value: "loose" },
                  ]}
                  direction="row"
                  value={formik.values.fieldStrictness}
                  onChange={formik.handleChange}
                />
              </div>
              <span className="text-[13px] text-neutral mt-1">Picking "Strict" will only select leads with all the checked fields present.</span>
              {formik.touched.fieldStrictness && formik.errors.fieldStrictness && (
                <div className="text-xs text-red-500 mt-1">{formik.errors.fieldStrictness}</div>
              )}
            </div>

            {/* Pick lists dual-list selector (unchanged) */}
            <div className=" py-7">
              <div className="flex flex-col md:flex-row gap-6 px-5">
                <div className="flex-1">
                  <label className="text-sm text-primary-dark font-medium mb-2 block">
                    Pick lists <span className="text-red-500">*</span>
                  </label>
                  <div className={`rounded-custom-lg overflow-hidden bg-neutral-input border ${formik.touched.pickLists && formik.errors.pickLists ? 'border-red-500' : 'border-secondary-lighter'} h-40`}>
                    <div className="h-full overflow-y-auto custom-scrollbar">
                      {listsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-[13px] text-gray-500">Loading lists...</span>
                        </div>
                      ) : availablePickLists.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-[13px] text-gray-500">No lists available</span>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {availablePickLists.map((item) => (
                            <li key={item} className="px-4 text-[13px] py-2 cursor-pointer hover:bg-[#F5F7F9] hover:text-bold" onClick={() => handleSelectPickList(item)}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-[13px] text-center md:text-start">
                    <button type="button" className="text-primary underline decoration-dashed underline-offset-4 mr-2 cursor-pointer" onClick={handleSelectAllPickLists}>Select All</button> /
                    <button type="button" className="text-primary underline decoration-dashed underline-offset-4 ml-2 cursor-pointer" onClick={handleDeselectAllPickLists}>Deselect All</button>
                  </div>
                  {formik.touched.pickLists && formik.errors.pickLists && (
                    <div className="text-xs text-red-500 mt-1">{formik.errors.pickLists}</div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-sm text-neutral font-medium mb-2 block">You have selected</label>
                  <div className="rounded-custom-lg overflow-hidden bg-neutral-input border border-secondary-lighter h-40">
                    <div className="h-full overflow-y-auto custom-scrollbar">
                      <ul className="divide-y divide-gray-100">
                        {selectedPickLists.length === 0 ? (
                          <li className="px-4 py-2 text-gray-400">No lists selected</li>
                        ) : (
                          selectedPickLists.map((item) => (
                            <li key={item} className="px-4 text-[13px] py-2 cursor-pointer hover:bg-[#F5F7F9]" onClick={() => handleDeselectPickList(item)}>
                              {item}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead signup date range */}
            <div className="border-b px-5 border-light py-5">
              <label className="text-[13px] text-primary-dark font-medium mb-2 block">Lead signup date range</label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <DatePickerField label="Start Date" value={formik.values.signupStartDate} onChange={(val) => formik.setFieldValue("signupStartDate", val)} />
                </div>
                <div className="flex-1">
                  <DatePickerField label="End Date" value={formik.values.signupEndDate} onChange={(val) => formik.setFieldValue("signupEndDate", val)} />
                </div>
              </div>

              <div className="text-[13px] text-neutral mt-1">Leave blank to disregard signup date</div>
            </div>

            {/* Lead import date range */}
            <div className="border-b px-5 border-[#F1F1F4] py-5">
              <label className="text-[13px] text-primary-dark font-medium mb-2 block">Lead import date range (different from Lead Signup date)</label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <DatePickerField label="Start Date" value={formik.values.importStartDate} onChange={(val) => formik.setFieldValue("importStartDate", val)} />
                </div>
                <div className="flex-1">
                  <DatePickerField label="End Date" value={formik.values.importEndDate} onChange={(val) => formik.setFieldValue("importEndDate", val)} />
                </div>
              </div>

              <div className="text-[13px] text-neutral mt-1">Leave blank to disregard import date</div>
            </div>

            {/* bottom field  */}
            <div className="flex flex-col md:flex-row gap-4 py-2 px-5 items-center">
              <label>Days Back:</label>

              <div className="">
                <CustomTextField
                  id="dedupeDaysBack"
                  name="dedupeDaysBack"
                  isSelect={true}
                  options={daysBackOptions}
                  placeholder="Select Days Back"
                  value={formik.values.dedupeDaysBack}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.dedupeDaysBack ? formik.errors.dedupeDaysBack : ""}
                />
              </div>
            </div>
{/* 
            <div className="border-b px-5 border-light py-7">
              <label className="text-[13px] text-primary-dark font-medium block mb-4">How many days back do you want to dedupe?</label>

              <div className="bg-white rounded-custom-lg border border-light ">
                <div className="divide-y divide-gray-100">
                  {filterSections.map((section, idx) => (
                    <div key={section}>
                      <div className="px-0">
                        <button type="button" className={`w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer ${expanded === section ? "bg-neutral rounded-lg " : ""}`} onClick={() => setExpanded(expanded === section ? null : section)}>
                          <span className={`font-medium text-[13px] ${expanded === section ? "text-primary" : "text-neutral"}`}>{section}</span>
                          <span className="ml-2 text-gray-400">{expanded === section ? <ChevronDown /> : <ChevronRight />}</span>
                        </button>
                      </div>

        
                      {expanded === section && section === "Lead Validation" && (
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-2 text-sm text-neutral">
                            <img src={DangerIcon} alt="Danger Icon" />
                            <span>
                              This feature is disabled. <a href="#" className="underline font-medium">Click here</a> to enable.
                            </span>
                          </div>
                        </div>
                      )}

                      {expanded === section && section === "Countries" && (
                        <div className="px-3 py-2 overflow-hidden">
                          {countriesLoading ? (
                            <div className="bg-white rounded-[6px] border border-secondary-lighter px-3 py-2">
                              <div className="text-[13px] text-gray-500 text-center py-4">Loading countries...</div>
                            </div>
                          ) : countriesList.length === 0 ? (
                            <div className="bg-white rounded-[6px] border border-secondary-lighter px-3 py-2">
                              <div className="text-[13px] text-gray-500 text-center py-4">No countries available</div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-[6px] border border-secondary-lighter max-h-[300px] overflow-y-auto px-3 py-2">
                              {countriesList.map((country) => (
                                <div key={country} onClick={() => setSelectedCountry(country)} className={`px-5 py-3 text-[13px] cursor-pointer rounded-[6px] hover:bg-[#F5F7F9] text-neutral ${selectedCountry === country ? "bg-neutral font-medium" : ""}`}>
                                  {country}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {expanded === section && section === "US Area Codes" && (
                        <div className="px-3 py-2">
                          <p className="text-[13px] text-neutral mb-2">Please enter values in one of two formats: one per line or comma delimited</p>

                          <CustomTextField
                            isTextArea
                            name="areaCodes"
                            placeholder="Enter codes"
                            value={formik.values.areaCodes}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.areaCodes ? formik.errors.areaCodes : ""}
                          />

                          <div className="mt-3 flex items-center gap-2">
                            <Checkbox
                              name="excludeAreaCodes"
                              value="excludeAreaCodes"
                              label="Exclude Listed Area Codes"
                              checked={formik.values.excludeAreaCodes}
                              onChange={() => formik.setFieldValue("excludeAreaCodes", !formik.values.excludeAreaCodes)}
                              checkboxSize="w-5 h-5"
                              labelClassName="text-sm font-medium text-neutral"
                            />
                          </div>
                        </div>
                      )}

                      {expanded === section && section === "Exclude ISPS" && (
                        <div className="px-3 py-2">
                          <p className="text-[13px] text-neutral mb-2">Please enter values in one of two formats: one per line or comma delimited</p>

                          <CustomTextField isTextArea name="excludeIsps" placeholder="Enter codes" value={formik.values.excludeIsps} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.excludeIsps ? formik.errors.excludeIsps : ""} />
                        </div>
                      )}

                      {expanded === section && section === "Include ISPS" && (
                        <div className="px-3 py-2">
                          <p className="text-[13px] text-neutral mb-2">Please enter values in one of two formats: one per line or comma delimited</p>

                          <CustomTextField isTextArea name="includeIsps" placeholder="Enter codes" value={formik.values.includeIsps} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.includeIsps ? formik.errors.includeIsps : ""} />
                        </div>
                      )}

                      {expanded === section && section === "Gender" && (
                        <div className="px-3 py-2">
                          <p className="text-[13px] text-neutral mb-2">Select one or both genders to include</p>

                          <div className="flex flex-col gap-2">
                            <Checkbox
                              name="genderMale"
                              value="male"
                              label="Male"
                              checked={formik.values.genderMale}
                              onChange={() => formik.setFieldValue("genderMale", !formik.values.genderMale)}
                              checkboxSize="w-5 h-5"
                              labelClassName="text-sm font-medium text-neutral"
                            />

                            <Checkbox
                              name="genderFemale"
                              value="female"
                              label="Female"
                              checked={formik.values.genderFemale}
                              onChange={() => formik.setFieldValue("genderFemale", !formik.values.genderFemale)}
                              checkboxSize="w-5 h-5"
                              labelClassName="text-sm font-medium text-neutral"
                            />
                          </div>
                        </div>
                      )}

                      {expanded === section && section === "States" && (
                        <div className="px-3 py-2">
                          {statesLoading ? (
                            <div className="bg-white rounded-[6px] border border-secondary-lighter px-3 py-2">
                              <div className="text-[13px] text-gray-500 text-center py-4">Loading states...</div>
                            </div>
                          ) : statesList.length === 0 ? (
                            <div className="bg-white rounded-[6px] border border-secondary-lighter px-3 py-2">
                              <div className="text-[13px] text-gray-500 text-center py-4">No states available</div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-[6px] border border-secondary-lighter max-h-[300px] overflow-y-auto px-3 py-2">
                              {statesList.map((state) => (
                                <div key={state} onClick={() => toggleStateSelection(state)} className={`px-5 py-3 text-[13px] cursor-pointer rounded-[6px] hover:bg-[#F5F7F9] text-neutral ${formik.values.selectedStates.includes(state) ? "bg-neutral font-medium" : ""}`}>
                                  {state}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            <Checkbox
                              name="excludeStates"
                              value="excludeStates"
                              label="Exclude Selected States"
                              checked={formik.values.excludeStates}
                              onChange={() => formik.setFieldValue("excludeStates", !formik.values.excludeStates)}
                              checkboxSize="w-5 h-5"
                              labelClassName="text-sm font-medium text-neutral"
                            />
                          </div>
                        </div>
                      )}

                      {expanded === section && section === "Filter by Custom Field" && (
                        <div className="px-3 py-2">
                          <p className="text-[13px] text-neutral mb-3">Use the "Add New Filter" link below to add as many custom field filters as you would like.</p>

                          {(formik.values.customFilters || []).map((filter, index) => (
                            <div key={index} className="mb-4 p-4 border border-light rounded-[8px] bg-[#FFFFFF]">
                              <div className="flex gap-4 items-center justify-between mb-4 relative">
                                <div className="w-full relative">
                                  <div onClick={() => formik.setFieldValue(`customFilters[${index}].showDropdown`, !filter.showDropdown)} className="bg-white flex justify-between text-[13px] text-neutral rounded-[6px] border border-secondary-lighter px-5 py-3 cursor-pointer hover:bg-[#F5F7F9] transition-colors">
                                    {filter.customField || "Pick Custom Field"}
                                    {filter.showDropdown ? <ChevronDown /> : <ChevronRight />}
                                  </div>

                                  {filter.showDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white rounded-[6px] border border-secondary-lighter max-h-[300px] overflow-y-auto px-3 py-2">
                                      {customFieldOptions.map((option) => (
                                        <div key={option} onClick={() => { formik.setFieldValue(`customFilters[${index}].customField`, option); formik.setFieldValue(`customFilters[${index}].showDropdown`, false); }} className={`px-5 py-3 text-[13px] cursor-pointer rounded-[6px] text-neutral hover:bg-[#F5F7F9] ${filter.customField === option ? "bg-neutral font-medium text-white" : ""}`}>
                                          {option}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <button type="button" onClick={() => { formik.setFieldValue(`customFilters[${index}].customField`, ""); }} className="ml-3 text-gray-500 hover:text-red-600 flex items-center justify-center cursor-pointer" aria-label="Clear selected field">
                                  <img src={trush} alt="Clear" className="w-6 h-6" />
                                </button>
                              </div>

                              <p className="text-[12px] text-[#495057] mb-2">Please enter values in one of two formats: one per line or comma delimited</p>

                              <CustomTextField isTextArea name={`customFilters[${index}].customValue`} placeholder="Enter value" value={filter.customValue} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.customFilters && formik.touched.customFilters[index]?.customValue && formik.errors.customFilters && formik.errors.customFilters[index]?.customValue} />

                              <div className="mt-3">
                                <CustomTextField
                                  name={`customFilters[${index}].filterType`}
                                  value={filter.filterType}
                                  isRadio
                                  options={[
                                    { label: "Include", value: "Include" },
                                    { label: "Exclude", value: "Exclude" }
                                  ]}
                                  onChange={formik.handleChange}
                                  className="text-[13px] text-neutral"
                                />
                              </div>
                            </div>
                          ))}

                          <button type="button" onClick={handleAddCustomFilter} className="text-[13px] font-medium text-primary cursor-pointer mt-2 pb-1 border-b border-dashed border-primary">Add New Filter</button>
                        </div>
                      )}

                      {expanded === section && section === "Filter by Offer URL" && (
                        <div className="px-3 py-2">
                          <p className="text-[13px] text-neutral mb-3">Enter any part of the offer URL to match below</p>
                          <div className="mb-4">
                            <CustomTextField name="filterOfferUrl" type="text" placeholder="Enter URL" value={formik.values.filterOfferUrl} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.filterOfferUrl ? formik.errors.filterOfferUrl : ""} />
                          </div>
                        </div>
                      )}

                      {expanded === section && section === "Block Domains" && (
                        <div className="px-3 py-2">
                          <p className="text-[13px] text-neutral">You have not defined any domain groups to block. You can do it <a href="#" className="underline">here</a></p>
                        </div>
                      )}

                      {expanded === section && section === "Lead Locking" && (
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              name="disregardLocks"
                              value="disregardLocks"
                              label="Disregard Locks"
                              checked={formik.values.disregardLocks}
                              onChange={() => formik.setFieldValue("disregardLocks", !formik.values.disregardLocks)}
                              checkboxSize="w-5 h-5"
                              labelClassName="text-sm font-medium text-neutral cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div> */}

            {/* Preview only OR Place order */}
            {/* <div className=" px-5  py-2">
              <label className="text-sm text-neutral font-medium mb-2 block">Preview only OR Place order</label>
              <div className="flex items-center gap-2">
                <Checkbox
                  name="previewOnly"
                  value="previewOnly"
                  label="See preview only"
                  checked={formik.values.previewOnly}
                  onChange={() => formik.setFieldValue("previewOnly", !formik.values.previewOnly)}
                  checkboxSize="w-5 h-5"
                  labelClassName="text-sm"
                />
              </div>
            </div> */}

            {/* Submit Button */}
            <div className="flex justify-end mr-6 mt-0">
              <button 
                type="submit" 
                disabled={creating}
                className={`px-3 py-3 bg-gradient-primary text-white rounded-xl transition text-sm sm:text-base w-full md:w-auto font-semibold shadow-md ${
                  creating 
                    ? "opacity-50 cursor-not-allowed" 
                    : "cursor-pointer hover:opacity-90"
                }`}
              >
                {creating ? "Creating Order..." : "Save Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SendLeadsForm;
