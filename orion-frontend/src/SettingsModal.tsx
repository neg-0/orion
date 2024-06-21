import { Box, FormGroup, Input, Modal, Typography } from "@mui/material"
import { useState } from "react"

export default function SettingsModal({ open, onCloseModal, saveSettings }: { open: boolean, onCloseModal: () => void, saveSettings: (apiKey: string, repo: string) => void }) {

  const [apiKey, setApiKey] = useState('')
  const [repo, setRepo] = useState('')

  const handleSave = () => {
    saveSettings(apiKey, repo)
    onCloseModal()
  }

  const handleCancel = () => {
    onCloseModal()
  }

  return (
    <Modal open={open} onClose={onCloseModal}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Settings
        </Typography>
        <FormGroup>
          <Input placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <Input placeholder="Repo" value={repo} onChange={(e) => setRepo(e.target.value)} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleSave}>Save</button>
          </Box>
        </FormGroup>
      </Box>
    </Modal>
  )
}