import { Box, Typography } from "@mui/material";
import ProjectSelection from "../ProjectSelection";

export default function ProjectPage({ currentProject, setCurrentProject }: { currentProject: Project | null, setCurrentProject: (project: Project) => void }) {
  return (
    <Box>
      <Typography variant="h3">Current Project: {currentProject?.name}</Typography>
      <ProjectSelection setCurrentProject={setCurrentProject} />
    </Box>
  )
}