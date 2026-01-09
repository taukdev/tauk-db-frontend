
import CustomTextField from "../../../CustomTextField";
import DatePickerField from "../../../DatePickerField";

const OneTimeBatchPostForm = ({ formik, integrationOptions = [] }) => {
  // Use provided integration options or fallback to default
  const defaultOptions = [
    { label: "Backoffice", value: "backoffice" },
    { label: "Integration 1", value: "integration1" },
    { label: "Integration 2", value: "integration2" },
  ];
  
  const options = integrationOptions.length > 0 ? integrationOptions : defaultOptions;

  // Post Status options
  const postStatusOptions = [
    { label: "Paused", value: "paused" },
    { label: "Active", value: "active" },
  ];

  return (
    <div className="mt-4">
      {/* One-Time batch order details section */}
      <div className="bg-white rounded-lg border border-[#F1F1F4] bg-neutral-input p-5 space-y-4 mb-6">
        <h4 className="text-sm text-primary-dark font-semibold mb-4">
          One-Time batch order details
        </h4>
        <div className="space-y-4 ">
          {/* Pick Integration */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-sm text-primary-dark font-medium md:w-1/3">
              Pick Integration
            </label>
            <div className="md:flex-1">
              <CustomTextField
                name="batchPostIntegration"
                isSelect
                options={options}
                value={
                  formik.values.batchPostIntegration ||
                  options[0].value
                }
                onChange={(e) =>
                  formik.setFieldValue("batchPostIntegration", e.target.value)
                }
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
                name="batchPostStatus"
                isSelect
                options={postStatusOptions}
                value={
                  formik.values.batchPostStatus || postStatusOptions[0].value
                }
                onChange={(e) =>
                  formik.setFieldValue("batchPostStatus", e.target.value)
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
                value={formik.values.batchPostStartTime || ""}
                onChange={(val) =>
                  formik.setFieldValue("batchPostStartTime", val)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneTimeBatchPostForm;
