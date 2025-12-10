'use client';

import { JSX, useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_URL, BASE_URL } from '@/config/constant';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUserMutation } from '@/lib/apiHandler/useApiMutation';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { getFirebaseMessaging } from '@/lib/firebase/config';
import { getUserTokenClient, isUserAuthenticated, removeUserToken } from '@/lib/userAuth';
import { fetchAppSettings } from '@/redux/slice/appSettingsSlice';
import { setUser } from '@/redux/slice/userSlice';
import { AppDispatch, RootState } from '@/redux/store/store';
import { LogOutResponceType, NotificationResponse, User } from '@/types/type';

import Alert from '../Alert';
import LanguageSwitcher from '../LanguageSwitcher';
import MobileLanguageSelector from '../MobileLanguageSelector';
import Loader from '../common/Loader';
import OtpSignup from '../modals/OtpSignup';
import { Button } from '../ui/button';
import { onMessage } from 'firebase/messaging';
import { Bell } from 'lucide-react';
import { FaPlaneDeparture } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

interface UserData {
    readonly name?: string;
    readonly email?: string;
    readonly image?: string;
}

interface UserProfileRes {
    success: boolean;
    data: User;
    message: string;
}

const Navbar = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const pathname = usePathname();
    const navRef = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();
    // State management
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [count, setCount] = useState(0);
    const [notifications1, setNotifications1] = useState<unknown[]>([]);
    const { logo, loading, DarkLogo } = useSelector((state: RootState) => state.appSettings);

    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    // Redux selectors
    const isUserData = useSelector((state: RootState) => state.user.user);
    const userRedux = useSelector((state: RootState) => state.user.user);
    const userToken = useSelector((state: RootState) => state.user.userToken);

    // API hooks
    const { mutate: signOut } = useUserMutation({
        url: '/signout',
        method: 'POST'
    });

    const { data, isLoading } = useProtectedApiHandler<UserProfileRes>({
        url: '/profile',
        enabled: !isUserData
    });

    // Constants
    const isLandingPage = pathname === '/';

    const profileMenuItems = [
        { label: 'Account Information', href: '/profile', icon: 'user' },
        { label: 'Orders History', href: '/profile/order-history', icon: 'package' },
        { label: 'Privacy Policy', href: '/profile/privacy-policy', icon: 'shield' },
        { label: 'Terms & Conditions', href: '/profile/terms-and-conditions', icon: 'star' },
        { label: 'FAQ', href: '/profile/faq', icon: 'credit-card' },
        { label: 'Customer Support', href: '/profile/customer-support', icon: 'gift' },
        { label: 'Sign Out', href: '#', icon: 'logout', isSignOut: true }
    ];

    const navData = {
        secondNavbar: {
            logo: '/images/simtel-main.png',
            navlinks: [
                {
                    label: 'home.nav.whatIsEsim',
                    href: '/what-is-esim'
                },
                {
                    label: 'home.nav.aboutUs', // t('nav.aboutUs')
                    href: '/about-us'
                },
                {
                    label: 'home.nav.downloadApp', // t('nav.downloadApp')
                    submenu: [
                        { name: 'home.nav.appStore', href: 'https://www.apple.com/in/app-store/' },
                        {
                            name: 'home.nav.googlePlay',
                            href: 'https://play.google.com/store/apps/details?id=com.esim.app&hl=en_IN'
                        }
                    ]
                },
                {
                    label: 'home.nav.resources', // t('nav.resources')
                    submenu: [
                        { name: 'home.nav.allDestinations', href: '/all-destinations' },
                        { name: 'home.nav.allPackages', href: '/all-packages' },
                        { name: 'home.nav.allCountryPlan', href: '/country-plan' }
                    ]
                },
                {
                    label: 'home.nav.supportedDevices', // t('nav.supportedDevices')
                    href: '/esim-supported-devices'
                }
            ]
        }
    };

    const userData: UserData = {
        name: userRedux?.name,
        email: userRedux?.email,
        image: userRedux?.image || undefined
    };

    // Check authentication status
    const checkAuthStatus = useCallback(() => {
        const authStatus = isUserAuthenticated();
        const hasUserToken = Boolean(getUserTokenClient());
        const isAuth = authStatus && hasUserToken;
        setIsAuthenticated(isAuth);
    }, []);

    // Helper function to check if device is mobile
    const isMobileDevice = useCallback((): boolean => {
        return typeof window !== 'undefined' && window.innerWidth <= 1024;
    }, []);

    // Show alert message
    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    // Handle sign out
    const handleSignOut = useCallback(async (): Promise<void> => {
        try {
            signOut(undefined, {
                onSuccess: (data: unknown) => {
                    const apiRes = data as LogOutResponceType;
                    removeUserToken();
                    router.push('/');
                    showAlertMessage(`${apiRes.message}`, 'success');
                    setIsAuthenticated(false);
                    setShowProfileMenu(false);
                    setIsMobileOpen(false);
                },
                onError: (data: unknown) => {
                    const apiRes = data as LogOutResponceType;
                    showAlertMessage(`${apiRes.message}`, 'error');
                }
            });
        } catch (error) {
            const apiRes = error as LogOutResponceType;
            showAlertMessage(`${apiRes.message}`, 'error');
        }
    }, [showAlertMessage, signOut, router]);

    // Handle sign in modal
    const handleSignModal = useCallback((): void => {
        setIsSignInModalOpen(true);
        setIsMobileOpen(false);
    }, []);

    const handleModalSuccess = useCallback((): void => {
        setIsSignInModalOpen(false);
        setTimeout(() => {
            checkAuthStatus();
        }, 100);
    }, [checkAuthStatus]);

    // Toggle menu
    const toggleMenu = useCallback(
        (index: number) => {
            setActiveMenu(activeMenu === index ? null : index);
        },
        [activeMenu]
    );

    const handleMenuMouseEnter = useCallback((index: number) => {
        setActiveMenu(index);
    }, []);

    const handleMenuMouseLeave = useCallback(() => {
        setActiveMenu(null);
    }, []);

    const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            action();
        }
    }, []);

    // Get user initials
    const getUserInitials = useCallback((name: string): string => {
        return name
            .split(' ')
            .map((n) => n[0] || '')
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, []);

    // Get icon SVG
    const getIconSVG = useCallback((iconType: string) => {
        const iconProps = 'h-4 w-4';
        const iconMap: Record<string, JSX.Element> = {
            user: (
                <svg className={iconProps} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                </svg>
            ),
            shield: (
                <svg className={iconProps} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                    />
                </svg>
            ),
            star: (
                <svg className={iconProps} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                    />
                </svg>
            ),
            'credit-card': (
                <svg className={iconProps} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                    />
                </svg>
            ),
            gift: (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={2}
                    stroke='currentColor'
                    className={iconProps}>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M12 12v9m0-9V6a2 2 0 114 0v6m-4 0H8m4 0h4m-6 0H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2h-6z'
                    />
                </svg>
            ),
            package: (
                <svg className={iconProps} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                    />
                </svg>
            ),
            logout: (
                <svg className={iconProps} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                    />
                </svg>
            )
        };

        return iconMap[iconType] || iconMap.user;
    }, []);

    // Effects
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const {
        data: notifyRes,
        isLoading: notifyLoading,
        error: notifyError
    } = useProtectedApiHandler<NotificationResponse>({
        url: '/notifications',
        enabled: isAuthenticated
    });

    // Extract array safely
    const notifications = notifyRes?.data?.data ?? [];

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const initializeNotifications = async () => {
            try {
                // 1. Get messaging instance dynamically
                const messaging = await getFirebaseMessaging();
                if (!messaging) return;

                unsubscribe = onMessage(messaging, (payload) => {
                    setCount((prev: number) => prev + 1);
                    setNotifications1((prev: any[]) => [...prev, payload]);
                    setUnreadCount((prev) => prev + count + 1);
                });
            } catch (error) {
                console.warn('Error initializing notifications:', error);
            }
        };

        initializeNotifications();

        // Cleanup listener on unmount
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [setCount, setNotifications1, setUnreadCount, count]);

    // Calculate unread count from API notifications + FCM count
    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const apiUnreadCount = notifications.filter((n) => n.is_read === 0).length;
            setUnreadCount(apiUnreadCount + count);
        } else {
            setUnreadCount(count);
        }
    }, [notifications, count]);

    // Modified notification button click handler
    const handleNotificationClick = async () => {
        setShowNotifications(true);

        // Mark all as read when modal opens
        if (unreadCount > 0) {
            try {
                // Call API to mark all as read
                await fetch(`${API_URL}/notifications?is_read=all`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Reset counts
                setUnreadCount(0);
                setCount(0);

                // Optionally refetch notifications to get updated is_read status
                // Your useProtectedApiHandler should refetch automatically
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        }
    };

    // Redux user data effect
    useEffect(() => {
        if (data?.data) {
            const userInfo = {
                token: getUserTokenClient(),
                user: {
                    id: data.data.id,
                    name: data.data.name,
                    email: data.data.email,
                    role: data.data.role,
                    email_verified_at: data.data.email_verified_at,
                    refCode: data.data.refCode,
                    refBy: data.data.refBy,
                    country: data.data.country,
                    countryCode: data.data.countryCode,
                    currency: data.data.currency,
                    currencyId: data.data.currencyId,
                    is_active: data.data.is_active,
                    image: data.data.image,
                    deleted_at: data.data.deleted_at,
                    created_at: data.data.created_at,
                    kyc_status: data.data.kyc_status,
                    referral_point: data.data.referral_point,
                    notification_count: data.data.notification_count,
                    updated_at: data.data.updated_at,
                    payment_mode: data.data.payment_mode ?? null
                }
            };
            dispatch(
                setUser({
                    token: userInfo.token || null,
                    user: userInfo.user
                })
            );
        }
    }, [data, dispatch]);

    // Updated scroll effect - mobile devices always show white background
    useEffect(() => {
        const handleScroll = () => {
            if (isLandingPage && !isMobileDevice()) {
                setIsScrolled(window.scrollY > 50);
            } else {
                // Always show white background on mobile and non-landing pages
                setIsScrolled(true);
            }
        };

        if (typeof window !== 'undefined') {
            if (isLandingPage) {
                window.addEventListener('scroll', handleScroll);
                window.addEventListener('resize', handleScroll);
                handleScroll(); // Check initial state
            } else {
                setIsScrolled(true);
            }
        }

        return () => {
            if (typeof window !== 'undefined' && isLandingPage) {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleScroll);
            }
        };
    }, [isLandingPage, isMobileDevice]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (typeof window !== 'undefined' && isMobileOpen && isMobileDevice()) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                if (scrollY) {
                    window.scrollTo(0, scrollY);
                }
            };
        }
    }, [isMobileOpen, isMobileDevice]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
                setIsMobileOpen(false);
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        dispatch(fetchAppSettings());
    }, [dispatch]);

    // Dynamic classes based on mobile device detection
    const getNavbarClasses = () => {
        const baseClasses = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out shadow-2xl';

        if (isMobileDevice()) {
            return `${baseClasses} bg-primary  shadow-md backdrop-blur-sm`;
        }

        // Desktop behavior
        return `${baseClasses} ${isScrolled ? ' bg-primary shadow-md backdrop-blur-sm' : 'bg-white'}`;
    };

    // Add this function after line 200
    const getLogo = () => {
        // Mobile always shows normal logo
        if (isMobileDevice()) {
            return BASE_URL && logo ? `${BASE_URL}/${logo}` : '/images/Diploy_logo.png';
        }

        // Desktop: DarkLogo when not scrolled, normal logo when scrolled
        if (isScrolled) {
            return BASE_URL && logo ? `${BASE_URL}/${logo}` : '/images/Diploy_logo.png';
        } else {
            return BASE_URL && DarkLogo
                ? `${BASE_URL}/${DarkLogo}`
                : BASE_URL && logo
                  ? `${BASE_URL}/${logo}`
                  : '/images/Diploy_logo.png';
        }
    };

    const getTextColorClass = () => {
        if (isMobileDevice()) {
            return 'text-black';
        }
        return isScrolled ? 'text-white' : 'text-black';
    };

    if (isLoading) {
        return <Loader />;
    }

    if (loading) {
        return <Loader />;
    }

    const renderNotificationContent = () => {
        if (notifyLoading) {
            return <div className='py-6 text-center text-sm text-gray-500'>Loading...</div>;
        }

        if (notifyError) {
            return <div className='py-6 text-center text-sm text-red-500'>Failed to load notifications</div>;
        }

        if (notifications.length === 0) {
            return <div className='py-6 text-center text-sm text-gray-500'>No notifications yet</div>;
        }

        return (
            <div className='max-h-80 divide-y overflow-y-auto'>
                {notifications.map((note) => (
                    <div
                        key={note.id}
                        className={`px-2 py-3 text-sm ${
                            note.is_read === 0 ? 'border-l-4 border-l-blue-400 bg-blue-50' : ''
                        }`}>
                        <p className={`font-medium ${note.is_read === 0 ? 'text-blue-900' : 'text-gray-700'}`}>
                            {note.title}
                            {note.is_read === 0 && (
                                <span className='ml-2 inline-block h-2 w-2 rounded-full bg-blue-500'></span>
                            )}
                        </p>
                        <p className='text-gray-600'>{note.description}</p>
                        <span className='text-xs text-gray-400'>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={getNavbarClasses()} ref={navRef}>
            {/* Main Navbar - Responsive */}
            <div className='mx-auto max-w-7xl px-4 py-3 sm:py-4 xl:px-0'>
                <div className='flex items-center justify-between'>
                    {/* Left - Logo */}
                    <div className='flex-shrink-0'>
                        {logo || DarkLogo ? (
                            <Link href='/'>
                                <Image
                                    src={getLogo()}
                                    alt='Company Logo'
                                    height={60}
                                    width={140}
                                    priority
                                    className={`h-6 w-full transition-all duration-300 sm:h-8`}
                                />
                            </Link>
                        ) : (
                            ''
                        )}
                    </div>

                    {/* Center - Navigation Menu (Desktop Only) */}
                    <nav className='mx-4 hidden flex-1 items-center justify-center lg:flex xl:mx-8'>
                        <div className='flex items-center gap-6 md:gap-3 xl:gap-8'>
                            {navData?.secondNavbar.navlinks.map((item, i) => (
                                <div key={i} className='group relative'>
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className={`py-2 text-sm font-medium transition-colors duration-300 md:text-xs lg:text-sm ${getTextColorClass()}`}>
                                            {t(`${item.label}`)}
                                        </Link>
                                    ) : (
                                        <div>
                                            <button
                                                type='button'
                                                id={`menu-button-${i}`}
                                                onClick={() => toggleMenu(i)}
                                                onMouseEnter={() => handleMenuMouseEnter(i)}
                                                onKeyDown={(e) => handleKeyDown(e, () => toggleMenu(i))}
                                                className={`flex items-center py-2 text-sm font-medium transition-colors duration-300 ${getTextColorClass()}`}
                                                aria-expanded={activeMenu === i}
                                                aria-haspopup='true'>
                                                {t(`${item.label}`)}
                                                <svg
                                                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                                                        activeMenu === i ? 'rotate-180' : ''
                                                    }`}
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                    stroke='currentColor'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M19 9l-7 7-7-7'
                                                    />
                                                </svg>
                                            </button>
                                            {/* Mega Menu Dropdown */}
                                            {item.submenu && (
                                                <ul
                                                    className={`absolute top-full left-1/2 z-50 mt-2 w-64 -translate-x-1/2 transform rounded-lg border bg-white shadow-xl transition-all duration-300 ${
                                                        activeMenu === i
                                                            ? 'visible translate-y-0 opacity-100'
                                                            : 'invisible -translate-y-2 opacity-0'
                                                    }`}
                                                    onMouseLeave={handleMenuMouseLeave}
                                                    tabIndex={-1}
                                                    aria-labelledby={`menu-button-${i}`}>
                                                    <div className='p-4'>
                                                        <div className='grid gap-2'>
                                                            {item.submenu.map((link, li) => (
                                                                <li key={`${link.name}-${li}`}>
                                                                    <Link
                                                                        href={link.href}
                                                                        className='flex items-center rounded-lg px-4 py-3 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-50'>
                                                                        <span className='font-medium'>
                                                                            {' '}
                                                                            {t(`${link.name}`)}
                                                                        </span>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </nav>

                    {/* Right - Auth/Profile Menu + Language Selector (Desktop Only) */}
                    <div className='hidden flex-shrink-0 items-center gap-3 lg:flex xl:gap-4'>
                        {/* Language Selector */}
                        <div className='group relative'>
                            <LanguageSwitcher
                                colorLogic={
                                    getTextColorClass().includes('white')
                                        ? 'text-white hover:bg-white/10'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }
                            />
                        </div>
                        <button
                            onClick={() => router.push('/all-destinations')}
                            className={`group hidden transform items-center gap-3 rounded-full px-6 py-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:outline-none xl:inline-flex ${
                                isScrolled
                                    ? 'hover:bg-secondary border border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:text-white focus:ring-gray-500/30'
                                    : 'from-primary to-secondary hover:to-secondary focus:ring-primary bg-gradient-to-r text-white hover:from-purple-700'
                            }`}>
                            <span className='text-sm'>See packs</span>
                            <FaPlaneDeparture
                                className={`text-lg ${isScrolled ? 'text-gray-700 group-hover:text-white' : 'text-white'}`}
                            />
                        </button>

                        {/* Conditional Auth/Profile Menu */}
                        {isAuthenticated ? (
                            <div className='relative flex items-center gap-3 md:gap-0 xl:gap-3'>
                                {/* Notification Icon */}
                                <button
                                    type='button'
                                    onClick={handleNotificationClick}
                                    className={`relative rounded-lg p-2 transition-colors hover:bg-gray-50 ${
                                        getTextColorClass().includes('white')
                                            ? 'text-white hover:bg-white/10'
                                            : 'text-gray-700'
                                    }`}
                                    aria-label='Notifications'>
                                    <Bell className='h-5 w-5' />

                                    {unreadCount > 0 && (
                                        <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Profile Button */}
                                <div className='relative'>
                                    <button
                                        type='button'
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        onKeyDown={(e) => handleKeyDown(e, () => setShowProfileMenu(!showProfileMenu))}
                                        className={`flex items-center gap-3 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
                                            getTextColorClass().includes('white')
                                                ? 'border-white/30 text-white hover:bg-white/10'
                                                : 'border-gray-300 text-gray-700'
                                        }`}
                                        aria-expanded={showProfileMenu}
                                        aria-haspopup='true'
                                        aria-label='User profile menu'>
                                        {/* User Avatar */}
                                        {userData?.image ? (
                                            <img
                                                src={`${BASE_URL}/${userData.image}`}
                                                alt={userData.name || 'User'}
                                                className='h-8 w-8 rounded-full object-cover'
                                            />
                                        ) : (
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                                    getTextColorClass().includes('white')
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-gray-600 text-white'
                                                }`}>
                                                {getUserInitials(userData?.name || 'U')}
                                            </div>
                                        )}

                                        {/* <span className='hidden sm:inline'>{userData?.name}</span> */}

                                        <svg
                                            className={`h-3 w-3 transition-transform duration-200 ${
                                                showProfileMenu ? 'rotate-180' : ''
                                            }`}
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M19 9l-7 7-7-7'
                                            />
                                        </svg>
                                    </button>

                                    {/* Profile Dropdown Menu */}
                                    {showProfileMenu && (
                                        <div className='absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border bg-white shadow-xl'>
                                            {/* User Info Header */}
                                            <div className='border-b border-gray-100 px-4 py-4'>
                                                <div className='text-sm text-gray-500'>{userData.email}</div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className='py-2'>
                                                {profileMenuItems.map((item, index) =>
                                                    item.isSignOut ? (
                                                        <button
                                                            key={index}
                                                            onClick={handleSignOut}
                                                            className='flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50'>
                                                            {getIconSVG(item.icon)}
                                                            {item.label}
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            key={index}
                                                            href={item.href}
                                                            className='flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50'
                                                            onClick={() => setShowProfileMenu(false)}>
                                                            {getIconSVG(item.icon)}
                                                            {item.label}
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Sign In Button
                            <button
                                onClick={handleSignModal}
                                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
                                    getTextColorClass().includes('white')
                                        ? 'border-white/30 text-white hover:bg-white/10'
                                        : 'border-gray-300 text-gray-700'
                                }`}>
                                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                                    />
                                </svg>
                                {t('common.buttons.signIn')}
                            </button>
                        )}

                        {/* Notifications Modal */}
                        <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
                            <DialogContent className='sm:max-w-md'>
                                <DialogHeader>
                                    <DialogTitle>Notifications</DialogTitle>
                                </DialogHeader>

                                {renderNotificationContent()}
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Mobile Menu Button and Notification */}
                    <div className='flex items-center gap-2 lg:hidden'>
                        <button
                            type='button'
                            onClick={handleNotificationClick}
                            className={`relative rounded-lg p-2 transition-colors hover:bg-gray-50 ${
                                getTextColorClass().includes('white') ? 'text-white hover:bg-white/10' : 'text-white'
                            }`}
                            aria-label='Notifications'>
                            <Bell className='h-5 w-5' />
                            {unreadCount > 0 && (
                                <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            type='button'
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            onKeyDown={(e) => handleKeyDown(e, () => setIsMobileOpen(!isMobileOpen))}
                            className={`p-2 text-white transition-colors hover:text-gray-500`}
                            aria-label='Toggle mobile menu'
                            aria-expanded={isMobileOpen}>
                            <svg
                                className='h-5 w-5 sm:h-6 sm:w-6'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d={isMobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Menu - Always white background */}
            {isMobileOpen && (
                <div className='fixed inset-x-0 top-full z-40 border-t bg-white shadow-lg lg:hidden'>
                    <div className='max-h-[calc(100vh-120px)] space-y-4 overflow-y-auto px-4 py-4 sm:px-6'>
                        {/* Mobile Profile Section - When Logged In */}
                        {isAuthenticated && (
                            <div className='border-b border-gray-100 pb-4'>
                                <div className='mb-4 flex items-center gap-3'>
                                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 font-medium text-white'>
                                        {getUserInitials(userData.name || ' ')}
                                    </div>
                                    <div>
                                        <div className='font-medium text-gray-900'>{userData.name}</div>
                                        <div className='text-sm text-gray-500'>{userData.email}</div>
                                    </div>
                                </div>

                                {/* Mobile Profile Menu */}
                                <div className='space-y-1'>
                                    {profileMenuItems.map((item, index) =>
                                        item.isSignOut ? (
                                            <button
                                                key={`${index}-${item.icon}`}
                                                onClick={handleSignOut}
                                                className='flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50'>
                                                {getIconSVG(item.icon)}
                                                {item.label}
                                            </button>
                                        ) : (
                                            <Link
                                                key={`${index}-${item.icon}`}
                                                href={item.href}
                                                className='flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50'
                                                onClick={() => setIsMobileOpen(false)}>
                                                {getIconSVG(item.icon)}
                                                {item.label}
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Mobile Navigation */}
                        <div className='space-y-2'>
                            {navData?.secondNavbar.navlinks.map((item, i) => (
                                <div key={i}>
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className='block rounded-lg px-3 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50'
                                            onClick={() => setIsMobileOpen(false)}>
                                            {t(`${item.label}`)}
                                        </Link>
                                    ) : (
                                        <div>
                                            <button
                                                type='button'
                                                onClick={() => toggleMenu(i)}
                                                onKeyDown={(e) => handleKeyDown(e, () => toggleMenu(i))}
                                                className='flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50'
                                                aria-expanded={activeMenu === i}>
                                                {t(`${item.label}`)}
                                                <svg
                                                    className={`h-4 w-4 transition-transform duration-200 ${
                                                        activeMenu === i ? 'rotate-180' : ''
                                                    }`}
                                                    fill='none'
                                                    viewBox='0 0 24 24'
                                                    stroke='currentColor'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M19 9l-7 7-7-7'
                                                    />
                                                </svg>
                                            </button>
                                            {activeMenu === i && item.submenu && (
                                                <div className='mt-2 space-y-1 border-l-2 border-gray-100 pl-4'>
                                                    {item.submenu.map((link, li) => (
                                                        <Link
                                                            key={li}
                                                            href={link.href}
                                                            className='block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50'
                                                            onClick={() => setIsMobileOpen(false)}>
                                                            {t(`${link.name}`)}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mobile Language Selector */}
                        <MobileLanguageSelector setIsMobileOpen={setIsMobileOpen} />

                        {/* Mobile Sign In Button - When User is Not Logged In */}
                        {!isAuthenticated && (
                            <div className='border-t border-gray-100 pt-4'>
                                <button
                                    className='flex w-full items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700'
                                    onClick={handleSignModal}>
                                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                                        />
                                    </svg>
                                    Sign In
                                </button>
                            </div>
                        )}
                        <Button onClick={() => router.push('/all-destinations')} className='my-2'>
                            See Packes
                        </Button>
                    </div>
                </div>
            )}

            {/* Alerts and Modals */}
            {showAlert && (
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={2000} />
            )}

            {isSignInModalOpen && (
                <OtpSignup isOpen={isSignInModalOpen} setIsOpen={setIsSignInModalOpen} onSuccess={handleModalSuccess} />
            )}
        </div>
    );
};

export default Navbar;
