"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  X,
  Bug,
  BookOpen,
  CheckSquare,
  Mountain,
} from "lucide-react";
import { User } from "@/types";
import clsx from "clsx";

export interface FilterState {
  search: string;
  priority: string;
  type: string;
  assignee: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  teamMembers: User[];
}

export default function FilterBar({
  filters,
  onFilterChange,
  teamMembers,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({ search: "", priority: "", type: "", assignee: "" });
  };

  const activeFilterCount = [
    filters.priority,
    filters.type,
    filters.assignee,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search tasks..."
            className="input pl-10 py-2 text-sm"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            "flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
            showFilters || activeFilterCount > 0
              ? "bg-primary-50 border-primary-300 text-primary-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          )}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Priority Filter */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter("priority", e.target.value)}
              className="input py-1.5 text-sm min-w-[120px]"
            >
              <option value="">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => updateFilter("type", e.target.value)}
              className="input py-1.5 text-sm min-w-[120px]"
            >
              <option value="">All</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="story">Story</option>
              <option value="epic">Epic</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Assignee
            </label>
            <select
              value={filters.assignee}
              onChange={(e) => updateFilter("assignee", e.target.value)}
              className="input py-1.5 text-sm min-w-[140px]"
            >
              <option value="">All</option>
              <option value="unassigned">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.priority && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              <span>Priority: {filters.priority}</span>
              <button
                onClick={() => updateFilter("priority", "")}
                className="hover:text-orange-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              <span>Type: {filters.type}</span>
              <button
                onClick={() => updateFilter("type", "")}
                className="hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.assignee && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              <span>
                Assignee:{" "}
                {filters.assignee === "unassigned"
                  ? "Unassigned"
                  : teamMembers.find((m) => m._id === filters.assignee)
                      ?.name || "Unknown"}
              </span>
              <button
                onClick={() => updateFilter("assignee", "")}
                className="hover:text-green-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
