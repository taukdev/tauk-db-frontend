import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import CustomTextField from "../CustomTextField";
import editIcon from "../../assets/icons/Edit-icon.svg";
import crossIcon from "../../assets/icons/cross-icon.svg";
import CustomButton from "../CustomButton";

const ViewCampaignPopup = ({
  isOpen,
  onClose,
  isEditMode: isEditModeProp = false,
  campaignData = {},
  vendorOptions = [],
  teamOptions = [],
  listIdOptions = [],
  onSave,
}) => {
  if (!isOpen) return null;

  const {
    listId: initialListId = "",
    campaignNames: initialCampaignNames = [],
    vendorId: initialVendorId = "",
    vendorName: initialVendorName = "",
    teamId: initialTeamId = "",
    assignedTeam: initialAssignedTeam = "",
    description: initialDescription = "",
  } = campaignData;

  const [listIds, setListIds] = useState(initialCampaignNames ? [initialListId, ...initialCampaignNames] : [initialListId]);
  const [vendorId, setVendorId] = useState(initialVendorId);
  const [assignedTeamId, setAssignedTeamId] = useState(initialTeamId);
  const [description, setDescription] = useState(initialDescription || "");
  const [isEditMode, setIsEditMode] = useState(isEditModeProp);

  useEffect(() => {
    setListIds(initialCampaignNames ? [initialListId, ...initialCampaignNames] : [initialListId]);
    setVendorId(initialVendorId);
    setAssignedTeamId(initialTeamId);
    setDescription(initialDescription || "");
    setIsEditMode(isEditModeProp);
  }, [campaignData, isEditModeProp]);

  const handleVendorChange = (e) => {
    setVendorId(e.target.value);
  };

  const handleTeamChange = (e) => {
    setAssignedTeamId(e.target.value);
  };

  const handleSave = () => {
    const payload = {
      list_ids: listIds,
      vendor_id: parseInt(vendorId),
      team_id: parseInt(assignedTeamId),
      description,
    };
    if (onSave) onSave({ id: campaignData.id, payload });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl relative mx-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex flex-col">
            {campaignData.listId && (
              <p className="text-lg font-bold text-primary-dark mt-1">
                {campaignData.listId}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isEditMode && (
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsEditMode(true)}
              >
                <img src={editIcon} alt="Edit" className="w-4 h-4" />
                <span className="text-secondary text-sm font-medium">
                  Edit Report
                </span>
              </div>
            )}
            <button className="cursor-pointer" onClick={onClose}>
              <img src={crossIcon} alt="Close" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* List ID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-dark mb-1">
              List ID
            </label>
            {isEditMode ? (
              <CustomTextField
                isSelect
                isMultiSelect
                name="listIds"
                options={listIdOptions}
                value={listIds}
                onChange={(e) => setListIds(e.target.value)}
                placeholder="Select List IDs"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {listIds.length > 0 ? (
                  listIds.map((id, idx) => (
                    <span key={idx} className="px-2 py-1 bg-neutral-input border border-light rounded text-sm text-secondary font-medium">
                      {id}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-secondary-light">No List IDs</span>
                )}
              </div>
            )}
          </div>

          {/* Vendor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-dark mb-1">
              Vendor
            </label>
            {isEditMode ? (
              <CustomTextField
                isSelect
                name="vendor"
                options={vendorOptions}
                value={vendorId}
                onChange={handleVendorChange}
                placeholder="Select Vendor"
              />
            ) : (
              <p className="text-sm text-secondary font-medium">
                {initialVendorName || "Not assigned"}
              </p>
            )}
          </div>

          {/* Assigned Team */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-dark mb-1">
              Assigned Team
            </label>
            {isEditMode ? (
              <CustomTextField
                isSelect
                name="assignedTeam"
                options={teamOptions}
                value={assignedTeamId}
                onChange={handleTeamChange}
                placeholder="Select Team"
              />
            ) : (
              <p className="text-sm text-secondary font-medium">
                {initialAssignedTeam || "Not assigned"}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-dark mb-1">
              Description
            </label>
            {isEditMode ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-light rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                placeholder="Enter description"
              />
            ) : (
              <p className="text-sm text-secondary leading-relaxed break-words">
                {description || "No description provided."}
              </p>
            )}
          </div>

          {/* Save Button */}
          {isEditMode && (
            <div className="mt-6 flex justify-end">
              <CustomButton onClick={handleSave} className="px-8 py-2">
                Save
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCampaignPopup;
