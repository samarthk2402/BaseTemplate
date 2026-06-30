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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!title) return <div>Project not found</div>;

  return (
    <div className="project-workspace-container">
      <h1>{title}</h1>
      <NewTask projectID={projectID} />
      <KanbanBoard projectID={projectID} />
    </div>
  );
}
