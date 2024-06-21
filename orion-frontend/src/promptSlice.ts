import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface PromptState {
  response: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: PromptState = {
  response: '',
  status: 'idle',
  error: null,
};

export const sendPrompt = createAsyncThunk('prompt/sendPrompt', async (prompt: string) => {
  const response = await axios.post('/api/prompt', { prompt });
  return response.data.result;
});

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendPrompt.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendPrompt.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.response = action.payload;
      })
      .addCase(sendPrompt.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default promptSlice.reducer;
