import React from "react";
import { supabase } from "../supabase.js";

function NewTask({ projectID }) {
  const handleSubmit = async (e) => {
    console.log("Submitting new task");
    e.preventDefault();
    const title = e.target.title.value.trim();
    if (!title) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title: title, status: "To Do", project_id: projectID }])
      .select();

    if (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <form className="new-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Task title"
        aria-label="Task title"
      />
      <button type="submit" aria-label="Add task">
        +
      </button>
    </form>
  );
}

export default NewTask;
