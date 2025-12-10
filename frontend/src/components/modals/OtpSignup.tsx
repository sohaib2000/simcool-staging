'use client';

import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useUserMutation } from '@/lib/apiHandler/useApiMutation';
import { usePublicApiMutation } from '@/lib/apiHandler/usePublicApiMutation';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { getFcmToken } from '@/lib/firebase/config';
import { saveCompleteUserAuth } from '@/lib/userAuth';
import { setUser } from '@/redux/slice/userSlice';
import { LoginResponsewithGoogleVeryFi, User } from '@/types/type';
import { zodResolver } from '@hookform/resolvers/zod';

import Alert from '../Alert';
import { ArrowLeft, Eye, EyeOff, Mail, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { z } from 'zod';

enum SignupStep {
    EMAIL = 'email',
    OTP = 'otp',
    SUCCESS = 'success'
}

// Zod Schemas for each step
const emailSchema = z.object({
    email: z.string().min(1, { message: 'Email is required' })
});

const otpSchema = z.object({
    otp: z
        .string()
        .min(1, { message: 'OTP is required' })
        .length(4, { message: 'OTP must be exactly 4 digits' })
        .regex(/^\d{4}$/, { message: 'OTP must contain only numbers' })
});

// TypeScript type inference from Zod schemas
type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

interface SignupProps {
    readonly isOpen: boolean;
    readonly setIsOpen: (open: boolean) => void;
    readonly onSuccess?: () => void;
}

interface ApiResponse {
    readonly message: string;
    readonly token: string;
}

const OtpSignup: React.FC<SignupProps> = ({ isOpen, setIsOpen, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState<SignupStep>(SignupStep.EMAIL);
    const [userEmail, setUserEmail] = useState<string>('');
    const [fcmToken, setFcmToken] = useState<string | null>('');
    // Separate loading states for different buttons
    const [isEmailSubmitting, setIsEmailSubmitting] = useState<boolean>(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);
    const [isOtpSubmitting, setIsOtpSubmitting] = useState<boolean>(false);

    const [otpTimer, setOtpTimer] = useState<number>(0);
    const [showOtpValues, setShowOtpValues] = useState<boolean>(false);
    const [isGoogleLogin, setIsGoogleLogin] = useState<boolean>(false);

    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    const router = useRouter();

    const dispatch = useDispatch();

    // Dialog ref for native HTML dialog element
    const dialogRef = useRef<HTMLDialogElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchFcmToken = async () => {
            try {
                const token = await getFcmToken();
                setFcmToken(token);
            } catch (error) {
                console.error('Error getting FCM token:', error);
            }
        };

        fetchFcmToken();
    }, []);

    // Email form setup
    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
        mode: 'onChange',
        defaultValues: { email: '' }
    });

    // OTP form setup
    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        mode: 'onChange',
        defaultValues: { otp: '' }
    });

    const { mutate: sendOtp } = usePublicApiMutation({
        url: '/loginWithOtp',
        method: 'POST'
    });

    const { mutate: verifyOtp } = useUserMutation({
        url: '/verifyEmailOtp',
        method: 'POST'
    });

    // Helper functions
    const resetAllForms = useCallback((): void => {
        setCurrentStep(SignupStep.EMAIL);
        setUserEmail('');
        setOtpTimer(0);
        setIsEmailSubmitting(false);
        setIsGoogleSubmitting(false);
        setIsOtpSubmitting(false);
        setIsGoogleLogin(false);
        emailForm.reset();
        otpForm.reset();
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, [emailForm, otpForm]);

    const closeModal = useCallback((): void => {
        setIsOpen(false);
    }, [setIsOpen]);

    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    const startOtpTimer = useCallback((): void => {
        setOtpTimer(60);
    }, []);

    // Timer effect for OTP resend
    useEffect(() => {
        if (otpTimer > 0) {
            timerRef.current = setTimeout(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [otpTimer]);

    // Dialog management with proper scroll handling
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            const originalBodyOverflow = document.body.style.overflow;
            const originalBodyHeight = document.body.style.height;

            dialog.showModal();
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';

            return () => {
                document.body.style.overflow = originalBodyOverflow;
                document.body.style.height = originalBodyHeight;
            };
        } else {
            dialog.close();
            resetAllForms();
        }
    }, [isOpen, resetAllForms]);

    // Handle dialog close events
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleClose = () => {
            setIsOpen(false);
        };

        const handleCancel = (e: Event) => {
            e.preventDefault();
            setIsOpen(false);
        };

        dialog.addEventListener('close', handleClose);
        dialog.addEventListener('cancel', handleCancel);

        return () => {
            dialog.removeEventListener('close', handleClose);
            dialog.removeEventListener('cancel', handleCancel);
        };
    }, [setIsOpen]);

    // Step 1: Email submission
    const onEmailSubmit = useCallback(
        async (values: EmailFormData): Promise<void> => {
            setIsEmailSubmitting(true);
            try {
                sendOtp(
                    { email: values.email },
                    {
                        onSuccess: (data: unknown) => {
                            const response = data as ApiResponse;
                            setUserEmail(values.email);
                            setCurrentStep(SignupStep.OTP);
                            startOtpTimer();
                            showAlertMessage(response.message, 'success');
                        },
                        onError: (error: unknown) => {
                            const response = error as ApiResponse;
                            showAlertMessage(response.message, 'error');
                        }
                    }
                );
            } catch (error) {
                console.error('Email submission error:', error);
                showAlertMessage('Failed to send OTP. Please try again.', 'error');
            } finally {
                setIsEmailSubmitting(false);
            }
        },
        [sendOtp, startOtpTimer, showAlertMessage]
    );

    // Step 2: OTP verification
    const onOtpSubmit = useCallback(
        async (values: OtpFormData): Promise<void> => {
            setIsOtpSubmitting(true);

            try {
                const requestBody = isGoogleLogin
                    ? { email: userEmail, fcmToken: fcmToken }
                    : { email: userEmail, otp: values.otp, fcmToken: fcmToken };
                verifyOtp(requestBody, {
                    onSuccess: (response: unknown) => {
                        const apiResponse = response as LoginResponsewithGoogleVeryFi;
                        const dispatchUser = {
                            token: apiResponse.data.token,
                            user: {
                                id: apiResponse.data.user.id,
                                name: apiResponse.data.user.name,
                                email: apiResponse.data.user.email,
                                image: apiResponse.data.user.image || null,
                                currencyId: apiResponse.data.user.currencyId || null
                            }
                        };
                        dispatch(setUser(dispatchUser));
                        saveCompleteUserAuth(apiResponse.data.token, {
                            id: apiResponse.data.user.id,
                            name: apiResponse.data.user.name,
                            email: apiResponse.data.user.email
                        });
                        setCurrentStep(SignupStep.SUCCESS);
                        showAlertMessage(`${apiResponse.message}`, 'success');
                        router.push('/profile');

                        if (onSuccess) {
                            onSuccess();
                        }
                        closeModal();
                    },
                    onError: (error: unknown) => {
                        const response = error as ApiResponse;
                        showAlertMessage(response.message, 'error');
                    }
                });
            } catch (error) {
                console.error('OTP verification error:', error);
                showAlertMessage('Verification failed. Please try again.', 'error');
            } finally {
                setIsOtpSubmitting(false);
            }
        },
        [isGoogleLogin, userEmail, verifyOtp, showAlertMessage, closeModal, onSuccess]
    );

    // Resend OTP
    const handleResendOtp = useCallback((): void => {
        if (otpTimer > 0 || isGoogleLogin) return;

        setIsEmailSubmitting(true);
        sendOtp(
            { email: userEmail },
            {
                onSuccess: () => {
                    startOtpTimer();
                    showAlertMessage('OTP resent successfully!', 'success');
                    setIsEmailSubmitting(false);
                },
                onError: (error: unknown) => {
                    const response = error as { response?: { data?: { message?: string } } };
                    const errorMessage = response?.response?.data?.message || 'Failed to resend OTP. Please try again.';
                    showAlertMessage(errorMessage, 'error');
                    setIsEmailSubmitting(false);
                }
            }
        );
    }, [otpTimer, isGoogleLogin, sendOtp, userEmail, startOtpTimer, showAlertMessage]);

    // Google signup function
    const handleGoogleSignup = useCallback(async (): Promise<void> => {
        setIsGoogleSubmitting(true);

        try {
            const email = await signInWithGoogle();

            if (email) {
                setUserEmail(email);
                setIsGoogleLogin(true);

                showAlertMessage('Google login successful! Processing...', 'success');

                await new Promise((resolve) => {
                    setTimeout(resolve, 1000);
                });

                verifyOtp(
                    { email, is_firebase_login: true, fcmToken: fcmToken },
                    {
                        onSuccess: (response: unknown) => {
                            const apiResponse = response as LoginResponsewithGoogleVeryFi;
                            const dispatchUser = {
                                token: apiResponse.data.token,
                                user: {
                                    id: apiResponse.data.user.id,
                                    name: apiResponse.data.user.name || '',
                                    email: apiResponse.data.user.email,
                                    image: apiResponse.data.user.image || null,
                                    currencyId: apiResponse.data.user.currencyId || null
                                }
                            };
                            dispatch(setUser(dispatchUser));
                            saveCompleteUserAuth(apiResponse.data.token, {
                                id: apiResponse?.data?.user?.id,
                                email: apiResponse?.data?.user?.email
                            });
                            setCurrentStep(SignupStep.SUCCESS);
                            router.push('/profile');
                            showAlertMessage(`${apiResponse.message}`, 'success');

                            closeModal();
                            if (onSuccess) {
                                onSuccess();
                            }
                        },
                        onError: (error: unknown) => {
                            const response = error as ApiResponse;
                            showAlertMessage(`Verification failed: ${response.message}`, 'error');
                        }
                    }
                );
            } else {
                showAlertMessage('Unable to get email from Google account', 'error');
            }
        } catch (error: unknown) {
            const firebaseError = error as { code?: string };
            console.error('Google signup error:', error);

            if (firebaseError?.code === 'auth/popup-closed-by-user') {
                showAlertMessage('Sign-in cancelled by user', 'warning');
            } else if (firebaseError?.code === 'auth/popup-blocked') {
                showAlertMessage('Popup blocked. Please allow popups and try again.', 'error');
            } else if (firebaseError?.code === 'auth/cancelled-popup-request') {
                showAlertMessage('Multiple popup requests detected', 'warning');
            } else {
                showAlertMessage('Google signup failed. Please try again.', 'error');
            }
        } finally {
            setIsGoogleSubmitting(false);
        }
    }, [verifyOtp, showAlertMessage, closeModal, onSuccess]);

    // Handle dialog click outside
    const handleDialogClick = useCallback(
        (e: React.MouseEvent<HTMLDialogElement>): void => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        },
        [closeModal]
    );

    // Handle back button
    const handleBack = useCallback((): void => {
        if (currentStep === SignupStep.OTP) {
            setCurrentStep(SignupStep.EMAIL);
            setIsGoogleLogin(false);
            otpForm.reset();
        }
    }, [currentStep, otpForm]);

    // Toggle OTP visibility
    const toggleOtpVisibility = useCallback((): void => {
        setShowOtpValues((prev) => !prev);
    }, []);

    // Loading spinner component
    const LoadingSpinner: React.FC = () => (
        <svg
            className='mr-3 -ml-1 h-4 w-4 animate-spin text-white'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            aria-hidden='true'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
        </svg>
    );

    // Google icon component
    const GoogleIcon: React.FC = () => (
        <svg className='mr-3 h-5 w-5' viewBox='0 0 24 24' aria-hidden='true'>
            <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            />
            <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
        </svg>
    );

    // Render step content
    const renderStepContent = useCallback(() => {
        switch (currentStep) {
            case SignupStep.EMAIL:
                return (
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className='space-y-4' noValidate>
                        <div className='space-y-2'>
                            <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                                Email Address *
                            </label>
                            <div className='relative'>
                                <Mail className='pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
                                <input
                                    type='email'
                                    id='email'
                                    {...emailForm.register('email')}
                                    className={`w-full rounded-lg border bg-white py-3 pr-4 pl-11 text-sm text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                                        emailForm.formState.errors.email
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder='Enter your email address'
                                    aria-describedby={emailForm.formState.errors.email ? 'email-error' : undefined}
                                    aria-invalid={!!emailForm.formState.errors.email}
                                    autoComplete='on'
                                />
                            </div>
                            {emailForm.formState.errors.email && (
                                <p id='email-error' className='text-sm text-red-600' role='alert'>
                                    {emailForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <button
                            type='submit'
                            disabled={isEmailSubmitting || !emailForm.formState.isValid}
                            className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isEmailSubmitting || !emailForm.formState.isValid
                                    ? 'cursor-not-allowed bg-blue-400 opacity-50'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                            aria-label='Send OTP to email'>
                            {isEmailSubmitting ? (
                                <div className='flex items-center justify-center'>
                                    <LoadingSpinner />
                                    Sending OTP...
                                </div>
                            ) : (
                                'Send OTP'
                            )}
                        </button>
                    </form>
                );

            case SignupStep.OTP:
                return (
                    <div className='space-y-4'>
                        <div className='mb-4 text-center'>
                            <p className='text-sm text-gray-600'>
                                {isGoogleLogin
                                    ? 'Verifying your Google account...'
                                    : "We've sent a verification code to"}
                            </p>
                            <p className='text-sm font-medium text-gray-900'>{userEmail}</p>
                        </div>

                        {!isGoogleLogin && (
                            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className='space-y-4' noValidate>
                                <div className='space-y-2'>
                                    <label htmlFor='otp' className='text-sm font-medium text-gray-700'>
                                        Enter OTP *
                                    </label>
                                    <div className='relative'>
                                        <input
                                            type={showOtpValues ? 'text' : 'password'}
                                            id='otp'
                                            {...otpForm.register('otp')}
                                            className={`w-full rounded-lg border bg-white px-4 py-3 text-center font-mono text-lg tracking-widest text-gray-900 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                                                otpForm.formState.errors.otp
                                                    ? 'border-red-300 focus:ring-red-500'
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder='0000'
                                            maxLength={4}
                                            aria-describedby={otpForm.formState.errors.otp ? 'otp-error' : undefined}
                                            aria-invalid={!!otpForm.formState.errors.otp}
                                            autoComplete='off'
                                        />
                                        <button
                                            type='button'
                                            onClick={toggleOtpVisibility}
                                            className='absolute top-1/2 right-3 -translate-y-1/2 transform rounded-md p-1 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                            aria-label={showOtpValues ? 'Hide OTP' : 'Show OTP'}>
                                            {showOtpValues ? (
                                                <EyeOff className='h-5 w-5' />
                                            ) : (
                                                <Eye className='h-5 w-5' />
                                            )}
                                        </button>
                                    </div>
                                    {otpForm.formState.errors.otp && (
                                        <p id='otp-error' className='text-sm text-red-600' role='alert'>
                                            {otpForm.formState.errors.otp.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type='submit'
                                    disabled={isOtpSubmitting || !otpForm.formState.isValid}
                                    className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        isOtpSubmitting || !otpForm.formState.isValid
                                            ? 'cursor-not-allowed bg-blue-400 opacity-50'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                                    aria-label='Verify OTP and create account'>
                                    {isOtpSubmitting ? (
                                        <div className='flex items-center justify-center'>
                                            <LoadingSpinner />
                                            Verifying...
                                        </div>
                                    ) : (
                                        'Verify & Create Account'
                                    )}
                                </button>

                                <div className='text-center'>
                                    <button
                                        type='button'
                                        onClick={handleResendOtp}
                                        disabled={otpTimer > 0 || isEmailSubmitting}
                                        className={`text-sm transition-colors focus:underline focus:outline-none ${
                                            otpTimer > 0 || isEmailSubmitting
                                                ? 'cursor-not-allowed text-gray-400'
                                                : 'text-blue-600 hover:text-blue-800'
                                        }`}
                                        aria-label='Resend OTP code'>
                                        {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {isGoogleLogin && (
                            <div className='text-center'>
                                <div className='flex items-center justify-center'>
                                    <LoadingSpinner />
                                    <span className='text-sm text-gray-600'>Processing Google login...</span>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case SignupStep.SUCCESS:
                return (
                    <div className='space-y-4 text-center'>
                        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                            <svg
                                className='h-8 w-8 text-green-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                aria-hidden='true'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900'>
                            {isGoogleLogin ? 'Google Login Successful!' : 'Account Created Successfully!'}
                        </h3>
                        <p className='text-sm text-gray-600'>Redirecting to your profile...</p>
                    </div>
                );

            default:
                return <div>Unknown step</div>;
        }
    }, [
        currentStep,
        emailForm,
        onEmailSubmit,
        isEmailSubmitting,
        otpForm,
        onOtpSubmit,
        isOtpSubmitting,
        showOtpValues,
        toggleOtpVisibility,
        userEmail,
        isGoogleLogin,
        otpTimer,
        handleResendOtp
    ]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDialogElement>) => {
            if (e.key === 'Enter') {
                handleDialogClick(e as unknown as React.MouseEvent<HTMLDialogElement>);
            }
        },
        [handleDialogClick]
    );

    const getStepTitle = useCallback(() => {
        switch (currentStep) {
            case SignupStep.EMAIL:
                return 'Create Account';
            case SignupStep.OTP:
                return isGoogleLogin ? 'Google Login' : 'Verify Email';
            case SignupStep.SUCCESS:
                return 'Welcome!';
            default:
                return 'Create Account';
        }
    }, [currentStep, isGoogleLogin]);

    return (
        <dialog
            ref={dialogRef}
            className='h-full max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-black/50'
            aria-labelledby='signup-title'
            onClick={handleDialogClick}
            onKeyDown={handleKeyDown}>
            <div className='h-full w-full overflow-y-auto overscroll-contain'>
                <div className='flex min-h-full items-start justify-center p-4 py-6 sm:items-center sm:py-4'>
                    <div className='my-auto w-full max-w-md rounded-lg border border-slate-300 bg-white text-gray-800 shadow-lg'>
                        {/* Header */}
                        <div className='sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b border-slate-300 bg-white p-4'>
                            {currentStep === SignupStep.OTP && (
                                <button
                                    type='button'
                                    onClick={handleBack}
                                    className='rounded-md p-1 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                    aria-label='Go back to email step'>
                                    <ArrowLeft size={20} />
                                </button>
                            )}

                            <h2
                                id='signup-title'
                                className={`text-lg font-bold sm:text-xl ${
                                    currentStep === SignupStep.OTP ? 'ml-8' : 'mx-auto'
                                }`}>
                                {getStepTitle()}
                            </h2>

                            <button
                                type='button'
                                onClick={closeModal}
                                className='rounded-md p-1 text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                aria-label='Close modal'>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className='p-6'>
                            {renderStepContent()}

                            {/* Google Signup Button - Only show on email step */}
                            {currentStep === SignupStep.EMAIL && (
                                <>
                                    <div className='relative my-6'>
                                        <div className='absolute inset-0 flex items-center'>
                                            <div className='w-full border-t border-gray-300' />
                                        </div>
                                        <div className='relative flex justify-center text-sm'>
                                            <span className='bg-white px-2 text-gray-500'>Or continue with</span>
                                        </div>
                                    </div>

                                    <button
                                        type='button'
                                        onClick={handleGoogleSignup}
                                        disabled={isGoogleSubmitting}
                                        className='flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                                        aria-label='Sign up with Google'>
                                        {isGoogleSubmitting ? (
                                            <div className='flex items-center justify-center'>
                                                <LoadingSpinner />
                                                Signing in...
                                            </div>
                                        ) : (
                                            <>
                                                <GoogleIcon />
                                                Continue with Google
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showAlert && (
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={4000} />
            )}
        </dialog>
    );
};

export default OtpSignup;
