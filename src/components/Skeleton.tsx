import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    animation?: 'pulse' | 'wave' | 'none';
    children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    animation = 'pulse',
    children
}) => {
    // Base classes for the skeleton
    const baseClasses = 'bg-slate-200/50 backdrop-blur-sm';

    // Variant specific classes
    const variantClasses = {
        text: 'rounded-md h-4 w-full',
        circular: 'rounded-full h-12 w-12',
        rectangular: 'rounded-xl h-24 w-full',
        card: 'rounded-3xl h-64 w-full border border-slate-100'
    };

    // Animation specific classes
    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        none: ''
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
        >
            {children}
        </div>
    );
};

// Export pre-composed skeleton layouts for common use cases
export const ProfileSkeleton = () => (
    <div className="flex items-center gap-4 w-full">
        <Skeleton variant="circular" className="w-16 h-16 shrink-0" />
        <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3 h-5" />
            <Skeleton variant="text" className="w-1/4 h-3" />
        </div>
    </div>
);

export const CardSkeleton = () => (
    <Skeleton variant="card" className="p-6 flex flex-col gap-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <Skeleton variant="text" className="w-3/4 h-6" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-5/6 h-4" />
    </Skeleton>
);

export const ListItemSkeleton = () => (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 w-full mb-3">
        <Skeleton variant="rectangular" className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2.5">
            <Skeleton variant="text" className="w-1/2 h-4" />
            <Skeleton variant="text" className="w-3/4 h-3" />
        </div>
        <Skeleton variant="rectangular" className="w-8 h-8 rounded-lg shrink-0" />
    </div>
);
