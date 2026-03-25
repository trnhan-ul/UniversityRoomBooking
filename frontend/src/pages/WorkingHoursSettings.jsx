import React, { useState, useEffect } from 'react';
import { getWorkingHours, updateWorkingHours } from '../services/settingService';
import { Button } from '../components/common';
import { generateTimeOptions } from '../utils/timeFormat';
import { runMutationWithRefresh } from "../utils/mutationRefresh";

const WorkingHoursSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [workingHours, setWorkingHours] = useState({
    start: "07:00",
    end: "21:00",
  });

  const [originalHours, setOriginalHours] = useState({
    start: "07:00",
    end: "21:00",
  });

  // Generate time options for dropdowns
  const timeOptions = generateTimeOptions();

  // Fetch current working hours
  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getWorkingHours();

      if (response.success) {
        setWorkingHours(response.data);
        setOriginalHours(response.data);
      }
    } catch (err) {
      console.error("Fetch working hours error:", err);
      setError(err.message || "Failed to fetch working hours");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleApplyToAll = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Validation
      if (!workingHours.start || !workingHours.end) {
        setError("Please enter both start and end time");
        return;
      }

      if (workingHours.start >= workingHours.end) {
        setError("Start time must be before end time");
        return;
      }

      const response = await runMutationWithRefresh({
        mutate: () => updateWorkingHours(workingHours),
        refresh: fetchWorkingHours,
      });

      if (response.success) {
        setSuccess("Working hours updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Update working hours error:", err);
      setError(err.message || "Failed to update working hours");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setWorkingHours(originalHours);
    setError("");
    setSuccess("");
  };

  const hasChanges = () => {
    return (
      workingHours.start !== originalHours.start ||
      workingHours.end !== originalHours.end
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Working Hours Configuration
        </h1>
        <p className="text-gray-600">
          Define the operational hours for university facilities and classroom
          access. These hours will restrict when bookings can be made.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Global Settings Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Global Settings
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apply to All Days
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Quickly set the same hours for Monday through Sunday.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Start Time */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase">
                  Start Time
                </label>
                <input
                  type="time"
                  value={workingHours.start}
                  onChange={(e) => handleChange("start", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase">
                  End Time
                </label>
                <input
                  type="time"
                  value={workingHours.end}
                  onChange={(e) => handleChange("end", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleApplyToAll}
                disabled={saving || !hasChanges()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Apply to All"
                )}
              </Button>
            </div>
          </div>

          {/* Current Hours Display */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Working Hours:</span>
              <span className="font-semibold text-gray-900">
                {originalHours.start} - {originalHours.end}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges() && (
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            onClick={handleDiscardChanges}
            variant="outline"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Discard Changes
          </Button>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Working hours apply to all classrooms in the system</li>
              <li>
                Bookings outside these hours will be automatically blocked
              </li>
              <li>Changes take effect immediately after saving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursSettings;
