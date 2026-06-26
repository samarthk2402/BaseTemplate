import React, { useState } from "react";
import { supabase } from "../supabase.js";

const NewProject = ({ user, onProjectCreated }) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const generateJoinCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "P-";
    const codeLength = 5;
    for (let i = 0; i < codeLength; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const updateProjectMembers = async (projectId, userId) => {
    const { data, error } = await supabase
      .from("projects_members")
      .insert([{ project_id: projectId, user_id: userId }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      setLoading(true);
      const newCode = generateJoinCode();
      console.log("Project Created:", { title, joinCode: newCode });

      const { data, error } = await supabase
        .from("projects")
        .insert([{ title: title, join_code: newCode }])
        .select();

      if (error) {
        console.error("Error creating project:", error);
        alert("Failed to create project: " + error.message);
      } else {
        console.log("Project created successfully:", data);
        setTitle("");
        onProjectCreated();
      }

      await updateProjectMembers(data[0].id, user.id);
      setLoading(false);
    }
  };

  return (
    <div className="new-project-container">
      <h2>Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Project Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter project title"
            required
          />
        </div>
        <button type="submit">Create Project</button>
      </form>
      {loading ? <p>Creating project...</p> : null}
    </div>
  );
};

export default NewProject;
