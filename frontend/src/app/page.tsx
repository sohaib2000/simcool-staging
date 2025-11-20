'use client';

import Main from '@/components/Main';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const Page = () => {
    return (
        <div>
            <ServiceWorkerRegister />
            <Main />
        </div>
    );
};

export default Page;
