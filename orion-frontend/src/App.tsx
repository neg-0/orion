import { Box } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import axios from "axios";
import React, { useState } from 'react';
import { Route, Routes } from "react-router-dom";
import MenuDrawer from "./MenuDrawer";
import FilesPage from "./pages/FilesPage";
import KnowledgePage from "./pages/KnowledgePage";
import ProjectPage from "./pages/ProjectPage";

const AppContext = React.createContext({});

axios.defaults.baseURL = 'http://localhost:3000';

export default function App() {

  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  return (
    <AppContext.Provider value={{ currentProject }}>

      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <MenuDrawer />

        <Routes>
          <Route path="/project" element={<ProjectPage currentProject={currentProject} setCurrentProject={setCurrentProject} />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/files" element={<FilesPage />} />
        </Routes>
      </ Box >
    </AppContext.Provider>
  )
}