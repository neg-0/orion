import { Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
// import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import React from 'react';

export default function FileEditor({ selectedItem, editMode, setEditMode }: { selectedItem: string, editMode: boolean, setEditMode: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [code, setCode] = React.useState<string>('')

  //   const diffString = `diff --git a/sample.js b/sample.js
  // index 0000001..0ddf2ba
  // --- a/sample.js
  // +++ b/sample.js
  // @@ -1 +1 @@
  // -console.log("Hello World!")
  // +console.log("Hello from Diff2Html!")`;

  //   const diff = new Diff2Html.html(diffString, {
  //     drawFileList: true,
  //     outputFormat: 'side-by-side',
  //     matching: 'lines',
  //     synchronisedScroll: true,
  //   });

  React.useEffect(() => {
    axios.get('/workspace/file', { params: { projectName: 'orion-test', filePath: selectedItem } })
      .then((response) => {
        setCode(response.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [selectedItem])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value)
  }

  const handleSave = () => {
    axios.post('/workspace/save', { projectName: 'orion-test', selectedItem, code })
      .then(() => {
        console.log('Saved')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleEdit = () => {
    setEditMode(!editMode)
  }

  return (
    <>
      <Typography variant="h6">{selectedItem}</Typography>

      {editMode ? (
        <div>
          <TextField value={code} onChange={handleChange} multiline fullWidth />
          <Button onClick={handleSave}>Save</Button>
        </div>
      ) : (
        <div>
          <TextField value={code} multiline fullWidth />
          <button onClick={handleEdit}>Edit</button>
        </div>
      )}
    </>
  )
}