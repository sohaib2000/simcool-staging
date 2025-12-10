// components/navData.ts
export const navData = {
    topNavbar: {
        content: 'Scaling Support on a Budget? Try whatsway for WhatsApp-First Solution',
        buttonText: 'Read more'
    },
    secondNavbar: {
        logo: '/images/simtel-main.png',
        navlinks: [
            {
                label: 'What is an eSIM',
                href: '/what-is-esim'
            },
            {
                label: 'About Us',
                href: '/about-us'
            },
            {
                label: 'Download App',
                submenu: [
                    { name: 'App Store', href: 'https://www.apple.com/in/app-store/' },
                    {
                        name: 'Google Play Store',
                        href: 'https://play.google.com/store/apps/details?id=com.esim.app&hl=en_IN'
                    }
                ]
            },
            {
                label: 'Resources',
                submenu: [
                    { name: 'All Destinations', href: '/all-destinations' },
                    { name: 'All Packages', href: '/all-packages' },
                    { name: 'All Country Plan', href: '/country-plan' }
                ]
            },

            {
                label: 'Supported Devices',
                href: '/esim-supported-devices'
            }
        ]
    }
};
