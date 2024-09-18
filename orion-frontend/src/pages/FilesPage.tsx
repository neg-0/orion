import { Box } from "@mui/material";
import React from "react";
import FileBrowser from "../components/FileBrowser";
import FileEditor from "../components/FileEditor";

export default function FilesPage() {

  const [selectedItem, setSelectedItem] = React.useState<string>("")
  const [editMode, setEditMode] = React.useState(false)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <Box sx={{ width: 240, height: '80vh' }}>
        <FileBrowser setSelectedItem={setSelectedItem} />
      </Box>
      <Box>
        <FileEditor selectedItem={selectedItem} editMode={editMode} setEditMode={setEditMode} />
      </Box>
    </Box>
  )
}