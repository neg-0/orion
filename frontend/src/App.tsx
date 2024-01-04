import BugReportIcon from '@mui/icons-material/BugReport';
import PersonIcon from '@mui/icons-material/Person';
import { Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import './App.css'; // Import a CSS file to style your components

function App() {
  const [data, setData] = useState<any[]>([])

  axios.defaults.baseURL = 'http://localhost:3000'

  function fetchData() {
    axios.get('/test').then((res) => {
      setData(res.data)
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={fetchData}>Fetch Data</button>
        {data.map((item, index) => (
          <Card key={index} sx={{ marginBottom: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                <BugReportIcon /> {item.title}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                {item.body}
              </Typography>
              <Typography variant="body2">
                <PersonIcon /> Reported by: {item.user.login}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </header>
    </div>
  )
}

export default App