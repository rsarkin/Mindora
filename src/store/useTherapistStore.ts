import { create } from 'zustand';

interface TherapistProfile {
    _id: string;
    userId: string;
    licenseNumber: string;
    licenseState: string;
    specializations: string[];
    bio: string;
    experienceYears: number;
    hourlyRateUSD: number;
    hourlyRateINR?: number;
    isAcceptingPatients: boolean;
    verificationStatus: string;
    profileComplete: boolean;
    avatar?: string;
    googleRefreshToken?: string;
}

interface TherapistStore {
    profile: TherapistProfile | null;
    isLoading: boolean;
    error: string | null;
    setProfile: (profile: TherapistProfile) => void;
    clearProfile: () => void;
    fetchProfile: (api: any) => Promise<TherapistProfile | null>;
    updateProfile: (api: any, data: Partial<TherapistProfile>) => Promise<TherapistProfile | null>;
}

export const useTherapistStore = create<TherapistStore>((set) => ({
    profile: null,
    isLoading: false,
    error: null,
    setProfile: (profile) => set({ profile }),
    clearProfile: () => set({ profile: null, error: null }),
    fetchProfile: async (api: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/therapists/profile');
            if (response.data) {
                // Infer completion profile completeness logic
                const p = response.data;
                const profileComplete = Boolean(p.bio && p.experienceYears && p.specializations?.length);
                const finalProfile = { ...p, profileComplete };
                set({ profile: finalProfile, isLoading: false });
                return finalProfile;
            }
            return null;
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to fetch therapist profile', isLoading: false });
            return null;
        }
    },
    updateProfile: async (api: any, data: Partial<TherapistProfile>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/therapists/profile', data);
            if (response.data) {
                const p = response.data;
                const profileComplete = Boolean(p.bio && p.experienceYears && p.specializations?.length);
                const finalProfile = { ...p, profileComplete };
                set({ profile: finalProfile, isLoading: false });
                return finalProfile;
            }
            return null;
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to update therapist profile', isLoading: false });
            return null;
        }
    }
}));
