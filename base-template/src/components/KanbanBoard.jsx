import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "../supabase.js";

const COLUMNS = [
  { status: "To Do", className: "kanban-column--todo" },
  { status: "In Progress", className: "kanban-column--progress" },
  { status: "Done", className: "kanban-column--done" },
];

export default function KanbanBoard({ projectID }) {
  const [tasks, setTasks] = useState([]);

  // 1. Fetch tasks for this project from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectID);

      if (!error && data) setTasks(data);
    };
    console.log("Fetching tasks for project ID:", projectID);
    if (projectID) fetchTasks();

    const channels = supabase
      .channel(`public:tasks:project_${projectID}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: "project_id=eq." + projectID,
        },
        (payload) => {
          console.log("Change received!", payload);
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === payload.new.id ? payload.new : task,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, [projectID]);

  // 2. This function runs the moment a user stops dragging a card
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a column, or dropped in the exact same spot, do nothing
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const nextStatus = destination.droppableId; // e.g., "In Progress"

    // Optimistically update frontend state instantly so it feels snappy
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id.toString() === draggableId ? { ...t, status: nextStatus } : t,
      ),
    );

    // Update Supabase in the background
    const { error } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", draggableId);

    if (error) {
      console.error("Failed to update task status in DB:", error);
      // Optional: Refetch tasks here to revert UI if DB save fails
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-container">
        {COLUMNS.map(({ status, className }) => {
          const columnTasks = tasks.filter((t) => t.status === status);

          return (
            <div key={status} className={`kanban-column ${className}`}>
              <div className="kanban-column-header">
                <span className="kanban-column-dot" />
                <h2>{status}</h2>
                <span className="kanban-column-count">{columnTasks.length}</span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`task-list-zone ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                  >
                    {columnTasks.map((task, index) => (
                      /* Draggable wrapper for individual Task cards */
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? "dragging" : ""}`}
                          >
                            <h4>{task.title}</h4>
                            {task.description && <p>{task.description}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}{" "}
                    {/* Crucial! Prevents column collapse during drag */}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
