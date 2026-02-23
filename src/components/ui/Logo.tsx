import { ImgHTMLAttributes } from 'react';

interface LogoProps extends ImgHTMLAttributes<HTMLImageElement> {
    variant?: 'full' | 'icon';
    className?: string;
}

export const Logo = ({ variant = 'full', className, ...props }: LogoProps) => {
    const src = variant === 'full' ? '/logo-full.png' : '/logo-icon.png';
    const alt = variant === 'full' ? 'EVENTPIXIO Logo' : 'EVENTPIXIO Icon';

    return (
        <img
            src={src}
            alt={alt}
            className={`object-contain ${className}`}
            {...props}
        />
    );
};
