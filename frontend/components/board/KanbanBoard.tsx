"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column, Task } from "@/types";
import ColumnComponent from "./Column";
import TaskCard from "./TaskCard";
import api from "@/lib/api";

interface KanbanBoardProps {
  columns: Column[];
  tasks: Task[];
  projectId: string;
  onCreateTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onTasksUpdate: (tasks: Task[]) => void;
  currentUserId?: string;
}

export default function KanbanBoard({
  columns,
  tasks,
  projectId,
  onCreateTask,
  onEditTask,
  onTasksUpdate,
  currentUserId,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const getTasksByColumn = (columnId: string) => {
    return tasks
      .filter((task) => task.column === columnId)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;

    // Check if dropped on a column
    const overColumn = columns.find((c) => c._id === overId);
    let targetColumnId = overColumn ? overColumn._id : activeTask.column;

    // If dropped on a task, find that task's column
    if (!overColumn) {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        targetColumnId = overTask.column;
      }
    }

    // Get tasks in target column
    const columnTasks = tasks.filter((t) => t.column === targetColumnId);

    // Find the index where we should insert
    let newOrder = 0;
    if (overId !== targetColumnId) {
      // Dropped on a task
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        newOrder = overTask.order;
      }
    } else {
      // Dropped on column, add to end
      newOrder =
        columnTasks.length > 0
          ? Math.max(...columnTasks.map((t) => t.order)) + 1
          : 0;
    }

    // Optimistic update - immediately update UI
    const updatedTasks = tasks.map((task) => {
      if (task._id === activeTask._id) {
        return { ...task, column: targetColumnId, order: newOrder };
      }
      return task;
    });
    onTasksUpdate(updatedTasks);

    // Update task on server in background
    try {
      await api.put(`/tasks/${activeTask._id}/move`, {
        columnId: targetColumnId,
        order: newOrder,
      });

      // Refresh tasks to get accurate data from server
      const response = await api.get<Task[]>(
        `/tasks/projects/${projectId}/tasks`
      );
      onTasksUpdate(response.data);
    } catch (error) {
      console.error("Failed to update task:", error);
      // Revert optimistic update on error
      onTasksUpdate(tasks);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <ColumnComponent
            key={column._id}
            column={column}
            tasks={getTasksByColumn(column._id)}
            onCreateTask={() => onCreateTask(column._id)}
            onEditTask={onEditTask}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl opacity-90 transition-all">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
