// app/fonts/fonts.ts (Updated)
import { Inter, Poppins, Roboto } from 'next/font/google';

export const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-poppins',
    display: 'swap',
    fallback: ['system-ui', 'arial']
});

export const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    fallback: ['system-ui', 'arial']
});

export const roboto = Roboto({
    subsets: ['latin'],
    weight: ['300', '400', '500', '700'],
    variable: '--font-roboto',
    display: 'swap',
    fallback: ['system-ui', 'arial']
});

export type FontType = typeof poppins | typeof inter | typeof roboto;
