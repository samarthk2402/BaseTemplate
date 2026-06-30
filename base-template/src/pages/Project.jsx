import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase.js";
import KanbanBoard from "../components/KanbanBoard.jsx";
import NewTask from "../components/NewTask.jsx";

export default function Project() {
  const { projectID } = useParams();
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("ProjectID from URL params:", projectID);
    if (!projectID) return;
    setLoading(true);
    setError(null);

    const fetchTitle = async () => {
      const { data, error: err } = await supabase
        .from("projects")
        .select("title")
        .eq("id", projectID)
        .single();

      if (err) throw err;
      setTitle(data?.title ?? null);
      console.log("Fetched project title:", data?.title);
      setLoading(false);
    };

    fetchTitle();
  }, [projectID]);

  if (loading)
    return (
      <div className="project-workspace-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="project-workspace-container">
        <p>Error: {error}</p>
      </div>
    );
  if (!title)
    return (
      <div className="project-workspace-container">
        <p>Project not found</p>
      </div>
    );

  return (
    <div className="project-workspace-container">
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      <NewTask projectID={projectID} />
      <KanbanBoard projectID={projectID} />
    </div>
  );
}
