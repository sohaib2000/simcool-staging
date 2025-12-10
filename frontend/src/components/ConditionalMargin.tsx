'use client';

import { ReactNode } from 'react';

import { usePathname } from 'next/navigation';

interface ConditionalMarginProps {
    children: ReactNode;
}

const ConditionalMargin = ({ children }: ConditionalMarginProps) => {
    const pathname = usePathname();
    const isRootPath = pathname === '/';

    return <div className={isRootPath ? '' : 'mt-14 lg:mt-[65px]'}>{children}</div>;
};

export default ConditionalMargin;
