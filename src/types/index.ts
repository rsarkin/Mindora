export interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'therapist' | 'admin';
    avatar?: string;
    accountStatus?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface Review {
    id: number;
    user: string;
    rating: number;
    comment: string;
}

export interface Therapist {
    _id: string;
    name: string;
    specialization: string;
    rating: number;
    imageUrl: string;
    isAvailable: boolean;
    bio?: string;
    education?: string;
    location?: string;
    reviews?: Review[];
    experience?: string; // Optional as it might not be in backend yet
    hourlyRate?: number; // Optional
}

export interface Appointment {
    id: string;
    therapistId: string;
    patientId: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    meetingLink?: string;
    type: 'video' | 'chat' | 'in-person';
}
