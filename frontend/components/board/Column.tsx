"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column, Task } from "@/types";
import TaskCard from "./TaskCard";
import { Plus, MoreVertical } from "lucide-react";

interface ColumnProps {
  column: Column;
  tasks: Task[];
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  currentUserId?: string;
}

export default function ColumnComponent({
  column,
  tasks,
  onCreateTask,
  onEditTask,
  currentUserId,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-100 rounded-lg p-4">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color || "#3b82f6" }}
            />
            <h3 className="font-semibold text-gray-900">{column.name}</h3>
            <span className="text-sm text-gray-500">({tasks.length})</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Tasks Container */}
        <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
          <SortableContext
            items={tasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onEditTask(task)}
                currentUserId={currentUserId}
              />
            ))}
          </SortableContext>

          {/* Add Task Button */}
          <button
            onClick={onCreateTask}
            className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
