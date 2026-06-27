import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";
import { Link } from "react-router-dom";
import NewProject from "../components/NewProject";
import JoinProject from "../components/JoinProject";

export default function Home() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async (userId) => {
    if (!userId || userId === "undefined") {
      console.log("Skipping fetch: User ID is not loaded yet.");
      return;
    }
    const { data, error } = await supabase
      .from("projects_members")
      .select(
        `
          projects (
            id,
            title,
            join_code
          )
        `,
      )
      .eq("user_id", userId);
    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      console.log(data);
      // Flatten the array down so it maps easily in your UI
      const cleanList = data.map((item) => item.projects).filter(Boolean);
      setProjects(cleanList);
    }
  };

  useEffect(() => {
    const initialiseHome = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchProjects(session.user.id);
      }
      setLoading(false);
    };
    initialiseHome();
  }, []);

  return (
    <div>
      <h1>Home</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="projects-grid">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Link
                  to={`/project/${project.id}`}
                  key={project.id}
                  className="project-card"
                  style={{ textDecoration: "none", color: "inherit" }} // Optional: keeps your styling intact
                >
                  <h2>{project.title}</h2>
                  <h3>Join Code: {project.join_code}</h3>
                </Link>
              ))
            ) : (
              <p>No projects found.</p>
            )}
          </div>
          <NewProject
            user={user}
            onProjectCreated={() => fetchProjects(user.id)}
          />
          <JoinProject user={user} />
        </>
      )}
    </div>
  );
}
