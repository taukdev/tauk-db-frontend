import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Plus, X } from "lucide-react";
import { useDispatch } from "react-redux";
import editIcon from "../../assets/icons/editPen.svg";
import CustomButton from "../CustomButton";
import CustomTextField from "../CustomTextField";
import {
  createTeam,
  updateTeam,
  deleteTeam
} from "../../features/activeCampaigns/activeCampaignsSlice";

const TeamDropdown = ({
  isOpen,
  onClose,
  onSelect,
  selectedTeam,
  triggerRef,
  formik,
  teams, // Now expected to be array of objects: [{id, team_name}, ...]
}) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null); // Now stores the team object
  const [formData, setFormData] = useState({ name: "" });
  const dropdownRef = useRef(null);

  const filteredTeams = useMemo(() => {
    if (!search) return teams;
    const searchLower = search.toLowerCase();
    return teams.filter((team) => {
      const name = typeof team === 'string' ? team : (team.team_name || team.name || "");
      return name.toLowerCase().includes(searchLower);
    });
  }, [teams, search]);

  // Handle clicks outside etc. (Keep existing logic)
  useEffect(() => {
    // ... existing positioning logic handled by previous implementation ...
  }, [isOpen, triggerRef]);

  // Position dropdown: just under input, width ≈ trigger width, height fits screen
  useEffect(() => {
    if (isOpen && triggerRef?.current && dropdownRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spacing = 8; // gap from input + screen edges

      // --- Width & left (same as input, but not outside screen) ---
      const maxWidth = viewportWidth - spacing * 2;
      const dropdownWidth = Math.min(triggerRect.width, maxWidth);

      dropdown.style.width = `${dropdownWidth}px`;

      let left = triggerRect.left;
      if (left + dropdownWidth > viewportWidth - spacing) {
        left = viewportWidth - dropdownWidth - spacing;
      }
      if (left < spacing) {
        left = spacing;
      }
      dropdown.style.left = `${left}px`;

      // --- Top (always under input) ---
      const top = triggerRect.bottom + spacing;
      dropdown.style.top = `${top}px`;

      // --- Max height based on space below input ---
      const availableBelow = viewportHeight - top - spacing; // space till bottom
      const idealMax = viewportHeight * 0.6; // 60vh
      let maxHeight = Math.min(idealMax, availableBelow);

      // minimum sensible height
      if (maxHeight < 180) {
        maxHeight = Math.max(availableBelow, 180);
      }

      dropdown.style.maxHeight = `${maxHeight}px`;
    }
  }, [isOpen, triggerRef]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
        setShowAddForm(false);
        setEditingTeam(null);
        setFormData({ name: "" });
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  const handleAddTeam = () => {
    if (formData.name.trim()) {
      dispatch(createTeam(formData.name.trim()));
      setFormData({ name: "" });
      setShowAddForm(false);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setFormData({ name: typeof team === 'string' ? team : (team.team_name || team.name) });
    setShowAddForm(false);
  };

  const handleUpdateTeam = (team) => {
    if (formData.name.trim()) {
      const id = typeof team === 'string' ? team : team.id;
      dispatch(updateTeam({ id, teamName: formData.name.trim() }));

      const oldName = typeof team === 'string' ? team : (team.team_name || team.name);
      if (formik.values.assignedTeam === oldName) {
        formik.setFieldValue("assignedTeam", formData.name.trim());
      }

      setFormData({ name: "" });
      setEditingTeam(null);
    }
  };

  const handleDeleteTeam = (team) => {
    const id = typeof team === 'string' ? team : team.id;
    const name = typeof team === 'string' ? team : (team.team_name || team.name);

    dispatch(deleteTeam(id));
    if (formik.values.assignedTeam === name) {
      formik.setFieldValue("assignedTeam", "");
    }
  };

  const handleResetForm = () => {
    setFormData({ name: "" });
    setEditingTeam(null);
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed z-50 bg-white rounded-xl shadow-lg border border-[#E1E3EA] flex flex-col overflow-hidden"
      >
        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2 border-b border-[#F1F1F4]">
          <div className="relative flex-1">
            <div className="relative">
              <CustomTextField
                type="text"
                name="searchTeam"
                placeholder="Search team"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="mb-0"
                inputClassName="pl-9"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                style={{ marginTop: "2px" }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForm(true);
              setEditingTeam(null);
              setFormData({ name: "" });
            }}
            className="flex items-center gap-2 px-4 py-2 text-primary rounded-lg cursor-pointer transition sm:w-auto w-full justify-center"
          >
            <Plus className="w-4 h-4" color="#1b84ff" />
            <span className="text-primary font-medium">Add New Team</span>
          </button>
        </div>

        {/* Add Form at Top */}
        {showAddForm && !editingTeam && (
          <div className="p-4 border-b border-[#F1F1F4]">
            <h3 className="font-semibold text-primary-dark mb-3">
              Add New Team
            </h3>
            <div className="space-y-3">
              <CustomTextField
                label="Team Name"
                type="text"
                name="teamName"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Enter team name"
                onClick={(e) => e.stopPropagation()}
                className="mb-0"
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetForm();
                  }}
                  className="px-4 py-1.5 text-sm text-[#78829D] bg-gray-200 rounded-lg hover:text-gray-800"
                >
                  cancel
                </button>
                <div>
                  <CustomButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTeam();
                    }}
                    className="!px-4 !py-1.5 !text-sm"
                    position=""
                  >
                    Add Team
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar rounded-b-xl">
          {filteredTeams.length > 0 ? (
            <div className="divide-y divide-[#F1F1F4]">
              {filteredTeams.map((team, index) => {
                const teamId = typeof team === 'string' ? team : team.id;
                const teamName = typeof team === 'string' ? team : (team.team_name || team.name || "");

                return (
                  <div key={teamId || index}>
                    {editingTeam?.id !== teamId && editingTeam !== team ? (
                      <div
                        className={`p-4 flex items-center justify-between hover:bg-gray-50 transition ${formik.values.assignedTeam === teamName
                          ? "bg-gray-100"
                          : ""
                          }`}
                      >
                        <span
                          className="text-primary-dark font-medium flex-1 cursor-pointer"
                          onClick={() => {
                            onSelect(team);
                            onClose();
                          }}
                        >
                          {teamName}
                        </span>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="p-1.5 rounded-full transition cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTeam(team);
                            }}
                          >
                            <img src={editIcon} alt="Edit" className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-full transition cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTeam(team);
                            }}
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <CustomTextField
                            type="text"
                            name="editTeamName"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ name: e.target.value })
                            }
                            placeholder="Enter team name"
                            onClick={(e) => e.stopPropagation()}
                            className="mb-0 flex-1"
                            size="sm"
                            inputClassName="text-sm"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData({ name: teamName });
                              setEditingTeam(null);
                            }}
                            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTeam(team);
                            }}
                            className="text-xs sm:text-sm text-[#1b84ff] hover:underline whitespace-nowrap font-medium"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No teams found</div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeamDropdown;
