import { Button, Paper, Stack, TextField } from "@mui/material";

export default function NewProject() {
  return (
    <Paper sx={{ padding: 2 }}>
      <Stack direction="column" spacing={2}>
        <h1>New Project</h1>
        <TextField label="Project Name" />
        <TextField label="Description"
          multiline
          rows={4}
        />
        <TextField label="Repository URL" />
        <TextField label="Issues URL" />
        <Button variant="contained">Create</Button>
      </Stack>
    </Paper>
  )
}