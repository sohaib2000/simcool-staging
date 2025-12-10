'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUserMutation } from '@/lib/apiHandler/useApiMutation';

// Add translation hook

import { FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface KYCVerificationProps {
    kycStatus: 'Not applied' | 'pending' | 'approved' | 'rejected';
}

interface KYCFormValues {
    full_name: string;
    dob: string;
    identity_card_no: string;
    address: string;
    identity_card: FileList;
    pancard: FileList;
    photo: FileList;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({ kycStatus }) => {
    const { t } = useTranslation(); // Translation hook
    const [open, setOpen] = useState(false);

    // Update mutation
    const { mutate: handleUpdateKYC, isPending } = useUserMutation({
        url: '/kyc',
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<KYCFormValues>();

    // Only show if KYC is not verified
    if (kycStatus === 'approved' || kycStatus === 'pending') {
        return null;
    }

    const onSubmit = (data: KYCFormValues) => {
        const formData = new FormData();
        formData.append('full_name', data.full_name);
        formData.append('dob', data.dob);
        formData.append('identity_card_no', data.identity_card_no); // Fix: was data.dob
        formData.append('address', data.address);

        if (data.identity_card?.[0]) formData.append('identity_card', data.identity_card[0]);
        if (data.pancard?.[0]) formData.append('pancard', data.pancard[0]);
        if (data.photo?.[0]) formData.append('photo', data.photo[0]);

        handleUpdateKYC(formData, {
            onSuccess: () => {
                setOpen(false);
                reset();
                window.location.reload();
            },
            onError: () => {
                // Handle error if needed
            }
        });
    };

    return (
        <>
            <Card className='my-4 border-blue-200 bg-blue-50'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-blue-700'>
                        <FileText className='h-5 w-5' />
                        {t('profile.pages.accountInfo.kycVerification.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='rounded-lg border border-blue-200 bg-white p-6'>
                        <div className='flex items-start gap-4'>
                            <div className='rounded-full bg-blue-100 p-3'>
                                <FileText className='h-6 w-6 text-blue-600' />
                            </div>
                            <div className='flex-1'>
                                <h3 className='mb-2 text-lg font-semibold text-blue-900'>
                                    {t('profile.pages.accountInfo.kycVerification.card.title')}
                                </h3>
                                <p className='mb-4 text-blue-700'>
                                    {t('profile.pages.accountInfo.kycVerification.card.description')}
                                </p>

                                <div className='mb-4 space-y-3'>
                                    <h4 className='font-medium text-blue-900'>
                                        {t('profile.pages.accountInfo.kycVerification.documents.title')}
                                    </h4>
                                    <ul className='list-inside list-disc space-y-1 text-sm text-blue-800'>
                                        <li>{t('profile.pages.accountInfo.kycVerification.documents.photoId')}</li>
                                        <li>{t('profile.pages.accountInfo.kycVerification.documents.proofAddress')}</li>
                                        <li>{t('profile.pages.accountInfo.kycVerification.documents.recentPhoto')}</li>
                                    </ul>
                                </div>

                                <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4'>
                                    <h4 className='mb-2 font-medium text-blue-900'>
                                        {t('profile.pages.accountInfo.kycVerification.benefits.title')}
                                    </h4>
                                    <ul className='list-inside list-disc space-y-1 text-sm text-blue-800'>
                                        <li>{t('profile.pages.accountInfo.kycVerification.benefits.higherLimits')}</li>
                                        <li>{t('profile.pages.accountInfo.kycVerification.benefits.premiumPlans')}</li>
                                        <li>
                                            {t('profile.pages.accountInfo.kycVerification.benefits.prioritySupport')}
                                        </li>
                                        <li>
                                            {t('profile.pages.accountInfo.kycVerification.benefits.enhancedSecurity')}
                                        </li>
                                    </ul>
                                </div>

                                <div className='flex gap-3'>
                                    <Button className='bg-blue-600 hover:bg-blue-700' onClick={() => setOpen(true)}>
                                        <FileText className='mr-2 h-4 w-4' />
                                        {t('profile.pages.accountInfo.kycVerification.startProcess')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KYC Form Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='max-h-[80vh] max-w-lg overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>{t('profile.pages.accountInfo.kycVerification.modal.title')}</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <div>
                            <Label htmlFor='full_name' className='mb-2 block'>
                                {t('profile.pages.accountInfo.kycVerification.form.fullName')}{' '}
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                {...register('full_name', {
                                    required: t(
                                        'profile.pages.accountInfo.kycVerification.form.validation.fullNameRequired'
                                    )
                                })}
                                name='full_name'
                                id='full_name'
                                placeholder={t('profile.pages.accountInfo.kycVerification.form.placeholders.fullName')}
                            />
                            {errors.full_name && (
                                <p className='mt-1 text-sm text-red-500'>{errors.full_name.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor='date' className='mb-2 block'>
                                {t('profile.pages.accountInfo.kycVerification.form.dob')}{' '}
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                type='date'
                                {...register('dob', {
                                    required: t('profile.pages.accountInfo.kycVerification.form.validation.dobRequired')
                                })}
                                name='date'
                                id='date'
                            />
                            {errors.dob && <p className='mt-1 text-sm text-red-500'>{errors.dob.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor='address' className='mb-2 block'>
                                {t('profile.pages.accountInfo.kycVerification.form.address')}{' '}
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                autoComplete='on'
                                {...register('address', {
                                    required: t(
                                        'profile.pages.accountInfo.kycVerification.form.validation.addressRequired'
                                    )
                                })}
                                name='address'
                                id='address'
                                placeholder={t('profile.pages.accountInfo.kycVerification.form.placeholders.address')}
                            />
                            {errors.address && <p className='mt-1 text-sm text-red-500'>{errors.address.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor='identity_cardNumber' className='mb-2 block'>
                                {t('profile.pages.accountInfo.kycVerification.form.identityCardNo')}{' '}
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                {...register('identity_card_no', {
                                    required: t(
                                        'profile.pages.accountInfo.kycVerification.form.validation.identityCardNoRequired'
                                    )
                                })}
                                name='identity_cardNumber'
                                id='identity_cardNumber'
                                placeholder={t(
                                    'profile.pages.accountInfo.kycVerification.form.placeholders.identityCardNo'
                                )}
                            />
                            {errors.identity_card_no && (
                                <p className='mt-1 text-sm text-red-500'>{errors.identity_card_no.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor='identity_card' className='mb-2 block'>
                                {t('profile.pages.accountInfo.kycVerification.form.identityCard')}{' '}
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                type='file'
                                accept='image/*,application/pdf'
                                {...register('identity_card', {
                                    required: t(
                                        'profile.pages.accountInfo.kycVerification.form.validation.identityCardRequired'
                                    )
                                })}
                                name='identity_card'
                                id='identity_card'
                            />
                            <p className='mt-1 text-xs text-gray-500'>
                                {t('profile.pages.accountInfo.kycVerification.form.fileFormats')}
                            </p>
                            {errors.identity_card && (
                                <p className='mt-1 text-sm text-red-500'>{errors.identity_card.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor='pancard' className='mb-2 block'>
                                {t('profile.pages.accountInfo.kycVerification.form.panCard')}{' '}
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                type='file'
                                accept='image/*,application/pdf'
                                {...register('pancard', {
                                    required: t(
                                        'profile.pages.accountInfo.kycVerification.form.validation.panCardRequired'
                                    )
                                })}
                                id='pancard'
                                name='pancard'
                            />
                            <p className='mt-1 text-xs text-gray-500'>
                                {t('profile.pages.accountInfo.kycVerification.form.fileFormats')}
                            </p>
                            {errors.pancard && <p className='mt-1 text-sm text-red-500'>{errors.pancard.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor='photo' className='mb-2 block'>
                                {t('profile.pages.accountInfo.kycVerification.form.recentPhoto')}{' '}
                                <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                type='file'
                                accept='image/*'
                                {...register('photo', {
                                    required: t(
                                        'profile.pages.accountInfo.kycVerification.form.validation.photoRequired'
                                    )
                                })}
                                name='photo'
                                id='photo'
                            />
                            <p className='mt-1 text-xs text-gray-500'>
                                {t('profile.pages.accountInfo.kycVerification.form.imageFormats')}
                            </p>
                            {errors.photo && <p className='mt-1 text-sm text-red-500'>{errors.photo.message}</p>}
                        </div>

                        <DialogFooter>
                            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                                {t('profile.pages.accountInfo.kycVerification.form.cancel')}
                            </Button>
                            <Button type='submit' disabled={isPending}>
                                {isPending
                                    ? t('profile.pages.accountInfo.kycVerification.form.submitting')
                                    : t('profile.pages.accountInfo.kycVerification.form.submit')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default KYCVerification;
