import React from "react";
import { useFormik } from "formik";
import CustomTextField from "../../../CustomTextField";
import DatePickerField from "../../../DatePickerField";
import { ChevronDown } from "lucide-react";

const LiveFeedForm = ({ formik, integrationOptions = [] }) => {
  // Use provided integration options or fallback to default
  const defaultOptions = [
    { label: "Backoffice", value: "backoffice" },
    { label: "Integration 1", value: "integration1" },
    { label: "Integration 2", value: "integration2" },
  ];
  
  const options = integrationOptions.length > 0 ? integrationOptions : defaultOptions;

  // When Leads Turn options (in hours)
  const leadTurnOptions = Array.from({ length: 25 }, (_, i) => ({
    label: `${i} Hours`,
    value: i.toString(),
  }));

  // Post Status options
  const postStatusOptions = [
    { label: "Paused", value: "paused" },
    { label: "Active", value: "active" },
  ];

  // Posting frequency options
  const postingFrequencyOptions = [
    { label: "Every 5 minutes", value: "every5min" },
    { label: "Once daily", value: "onceDaily" },
  ];

  return (
    <div className="mt-4">
      {/* Live post details section */}
      <div className="bg-white rounded-lg border border-[#F1F1F4] bg-neutral-input p-5 space-y-4 mb-6">
        <h4 className="text-sm text-primary-dark font-semibold mb-4">
          Live post details
        </h4>
        <div className="pb-4.5 border-b border-[#F1F1F4] space-y-4 ">
          {/* Pick Integration */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-sm text-primary-dark font-medium md:w-1/3">
              Pick Integration
            </label>
            <div className="md:flex-1">
              <CustomTextField
                name="liveFeedIntegration"
                isSelect
                options={options}
                value={
                  formik.values.liveFeedIntegration ||
                  options[0].value
                }
                onChange={(e) =>
                  formik.setFieldValue("liveFeedIntegration", e.target.value)
                }
                className="mb-0"
              />
            </div>
          </div>

          {/* Pick Cut Off Date */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-sm text-primary-dark font-medium md:w-1/3">
              Pick Cut Off Date
            </label>
            <div className="md:flex-1">
              <DatePickerField
                label="Select Date"
                value={formik.values.liveFeedCutOffDate || ""}
                onChange={(val) =>
                  formik.setFieldValue("liveFeedCutOffDate", val)
                }
              />
            </div>
          </div>

          {/* When Leads Turn */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-sm text-primary-dark font-medium md:w-1/3">
              When Leads Turn
            </label>
            <div className="md:flex-1">
              <CustomTextField
                name="liveFeedLeadTurn"
                isSelect
                options={leadTurnOptions}
                value={
                  formik.values.liveFeedLeadTurn || leadTurnOptions[0].value
                }
                onChange={(e) =>
                  formik.setFieldValue("liveFeedLeadTurn", e.target.value)
                }
                className="mb-0"
              />
            </div>
          </div>

          {/* Daily Cap */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-sm text-primary-dark font-medium md:w-1/3">
              Daily Cap
            </label>
            <div className="md:flex-1">
              <CustomTextField
                name="liveFeedDailyCap"
                value={formik.values.liveFeedDailyCap || ""}
                onChange={formik.handleChange}
                placeholder="Enter daily cap"
                className="mb-0"
              />
            </div>
          </div>

          {/* Post Status */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-sm text-primary-dark font-medium md:w-1/3">
              Post Status
            </label>
            <div className="md:flex-1">
              <CustomTextField
                name="liveFeedPostStatus"
                isSelect
                options={postStatusOptions}
                value={
                  formik.values.liveFeedPostStatus || postStatusOptions[0].value
                }
                onChange={(e) =>
                  formik.setFieldValue("liveFeedPostStatus", e.target.value)
                }
                className="mb-0"
              />
            </div>
          </div>

          {/* Post Start Time */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-sm text-primary-dark font-medium md:w-1/3">
              Post Start Time
            </label>
            <div className="md:flex-1">
              <DatePickerField
                label="Select Date"
                value={formik.values.liveFeedPostStartTime || ""}
                onChange={(val) =>
                  formik.setFieldValue("liveFeedPostStartTime", val)
                }
              />
            </div>
          </div>
        </div>

        {/* How frequently do you want to post out? */}
        <div className="mb-6 border-b border-[#F1F1F4]">
          <h4 className="text-sm text-primary-dark font-medium mb-4">
            How frequently do you want to post out?
          </h4>
          <CustomTextField
            name="liveFeedPostingFrequency"
            isRadio
            direction="row"
            options={postingFrequencyOptions}
            value={formik.values.liveFeedPostingFrequency || "every5min"}
            onChange={formik.handleChange}
            error={
              formik.touched.liveFeedPostingFrequency &&
              formik.errors.liveFeedPostingFrequency
            }
          />
        </div>

        {/* Delay between posts */}
        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
          <label className="text-sm text-primary-dark font-medium md:w-1/3">
            Delay between posts
          </label>
          <div className="md:flex-1 w-full">
            <div className="mb-2">
              <span className="text-sm text-primary-dark">
                {formik.values.liveFeedDelayBetweenPosts || 0} Seconds
              </span>
            </div>
            <div className="w-full">
              <input
                type="range"
                min="0"
                max="3600"
                step="1"
                name="liveFeedDelayBetweenPosts"
                value={formik.values.liveFeedDelayBetweenPosts || 0}
                onChange={(e) =>
                  formik.setFieldValue(
                    "liveFeedDelayBetweenPosts",
                    parseInt(e.target.value, 10)
                  )
                }
                className="w-full custom-range"
                style={{
                  background: `linear-gradient(
        to right,
        #1F6FEB 0%,
        #1F6FEB ${
          ((formik.values.liveFeedDelayBetweenPosts || 0) / 3600) * 100
        }%,
        #e5e7eb ${
          ((formik.values.liveFeedDelayBetweenPosts || 0) / 3600) * 100
        }%,
        #e5e7eb 100%
      )`,
                }}
              />
              <style>{`
    input.custom-range {
      -webkit-appearance: none;
      appearance: none;
      height: 8px;
      border-radius: 999px;
      padding: 0;
      outline: none;
    }

    /* WebKit track (background is controlled inline) */
    input.custom-range::-webkit-slider-runnable-track {
      height: 8px;
      border-radius: 999px;
    }

    /* WebKit thumb */
    input.custom-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #1F6FEB;
      border: 3px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      margin-top: -5px; /* center the thumb on the track */
      cursor: pointer;
    }

    /* Firefox track and thumb */
    input.custom-range::-moz-range-track {
      height: 8px;
      border-radius: 999px;
    }
    input.custom-range::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #1F6FEB;
      border: 3px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      cursor: pointer;
    }

    /* IE/Edge fallback */
    input.custom-range::-ms-thumb {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #1F6FEB;
      border: 3px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      cursor: pointer;
    }
  `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeedForm;
