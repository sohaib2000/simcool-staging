import { ProfileUpdateCurencyType } from '@/types/type';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface User {
    id: number;
    name: string;
    email: string;
    image?: string | null;
    currencyId?: number | null;
    kyc_status?: 'Not applied' | 'pending' | 'approved' | 'rejected';
    currency?: ProfileUpdateCurencyType;
}

interface UserState {
    userToken: string | null;
    user: User | null;
}

interface SetUserPayload {
    token: string | null;
    user: User;
}

const initialState: UserState = {
    userToken: null,
    user: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<SetUserPayload>) => {
            state.userToken = action.payload.token;
            state.user = action.payload.user;
        },
        clearUser: (state) => {
            state.userToken = null;
            state.user = null;
        }
    }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
