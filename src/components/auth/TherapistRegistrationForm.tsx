import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Mail, Lock, Building, UploadCloud, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const therapistSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Valid phone number required'),
    location: z.string().min(5, 'Clinic/Office address required'),

    licenseNumber: z.string().min(4, 'License number is required'),
    licenseState: z.string().min(2, 'State of issue required'),
    experienceYears: z.coerce.number().min(0, 'Must be a valid number'),
    specializations: z.string().min(3, 'Enter at least one specialization'),

    bio: z.string().min(20, 'Please provide a brief professional bio'),
    hourlyRate: z.coerce.number().min(500, 'Minimum hourly rate is ₹500')
});

type TherapistFormData = z.infer<typeof therapistSchema>;

export const TherapistRegistrationForm = () => {
    const [step, setStep] = useState(1);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(therapistSchema),
        mode: 'onTouched'
    });

    const nextStep = async (fieldsToValidate: (keyof TherapistFormData)[]) => {
        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(prev => prev + 1);
    };

    const onSubmit = async (data: any) => {
        if (!licenseFile) {
            setSubmitError("Professional License document is required.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const formData = new FormData();
            formData.append('role', 'THERAPIST');

            // Append all text fields
            (Object.keys(data) as Array<keyof TherapistFormData>).forEach(key => {
                formData.append(key, data[key].toString());
            });

            // Append files
            if (avatarFile) formData.append('avatar', avatarFile);
            if (licenseFile) formData.append('documents', licenseFile);

            const response = await api.post('/auth/register', formData);

            login(response.data.token, response.data.user);
            navigate('/verification-pending');

        } catch (err: any) {
            console.error('Registration Error:', err);
            setSubmitError(err.response?.data?.message || err.response?.data?.error || 'Failed to complete registration');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File) => void) => {
        if (e.target.files && e.target.files[0]) {
            setter(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            {/* Stepper Progress */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
                <div className={`absolute left-0 top-1/2 h-0.5 bg-primary-500 -z-10 -translate-y-1/2 transition-all duration-300`} style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${step >= i ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                        {step > i ? <CheckCircle className="w-4 h-4" /> : i}
                    </div>
                ))}
            </div>

            {submitError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Step 1: Base Identity */}
                {step === 1 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Identity & Contact</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input {...register('name')} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Dr. Jane Doe" />
                                </div>
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input type="email" {...register('email')} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="jane@clinic.com" />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input type="password" {...register('password')} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="••••••••" />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                                <input {...register('phone')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="(555) 123-4567" />
                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic/Office Location</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input {...register('location')} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="City, State" />
                                </div>
                                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
                            </div>
                        </div>

                        <button type="button" onClick={() => nextStep(['name', 'email', 'password', 'phone', 'location'])} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                            Continue to Credentials <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Step 2: Credentials */}
                {step === 2 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Professional Credentials</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">License Number</label>
                                <input {...register('licenseNumber')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none font-mono" placeholder="ABC-123456" />
                                {errors.licenseNumber && <p className="text-xs text-red-500 mt-1">{errors.licenseNumber.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">State of Issue</label>
                                <input {...register('licenseState')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="CA" />
                                {errors.licenseState && <p className="text-xs text-red-500 mt-1">{errors.licenseState.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Specializations (Comma separated)</label>
                            <input {...register('specializations')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Trauma, CBT, Family Therapy" />
                            {errors.specializations && <p className="text-xs text-red-500 mt-1">{errors.specializations.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Years of Clinical Experience</label>
                            <input type="number" {...register('experienceYears')} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="5" />
                            {errors.experienceYears && <p className="text-xs text-red-500 mt-1">{errors.experienceYears.message}</p>}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Back</button>
                            <button type="button" onClick={() => nextStep(['licenseNumber', 'licenseState', 'specializations', 'experienceYears'])} className="w-2/3 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                                Continue to Profile <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Bio */}
                {step === 3 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Patient-Facing Profile</h3>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio</label>
                            <textarea {...register('bio')} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Introduce yourself to potential patients. Highlight your therapeutic approach..." />
                            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Consultation Rate (INR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-2.5 text-slate-400 font-bold">₹</span>
                                <input type="number" {...register('hourlyRate')} className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="1500" />
                            </div>
                            {errors.hourlyRate && <p className="text-xs text-red-500 mt-1">{errors.hourlyRate.message}</p>}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setStep(2)} className="w-1/3 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Back</button>
                            <button type="button" onClick={() => nextStep(['bio', 'hourlyRate'])} className="w-2/3 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                                Continue to Documents <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Documents */}
                {step === 4 && (
                    <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Document Verification</h3>
                        <p className="text-sm text-slate-500 mb-4">Mindora administrators require proof of identity and active licensing to approve your profile to accept patients.</p>

                        <div className="space-y-4">
                            {/* License Upload */}
                            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileDrop(e, setLicenseFile)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                        {licenseFile ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <FileText className="w-6 h-6" />}
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Proof of Medical License *</p>
                                    <p className="text-xs text-slate-500">{licenseFile ? licenseFile.name : "Drag & drop PDF/Image here"}</p>
                                </div>
                            </div>

                            {/* Avatar Upload */}
                            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                                <input type="file" accept="image/*" onChange={(e) => handleFileDrop(e, setAvatarFile)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                                        {avatarFile ? (
                                            <img src={URL.createObjectURL(avatarFile)} alt="preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Profile Portrait Picture</p>
                                    <p className="text-xs text-slate-500">{avatarFile ? avatarFile.name : "Optional High-Res Photo"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 shrink-0">
                            <button type="button" onClick={() => setStep(3)} className="w-1/3 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Back</button>
                            <button type="submit" disabled={isSubmitting} className="w-2/3 py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UploadCloud className="w-5 h-5" /> Submit Application</>}
                            </button>
                        </div>
                    </div>
                )}

            </form>
        </div>
    );
};
