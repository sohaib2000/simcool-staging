import appSettingsSlice from '@/redux/slice/appSettingsSlice';
import userReducer from '@/redux/slice/userSlice';
import { combineReducers } from '@reduxjs/toolkit';

export const rootReducer = combineReducers({
    user: userReducer,
    appSettings: appSettingsSlice
});

export type RootState = ReturnType<typeof rootReducer>;
