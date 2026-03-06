import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Star, Clock, DollarSign } from 'lucide-react';

interface Therapist {
    _id: string;
    name: string;
    specialization: string;
    experience: string;
    rating: number;
    image: string;
    hourlyRate: number;
    available: boolean;
    bio?: string;
    education?: string;
    reviews?: { id: number; user: string; rating: number; comment: string }[];
}

interface TherapistListProps {
    onSelect: (therapist: Therapist) => void;
}

export const TherapistList: React.FC<TherapistListProps> = ({ onSelect }) => {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTherapists = async () => {
            try {
                const response = await api.get('/therapists');
                setTherapists(response.data);
            } catch (error) {
                console.error('Failed to fetch therapists', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTherapists();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading specialists...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((therapist) => (
                <div key={therapist._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                            <img
                                src={therapist.image}
                                alt={therapist.name}
                                className="w-16 h-16 rounded-full object-cover bg-slate-100"
                            />
                            <div>
                                <h3 className="font-bold text-slate-900">{therapist.name}</h3>
                                <p className="text-sm text-primary-600 font-medium">{therapist.specialization}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center text-sm text-slate-600">
                                <Star className="w-4 h-4 text-yellow-400 mr-2" />
                                <span>{therapist.rating} Rating ({therapist.experience})</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <DollarSign className="w-4 h-4 text-slate-400 mr-2" />
                                <span>${therapist.hourlyRate}/hr</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <Clock className="w-4 h-4 text-slate-400 mr-2" />
                                <span className={therapist.available ? 'text-green-600' : 'text-slate-400'}>
                                    {therapist.available ? 'Available Today' : 'Next Available: Tomorrow'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => onSelect(therapist)}
                            className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        >
                            View Profile & Book
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
