import { useEffect, useState } from 'react';

interface Project {
  id: number;
  name: string;
}

export default function ProjectSelection({ setCurrentProject }: { setCurrentProject: (project: Project) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);

  async function fetchProjects() {
    const response = await fetch('http://localhost:3000/projects');
    const projects = await response.json();
    setProjects(projects);
  }

  function handleProjectClick(project: Project) {
    setCurrentProject(project);
  }

  useEffect(() => {
    fetchProjects();
  }, []);



  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id} onClick={() => handleProjectClick(project)}>
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
}