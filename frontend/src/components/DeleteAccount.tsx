'use client';

import React, { useCallback, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUserMutation } from '@/lib/apiHandler/useApiMutation';
// Add translation hook
import { getUserDataClient, removeUserToken } from '@/lib/userAuth';

import Alert from './Alert';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteAccountProps {
    isLoading?: boolean;
}

interface DeleteApiRes {
    status: boolean;
    message: string;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ isLoading = false }) => {
    const { t } = useTranslation(); // Translation hook
    const [confirmInputText, setConfirmInputText] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const router = useRouter();
    const getUserData = getUserDataClient();

    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    const { mutate: handleDelAccount } = useUserMutation({
        url: '/deleteAccount',
        method: 'GET'
    });

    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    // Required text for confirmation - now translatable
    const REQUIRED_DELETE_TEXT = t('profile.pages.accountInfo.deleteAccount.confirmText');

    const handleDeleteAccount = () => {
        // Check if the input text matches the required confirmation text
        if (confirmInputText.trim() === REQUIRED_DELETE_TEXT) {
            handleDelAccount(undefined, {
                onSuccess: (data: unknown) => {
                    const apiRes = data as DeleteApiRes;
                    showAlertMessage(
                        apiRes.message || t('profile.pages.accountInfo.deleteAccount.messages.success'),
                        'success'
                    );
                    removeUserToken();
                    router.push('/');
                },
                onError: (data: unknown) => {
                    const apiRes = data as DeleteApiRes;
                    showAlertMessage(
                        apiRes.message || t('profile.pages.accountInfo.deleteAccount.messages.error'),
                        'error'
                    );
                }
            });

            // Close dialog after successful deletion
            setIsDeleteDialogOpen(false);
            setConfirmInputText(''); // Reset input
        } else {
            // Show error message
            showAlertMessage(
                t('profile.pages.accountInfo.deleteAccount.messages.confirmTextMismatch', {
                    text: REQUIRED_DELETE_TEXT
                }),
                'error'
            );
        }
    };

    const handleDialogClose = () => {
        setIsDeleteDialogOpen(false);
        setConfirmInputText(''); // Reset input when dialog is closed
    };

    const getBorderClass = () => {
        if (confirmInputText.trim() === REQUIRED_DELETE_TEXT) {
            return 'border-green-500 focus:ring-green-500';
        } else if (confirmInputText.length > 0) {
            return 'border-red-500 focus:ring-red-500';
        } else {
            return '';
        }
    };

    return (
        <Card className='my-4 border-red-200'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-red-700'>
                    <AlertTriangle className='h-5 w-5' />
                    {t('profile.pages.accountInfo.deleteAccount.dangerZone')}
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
                <div className='rounded-lg border border-red-200 bg-red-50 p-6'>
                    <div className='flex items-start gap-4'>
                        <Trash2 className='mt-1 h-6 w-6 text-red-600' />
                        <div className='flex-1'>
                            <h3 className='mb-2 text-lg font-semibold text-red-900'>
                                {t('profile.pages.accountInfo.deleteAccount.title')}
                            </h3>
                            <p className='mb-4 leading-relaxed text-red-700'>
                                {t('profile.pages.accountInfo.deleteAccount.description')}
                            </p>
                            <div className='mb-4 rounded-lg border border-red-200 bg-red-100 p-4'>
                                <h4 className='mb-2 font-medium text-red-900'>
                                    {t('profile.pages.accountInfo.deleteAccount.consequences.title')}
                                </h4>
                                <ul className='list-inside list-disc space-y-1 text-sm text-red-800'>
                                    <li>{t('profile.pages.accountInfo.deleteAccount.consequences.personalData')}</li>
                                    <li>{t('profile.pages.accountInfo.deleteAccount.consequences.esimPlans')}</li>
                                    <li>{t('profile.pages.accountInfo.deleteAccount.consequences.orderHistory')}</li>
                                    <li>
                                        {t('profile.pages.accountInfo.deleteAccount.consequences.membershipBenefits')}
                                    </li>
                                    <li>{t('profile.pages.accountInfo.deleteAccount.consequences.irreversible')}</li>
                                </ul>
                            </div>

                            {/* Controlled AlertDialog */}
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant='destructive'
                                        className='flex items-center gap-2'
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        disabled={isLoading}>
                                        <Trash2 className='h-4 w-4' />
                                        {isLoading
                                            ? t('profile.pages.accountInfo.deleteAccount.button.deleting')
                                            : t('profile.pages.accountInfo.deleteAccount.button.delete')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className='flex items-center gap-2 text-red-700'>
                                            <AlertTriangle className='h-5 w-5' />
                                            {t('profile.pages.accountInfo.deleteAccount.modal.title')}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div className='space-y-3 text-left'>
                                                <div className='text-muted-foreground text-sm'>
                                                    {t('profile.pages.accountInfo.deleteAccount.modal.description')}
                                                </div>
                                                <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                                                    <div className='font-medium text-red-800'>
                                                        {t('profile.pages.accountInfo.deleteAccount.modal.youWillLose')}
                                                    </div>
                                                    <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-red-700'>
                                                        <li>
                                                            {t(
                                                                'profile.pages.accountInfo.deleteAccount.modal.loss.esimPlans'
                                                            )}
                                                        </li>
                                                        <li>
                                                            {t(
                                                                'profile.pages.accountInfo.deleteAccount.modal.loss.balance'
                                                            )}
                                                        </li>
                                                        <li>
                                                            {t(
                                                                'profile.pages.accountInfo.deleteAccount.modal.loss.orderHistory'
                                                            )}
                                                        </li>
                                                        <li>
                                                            {t(
                                                                'profile.pages.accountInfo.deleteAccount.modal.loss.membership'
                                                            )}
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className='text-sm text-gray-600'>
                                                    {t('profile.pages.accountInfo.deleteAccount.modal.typeToConfirm', {
                                                        text: REQUIRED_DELETE_TEXT
                                                    })}
                                                </div>
                                                <Input
                                                    value={confirmInputText}
                                                    name='inputConfirmDeleteAccount'
                                                    placeholder={t(
                                                        'profile.pages.accountInfo.deleteAccount.modal.placeholder',
                                                        { text: REQUIRED_DELETE_TEXT }
                                                    )}
                                                    className={`font-mono ${getBorderClass()}`}
                                                    onChange={(e) => setConfirmInputText(e.target.value)}
                                                />
                                                {confirmInputText.length > 0 &&
                                                    confirmInputText.trim() !== REQUIRED_DELETE_TEXT && (
                                                        <div className='text-sm text-red-600'>
                                                            {t(
                                                                'profile.pages.accountInfo.deleteAccount.modal.textMismatch',
                                                                { text: REQUIRED_DELETE_TEXT }
                                                            )}
                                                        </div>
                                                    )}
                                                {confirmInputText.trim() === REQUIRED_DELETE_TEXT && (
                                                    <div className='text-sm text-green-600'>
                                                        {t('profile.pages.accountInfo.deleteAccount.modal.textMatches')}
                                                    </div>
                                                )}
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={handleDialogClose}>
                                            {t('profile.pages.accountInfo.deleteAccount.modal.cancel')}
                                        </AlertDialogCancel>
                                        <Button
                                            variant='destructive'
                                            onClick={handleDeleteAccount}
                                            disabled={confirmInputText.trim() !== REQUIRED_DELETE_TEXT || isLoading}
                                            className={`${
                                                confirmInputText.trim() === REQUIRED_DELETE_TEXT && !isLoading
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : 'cursor-not-allowed bg-red-400'
                                            }`}>
                                            {isLoading
                                                ? t('profile.pages.accountInfo.deleteAccount.modal.deleting')
                                                : t('profile.pages.accountInfo.deleteAccount.modal.confirm')}
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </CardContent>
            {showAlert && (
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={2000} />
            )}
        </Card>
    );
};

export default DeleteAccount;
