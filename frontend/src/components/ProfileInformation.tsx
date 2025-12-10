'use client';

import React, { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BASE_URL } from '@/config/constant';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUserMutation } from '@/lib/apiHandler/useApiMutation';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { getUserTokenClient, saveUserData } from '@/lib/userAuth';
import { setUser } from '@/redux/slice/userSlice';
import { RootState } from '@/redux/store/store';
import { CurrencyResponceType, ProfileInfo, ProfileUpdateRes } from '@/types/type';

import Alert from './Alert';
import { Camera, CheckCircle, Clock, FileText, Globe, Mail, MapPin, User, XCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

interface ProfileInformationProps {
    userData?: ProfileInfo;
    kycStatus: 'Not applied' | 'pending' | 'approved' | 'rejected';
}

interface Country {
    id: number;
    region_id: number;
    name: string;
    slug: string;
    country_code: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    start_price: number;
}

interface ApiResponse {
    success: boolean;
    data: Country[];
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({ userData, kycStatus }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const userReduxData = useSelector((state: RootState) => state.user.user);

    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
        userReduxData?.image ? `${BASE_URL}/${userReduxData.image}` : null
    );

    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [name, setName] = useState(userReduxData?.name || '');
    const [selectedCurrency, setSelectedCurrency] = useState(userReduxData?.currencyId || '');
    const [selectedCountry, setSelectedCountry] = useState(userData?.country || 'India');

    const userToken = useSelector((state: RootState) => state.user.userToken);

    const apiHandler = userToken ? useProtectedApiHandler : usePublicApiHandler;

    const { data: countryApiData } = apiHandler<ApiResponse | null>({
        url: '/country'
    });

    const countryList = countryApiData?.data || [];


    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    // Fetch currency list
    const { data: currencyRes } = useProtectedApiHandler<CurrencyResponceType>({
        url: '/currency'
    });
    const currencyData = currencyRes?.data || [];

    // Update mutation
    const { mutate: handleProfileUpdate, isPending } = useUserMutation({
        url: '/profile',
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Upload image preview
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // File validation
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                showAlertMessage(t('profile.pages.accountInfo.profileInfo.messages.imageTooLarge'), 'error');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showAlertMessage(t('profile.pages.accountInfo.profileInfo.messages.invalidImageFormat'), 'error');
                return;
            }

            setProfileImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setProfileImagePreview(previewUrl);
        }
    };

    const getKycStatusBadge = () => {
        const statusConfig = {
            approved: {
                className: 'bg-green-100 text-green-700',
                icon: CheckCircle,
                text: t('profile.pages.accountInfo.profileInfo.kyc.status.approved')
            },
            rejected: {
                className: 'bg-red-100 text-red-700',
                icon: XCircle,
                text: t('profile.pages.accountInfo.profileInfo.kyc.status.rejected')
            },
            pending: {
                className: 'bg-yellow-100 text-yellow-700',
                icon: Clock,
                text: t('profile.pages.accountInfo.profileInfo.kyc.status.pending')
            },
            'Not applied': {
                className: 'bg-gray-100 text-gray-700',
                icon: Clock,
                text: t('profile.pages.accountInfo.profileInfo.kyc.status.notApplied')
            }
        };

        const status = userReduxData?.kyc_status || 'Not applied';
        const config = statusConfig[status as keyof typeof statusConfig];

        if (!config) return null;

        const IconComponent = config.icon;

        return (
            <Badge className={config.className}>
                <IconComponent className='mr-1 h-3 w-3' />
                {config.text}
            </Badge>
        );
    };

    const onUpdateProfile = () => {
        // Validation
        if (!name.trim()) {
            showAlertMessage(t('profile.pages.accountInfo.profileInfo.messages.nameRequired'), 'warning');
            return;
        }

        if (!selectedCurrency) {
            showAlertMessage(t('profile.pages.accountInfo.profileInfo.messages.currencyRequired'), 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('currencyId', String(selectedCurrency));
        formData.append('country', selectedCountry);
        if (profileImageFile) {
            formData.append('image', profileImageFile);
        }

        handleProfileUpdate(formData, {
            onSuccess: (data: unknown) => {
                const resAPI = data as ProfileUpdateRes;
                saveUserData({
                    id: resAPI?.data.id,
                    name: resAPI?.data.name,
                    email: resAPI?.data.email,
                    image: resAPI?.data.image
                });

                dispatch(
                    setUser({
                        token: getUserTokenClient() || null,
                        user: {
                            id: resAPI.data.id,
                            name: resAPI.data.name,
                            email: resAPI.data.email,
                            image: resAPI.data.image || null,
                            currencyId: resAPI.data.currencyId ? Number(resAPI.data.currencyId) : null,
                            currency: resAPI.data.currency
                        }
                    })
                );

                showAlertMessage(
                    resAPI.message || t('profile.pages.accountInfo.profileInfo.messages.updateSuccess'),
                    'success'
                );
                setProfileImageFile(null);
            },
            onError: (error: unknown) => {
                const apiRes = error as ProfileUpdateRes;
                showAlertMessage(
                    apiRes.message || t('profile.pages.accountInfo.profileInfo.messages.updateError'),
                    'error'
                );
            }
        });
    };

    // Format member since date
    const getMemberSinceText = () => {
        if (userData?.created_at) {
            const date = new Date(userData.created_at).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            return t('profile.pages.accountInfo.profileInfo.profile.memberSince', { date });
        }
        return t('profile.pages.accountInfo.profileInfo.profile.memberSinceDefault');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    {t('profile.pages.accountInfo.profileInfo.title')}
                </CardTitle>
            </CardHeader>

            <CardContent className='space-y-6'>
                {/* Profile Picture */}
                <div className='flex items-center gap-6'>
                    <div className='relative'>
                        <div className='h-24 w-24 overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100'>
                            {profileImagePreview ? (
                                <img
                                    src={profileImagePreview}
                                    alt={t('profile.pages.accountInfo.profileInfo.profile.imageAlt')}
                                    className='h-full w-full object-cover'
                                />
                            ) : (
                                <div className='flex h-full w-full items-center justify-center'>
                                    <User className='h-10 w-10 text-gray-400' />
                                </div>
                            )}
                        </div>
                        <label
                            htmlFor='profile-upload'
                            className='absolute -right-2 -bottom-2 cursor-pointer rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700'
                            title={t('profile.pages.accountInfo.profileInfo.profile.changePhoto')}>
                            <Camera className='h-4 w-4' />
                        </label>
                        <input
                            id='profile-upload'
                            type='file'
                            accept='image/jpeg,image/jpg,image/png,image/webp'
                            className='hidden'
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div>
                        <h3 className='text-lg font-semibold text-gray-900'>
                            {userReduxData?.name || t('profile.pages.accountInfo.profileInfo.profile.defaultName')}
                        </h3>
                        <p className='text-sm text-gray-600'>{getMemberSinceText()}</p>
                        {profileImageFile && (
                            <p className='mt-1 text-xs text-blue-600'>
                                {t('profile.pages.accountInfo.profileInfo.profile.imageSelected')}
                            </p>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Editable Info */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label htmlFor='fullName'>{t('profile.pages.accountInfo.profileInfo.form.fullName')}</Label>
                        <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-gray-400' />
                            <Input
                                id='fullName'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('profile.pages.accountInfo.profileInfo.form.namePlaceholder')}
                                maxLength={50}
                            />
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='emailAddress'>{t('profile.pages.accountInfo.profileInfo.form.email')}</Label>
                        <div className='flex items-center gap-2'>
                            <Mail className='h-4 w-4 text-gray-400' />
                            <Input id='emailAddress' defaultValue={userData?.email || ''} disabled className='flex-1' />
                            <Badge className='bg-green-100 text-green-700'>
                                {t('profile.pages.accountInfo.profileInfo.form.verified')}
                            </Badge>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='country'>{t('profile.pages.accountInfo.profileInfo.form.country')}</Label>
                        <div className='flex items-center gap-2'>
                            <MapPin className='h-4 w-4 text-gray-400' />
                            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                <SelectTrigger className='w-full' id='country'>
                                    <SelectValue
                                        placeholder={t('profile.pages.accountInfo.profileInfo.form.selectCountry')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {countryList.map((country) => (
                                        <SelectItem key={country.id} value={country.name}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='currency'>{t('profile.pages.accountInfo.profileInfo.form.currency')}</Label>
                        <div className='flex items-center gap-2'>
                            <Globe className='h-4 w-4 text-gray-400' />
                            <Select value={String(selectedCurrency)} onValueChange={setSelectedCurrency}>
                                <SelectTrigger className='w-full' id='currency'>
                                    <SelectValue
                                        placeholder={t('profile.pages.accountInfo.profileInfo.form.selectCurrency')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencyData?.map((currency) => (
                                        <SelectItem key={currency.id} value={currency.id.toString()}>
                                            {currency.symbol} - {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* KYC Status */}
                <div className='space-y-2'>
                    <span>{t('profile.pages.accountInfo.profileInfo.kyc.title')}</span>
                    <div className='flex items-center justify-between rounded-lg border border-gray-200 p-4'>
                        <div className='flex items-center gap-3'>
                            <FileText className='h-5 w-5 text-gray-400' />
                            <div>
                                <div className='font-medium text-gray-900'>
                                    {t('profile.pages.accountInfo.profileInfo.kyc.label')}
                                </div>
                                <div className='text-sm text-gray-500'>
                                    {t('profile.pages.accountInfo.profileInfo.kyc.description')}
                                </div>
                            </div>
                        </div>
                        {getKycStatusBadge()}
                    </div>
                </div>

                <div className='flex justify-end'>
                    <Button className='flex items-center gap-2' onClick={onUpdateProfile} disabled={isPending}>
                        <User className='h-4 w-4' />
                        {isPending
                            ? t('profile.pages.accountInfo.profileInfo.form.updating')
                            : t('profile.pages.accountInfo.profileInfo.form.updateButton')}
                    </Button>
                </div>
            </CardContent>

            {showAlert && (
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={4000} />
            )}
        </Card>
    );
};

export default ProfileInformation;
