import Link from 'next/link';

const NoteFound = () => {
    return (
        <div className='min-h-screen bg-white transition-colors duration-300 dark:bg-gray-900'>
            <main className='grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8'>
                <div className='mx-auto max-w-2xl text-center'>
                    <p className='text-base font-semibold text-indigo-600 dark:text-indigo-400'>404</p>
                    <h1 className='mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white'>
                        Page not found
                    </h1>
                    <p className='mt-6 text-lg leading-7 text-gray-600 dark:text-gray-300'>
                        Sorry, we couldn&apos;t find the page you&lsquo;re looking for.
                    </p>
                    <div className='mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row'>
                        <Link
                            href='/'
                            className='rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400'>
                            Go back home
                        </Link>
                    </div>

                    {/* Additional decorative element */}
                    <div className='mt-16 flex justify-center'>
                        <div className='relative h-40 w-40'>
                            <div className='absolute inset-0 animate-pulse rounded-full bg-indigo-100 opacity-70 dark:bg-indigo-900/30'></div>
                            <div className='absolute inset-4 animate-pulse rounded-full bg-indigo-200 opacity-50 [animation-delay:0.3s] dark:bg-indigo-800/30'></div>
                            <div className='absolute inset-8 animate-pulse rounded-full bg-indigo-300 opacity-30 [animation-delay:0.6s] dark:bg-indigo-700/30'></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NoteFound;
