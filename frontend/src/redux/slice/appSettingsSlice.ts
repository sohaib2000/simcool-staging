// appSettingsReducer.ts
import { API_URL } from '@/config/constant';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk to fetch settings
export const fetchAppSettings = createAsyncThunk('appSettings/fetchAppSettings', async () => {
    const res = await fetch(`${API_URL}/generalSettings`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch settings');
    return json.data;
});

interface AppSettingsState {
    loading: boolean;
    error: string | null;
    logo: string | null;
    DarkLogo: string | null;
    favicon: string | null;
    firebase: Record<string, any> | null;
}

const initialState: AppSettingsState = {
    loading: false,
    error: null,
    logo: null,
    DarkLogo: null,
    favicon: null,
    firebase: null
};

const appSettingsSlice = createSlice({
    name: 'appSettings',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAppSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAppSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.logo = action.payload.logo;
                state.DarkLogo = action.payload.DarkLogo;
                state.favicon = action.payload.favicon;
                state.firebase = action.payload.firebase;
            })
            .addCase(fetchAppSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Something went wrong';
            });
    }
});

export default appSettingsSlice.reducer;
