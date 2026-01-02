import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPlatformNotes,
  selectPlatformNotes,
} from "../../../features/platform/platformNotesSlice";

export default function PlatformNotes({ platformId }) {
  const dispatch = useDispatch();
  const notes = useSelector(selectPlatformNotes);

  useEffect(() => {
    if (platformId) {
      dispatch(fetchPlatformNotes(platformId));
    }
  }, [dispatch, platformId]);

  return (
    <div className="bg-white rounded-custom-lg border border-[#E1E3EA] shadow-sm p-0">
      {/* Header with full-width border */}
      <div className="px-3 xs:px-4 sm:px-5 md:px-6 py-3 border-b border-[#E1E3EA]">
        <h2 className="font-semibold text-neutral text-md xs:text-md sm:text-lg">
          Notes
        </h2>
      </div>

      {/* Scrollable Notes Section */}
      <div className="max-h-60 overflow-y-auto px-3 xs:px-4 sm:px-5 md:px-6 py-3 space-y-3">
        {notes && notes.length > 0 ? (
          notes.map((note, index) => (
            <div
              key={note.id}
              className=""
            >
              {/* User & Date */}
              <div className="flex flex-wrap items-center gap-1 xs:gap-2">
                <span className="font-semibold text-sm text-primary-dark">
                  {index + 1}. {note.user_name || note.Admin?.name || note.user || "System"}
                </span>
                <span className="text-[#99A1B7] text-[14px] md:text-[12px]">
                  {note.created_at ? new Date(note.created_at).toLocaleString() : note.date}
                </span>
              </div>

              {/* Message */}
              <p className="text-[#5E6278] mt-1 leading-relaxed text-xs">
                {note.note_text || note.message}
              </p>
            </div>
          ))
        ) : (
          <p className="text-[#99A1B7] text-[10px] xs:text-xs sm:text-sm italic">
            No notes available.
          </p>
        )}
      </div>
    </div>
  );
}
