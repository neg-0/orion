import { Divider, Drawer, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const drawerWidth = 240;

export default function MenuDrawer() {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Typography variant="h3">Orion</Typography>
      <Divider />
      <Link to="/project"><Typography variant="h5">Project</Typography></Link>
      <Link to="/knowledge"><Typography variant="h5">Knowledge</Typography></Link>
      <Link to="/files"><Typography variant="h5">Files</Typography></Link >
    </Drawer>
  )
}