import { useState } from "react";
import { supabase } from "../supabase.js";

export default function JoinProject({ user }) {
  const [joinCode, setJoinCode] = useState("");
  const joinProjectByCode = async (joinCode, userId) => {
    if (!joinCode.trim() || !userId) {
      alert("Please enter a valid code and ensure you are logged in.");
      return;
    }

    // 1. Search the projects table for the code
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, title")
      .eq("join_code", joinCode.trim())
      .maybeSingle(); // Returns an object instead of an array, or null if not found

    if (projectError) {
      console.error("Error searching for project:", projectError);
      alert("An error occurred while searching for the project.");
      return;
    }

    // If no project matches the code
    if (!projectData) {
      alert("No project found with that join code!");
      return;
    }

    // 2. If found, insert a new row into the junction table
    const { error: joinError } = await supabase
      .from("projects_members")
      .insert([{ project_id: projectData.id, user_id: userId }]);

    if (joinError) {
      // Catch if they are already a member (violates unique constraints if you set them up)
      if (joinError.code === "23505") {
        alert("You are already a member of this project!");
      } else {
        console.error("Error joining project:", joinError);
        alert("Failed to join project: " + joinError.message);
      }
    } else {
      alert(`Successfully joined ${projectData.title}!`);
      return projectData.id; // Return the ID so your UI can refresh or redirect
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!joinCode.trim()) return;
    console.log("Join project with code:", joinCode);

    joinProjectByCode(joinCode, user.id);
  };

  return (
    <div className="join-project-container">
      <h2>Join Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="join-code">Join Code:</label>
          <input
            id="join-code"
            type="text"
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="Enter join code"
            required
          />
        </div>
        <button type="submit">Join Project</button>
      </form>
    </div>
  );
}
