'use client';

import React, { useMemo } from 'react';

import TopupModal from '@/components/modals/TopupModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';

import {
    AlertCircle,
    Apple,
    CardSim,
    CardSimIcon,
    CheckCircle,
    Clock,
    Copy,
    ExternalLink,
    Globe,
    Hash,
    Info,
    MessageCircle,
    QrCode,
    RefreshCw,
    Signal,
    Smartphone,
    Timer,
    XCircle
} from 'lucide-react';
import moment from 'moment';

export interface ApnDetails {
    apn_type: string;
    apn_value: string;
}

export interface Apn {
    ios: ApnDetails;
    android: ApnDetails;
}

export interface Sim {
    id: number;
    created_at: string;
    iccid: string;
    lpa: string;
    imsis: string | null;
    matching_id: string;
    qrcode: string;
    qrcode_url: string;
    airalo_code: string | null;
    apn_type: string;
    apn_value: string;
    is_roaming: boolean;
    confirmation_code: string | null;
    apn: Apn;
    msisdn: string | null;
    direct_apple_installation_url: string;
}

export interface InstallationGuides {
    en: string;
}

export interface ActivationDetails {
    id: number;
    code: string;
    currency: string;
    package_id: string;
    quantity: number;
    type: string;
    description: string | null;
    esim_type: string;
    validity: number;
    package: string;
    data: string;
    price: number;
    created_at: string;
    manual_installation: string;
    qrcode_installation: string;
    installation_guides: InstallationGuides;
    text: string | null;
    voice: string | null;
    net_price: number;
    brand_settings_name: string;
    sims: Sim[];
}

export interface Order {
    id: number;
    order_ref: string;
    activation_details: ActivationDetails;
    total_amount: string;
}

export interface EsimData {
    id: number;
    user_id: number;
    order_id: number;
    package_id: number;
    iccid: string;
    imsis: string | null;
    msisdn: string | null;
    matching_id: string;
    qrcode: string;
    qrcode_url: string;
    airalo_code: string | null;
    apn_type: string;
    apn_value: string;
    is_roaming: number;
    confirmation_code: string | null;
    apn: Apn;
    direct_apple_installation_url: string;
    status: string;
    remaining: string | null;
    activated_at: string;
    expired_at: string;
    finished_at: string | null;
    activation_notified: number;
    created_at: string;
    updated_at: string;
    order: Order;
}

export interface EsimsResponse {
    success: boolean;
    data: EsimData[];
    message: string;
}

// ---- Instructions Modal ----
const InstructionsModal = ({
    open,
    onOpenChange,
    esim,
    instructionsData,
    instructionsLoading
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    esim: any;
    instructionsData: any;
    instructionsLoading: boolean;
}) => {
    const { t } = useTranslation();
    const [copiedText, setCopiedText] = React.useState('');

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(type);
        setTimeout(() => setCopiedText(''), 2000);
    };

    if (!esim || !open) return null;

    const instructions = instructionsData?.data?.instructions;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='h-[90vh] w-full max-w-[95vw] overflow-y-auto p-4 sm:p-6 md:max-w-4xl'>
                <DialogHeader>
                    <DialogTitle className='flex flex-wrap items-center gap-2 text-base sm:text-lg'>
                        <Smartphone className='text-primary h-5 w-5' />
                        {t('profile.pages.esimDetails.instructionsModal.title')}
                    </DialogTitle>
                </DialogHeader>

                {instructionsLoading ? (
                    <div className='flex h-32 items-center justify-center'>
                        <RefreshCw className='h-6 w-6 animate-spin text-gray-500' />
                        <span className='ml-2 text-sm text-gray-600 sm:text-base'>Loading instructions...</span>
                    </div>
                ) : (
                    <Tabs defaultValue='ios' className='w-full'>
                        {/* ✅ Tabs now wrap nicely on mobile */}
                        <TabsList className='flex w-full flex-wrap gap-2 sm:grid sm:grid-cols-2'>
                            <TabsTrigger value='ios' className='flex items-center gap-2 text-sm sm:text-base'>
                                <Apple className='h-4 w-4' />
                                iOS
                            </TabsTrigger>
                            <TabsTrigger value='android' className='flex items-center gap-2 text-sm sm:text-base'>
                                <Smartphone className='h-4 w-4' />
                                Android
                            </TabsTrigger>
                        </TabsList>

                        {/* iOS Tab */}
                        <TabsContent value='ios' className='space-y-6'>
                            {instructions?.ios?.map((iosInstruction: any, index: number) => (
                                <div key={index} className='space-y-4'>
                                    {iosInstruction.version && (
                                        <div className='rounded-lg bg-blue-50 p-3'>
                                            <h3 className='flex items-center gap-2 font-semibold text-blue-900'>
                                                <Apple className='h-5 w-5' />
                                                iOS Version: {iosInstruction.version}
                                            </h3>
                                        </div>
                                    )}

                                    {/* QR Code Installation */}
                                    {iosInstruction.installation_via_qr_code && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className='flex items-center gap-2 text-lg'>
                                                    <QrCode className='h-5 w-5 text-green-600' />
                                                    QR Code Installation
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='space-y-4'>
                                                {/* QR Code Display */}
                                                <div className='flex justify-center p-4'>
                                                    <img
                                                        src={iosInstruction.installation_via_qr_code.qr_code_url}
                                                        alt='QR Code'
                                                        className='h-32 w-32 rounded border p-2'
                                                    />
                                                </div>

                                                {/* Steps */}
                                                <div className='space-y-3'>
                                                    {Object.entries(iosInstruction.installation_via_qr_code.steps).map(
                                                        ([stepNumber, step]) => (
                                                            <div key={stepNumber} className='flex gap-3'>
                                                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600'>
                                                                    {stepNumber}
                                                                </div>
                                                                <p className='flex-1 text-sm text-gray-700'>
                                                                    {step as string}
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                {/* Direct Apple Installation Button */}
                                                {iosInstruction.direct_apple_installation_url && (
                                                    <Button asChild className='w-full'>
                                                        <a
                                                            href={iosInstruction.direct_apple_installation_url}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='flex items-center justify-center gap-2'>
                                                            <ExternalLink className='h-4 w-4' />
                                                            Install Directly on iOS
                                                        </a>
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Manual Installation */}
                                    {iosInstruction.installation_manual && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className='flex items-center gap-2 text-lg'>
                                                    <Hash className='h-5 w-5 text-orange-600' />
                                                    Manual Installation
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='space-y-4'>
                                                {/* Manual Details */}
                                                <div className='space-y-3 rounded-lg bg-gray-50 p-4'>
                                                    <div className='flex items-center justify-between'>
                                                        <span className='font-medium text-gray-700'>
                                                            SM-DP+ Address:
                                                        </span>
                                                        <div className='flex items-center gap-2'>
                                                            <code className='rounded bg-white px-2 py-1 text-sm'>
                                                                {iosInstruction.installation_manual.smdp_address}
                                                            </code>
                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        iosInstruction.installation_manual.smdp_address,
                                                                        'smdp'
                                                                    )
                                                                }
                                                                className='h-8 w-8 p-0'>
                                                                <Copy className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className='flex items-center justify-between'>
                                                        <span className='font-medium text-gray-700'>
                                                            Activation Code:
                                                        </span>
                                                        <div className='flex items-center gap-2'>
                                                            <code className='rounded bg-white px-2 py-1 text-sm'>
                                                                {iosInstruction.installation_manual.activation_code}
                                                            </code>
                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        iosInstruction.installation_manual
                                                                            .activation_code,
                                                                        'activation'
                                                                    )
                                                                }
                                                                className='h-8 w-8 p-0'>
                                                                <Copy className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {copiedText && (
                                                        <p className='text-sm text-green-600'>
                                                            {copiedText === 'smdp'
                                                                ? 'SM-DP+ Address'
                                                                : 'Activation Code'}{' '}
                                                            copied to clipboard!
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Manual Steps */}
                                                <div className='space-y-3'>
                                                    {Object.entries(iosInstruction.installation_manual.steps).map(
                                                        ([stepNumber, step]) => (
                                                            <div key={stepNumber} className='flex gap-3'>
                                                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600'>
                                                                    {stepNumber}
                                                                </div>
                                                                <p className='flex-1 text-sm text-gray-700'>
                                                                    {step as string}
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Network Setup */}
                                    {iosInstruction.network_setup && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className='flex items-center gap-2 text-lg'>
                                                    <Signal className='h-5 w-5 text-purple-600' />
                                                    Network Setup
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='space-y-4'>
                                                {/* APN Details */}
                                                <div className='rounded-lg bg-purple-50 p-4'>
                                                    <div className='flex items-center justify-between'>
                                                        <span className='font-medium text-purple-700'>APN Value:</span>
                                                        <div className='flex items-center gap-2'>
                                                            <code className='rounded bg-white px-2 py-1 text-sm text-purple-800'>
                                                                {iosInstruction.network_setup.apn_value}
                                                            </code>
                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        iosInstruction.network_setup.apn_value,
                                                                        'apn'
                                                                    )
                                                                }
                                                                className='h-8 w-8 p-0'>
                                                                <Copy className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className='mt-2 text-sm text-purple-600'>
                                                        Data Roaming:{' '}
                                                        {iosInstruction.network_setup.is_roaming
                                                            ? 'Enabled'
                                                            : 'Disabled'}
                                                    </p>
                                                </div>

                                                {/* Network Setup Steps */}
                                                <div className='space-y-3'>
                                                    {Object.entries(iosInstruction.network_setup.steps).map(
                                                        ([stepNumber, step]) => (
                                                            <div key={stepNumber} className='flex gap-3'>
                                                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-600'>
                                                                    {stepNumber}
                                                                </div>
                                                                <p className='flex-1 text-sm text-gray-700'>
                                                                    {step as string}
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ))}
                        </TabsContent>

                        {/* Android Tab */}
                        <TabsContent value='android' className='space-y-6'>
                            {instructions?.android?.map((androidInstruction: any, index: number) => (
                                <div key={index} className='space-y-4'>
                                    {/* QR Code Installation */}
                                    {androidInstruction.installation_via_qr_code && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className='flex items-center gap-2 text-lg'>
                                                    <QrCode className='h-5 w-5 text-green-600' />
                                                    QR Code Installation
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='space-y-4'>
                                                {/* QR Code Display */}
                                                <div className='flex justify-center p-4'>
                                                    <img
                                                        src={androidInstruction.installation_via_qr_code.qr_code_url}
                                                        alt='QR Code'
                                                        className='h-32 w-32 rounded border p-2'
                                                    />
                                                </div>

                                                {/* Steps */}
                                                <div className='space-y-3'>
                                                    {Object.entries(
                                                        androidInstruction.installation_via_qr_code.steps
                                                    ).map(([stepNumber, step]) => (
                                                        <div key={stepNumber} className='flex gap-3'>
                                                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-600'>
                                                                {stepNumber}
                                                            </div>
                                                            <p className='flex-1 text-sm text-gray-700'>
                                                                {step as string}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Manual Installation */}
                                    {androidInstruction.installation_manual && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className='flex items-center gap-2 text-lg'>
                                                    <Hash className='h-5 w-5 text-orange-600' />
                                                    Manual Installation
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='space-y-4'>
                                                {/* Manual Details */}
                                                <div className='space-y-3 rounded-lg bg-gray-50 p-4'>
                                                    <div className='flex items-center justify-between'>
                                                        <span className='font-medium text-gray-700'>
                                                            SM-DP+ & Activation:
                                                        </span>
                                                        <div className='flex items-center gap-2'>
                                                            <code className='rounded bg-white px-2 py-1 text-sm'>
                                                                {
                                                                    androidInstruction.installation_manual
                                                                        .smdp_address_and_activation_code
                                                                }
                                                            </code>
                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        androidInstruction.installation_manual
                                                                            .smdp_address_and_activation_code,
                                                                        'android_code'
                                                                    )
                                                                }
                                                                className='h-8 w-8 p-0'>
                                                                <Copy className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {copiedText === 'android_code' && (
                                                        <p className='text-sm text-green-600'>
                                                            Code copied to clipboard!
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Manual Steps */}
                                                <div className='space-y-3'>
                                                    {Object.entries(androidInstruction.installation_manual.steps).map(
                                                        ([stepNumber, step]) => (
                                                            <div key={stepNumber} className='flex gap-3'>
                                                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600'>
                                                                    {stepNumber}
                                                                </div>
                                                                <p className='flex-1 text-sm text-gray-700'>
                                                                    {step as string}
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Network Setup */}
                                    {androidInstruction.network_setup && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className='flex items-center gap-2 text-lg'>
                                                    <Signal className='h-5 w-5 text-purple-600' />
                                                    Network Setup
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className='space-y-4'>
                                                {/* APN Details */}
                                                <div className='rounded-lg bg-purple-50 p-4'>
                                                    <div className='flex items-center justify-between'>
                                                        <span className='font-medium text-purple-700'>APN Value:</span>
                                                        <div className='flex items-center gap-2'>
                                                            <code className='rounded bg-white px-2 py-1 text-sm text-purple-800'>
                                                                {androidInstruction.network_setup.apn_value}
                                                            </code>
                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        androidInstruction.network_setup.apn_value,
                                                                        'android_apn'
                                                                    )
                                                                }
                                                                className='h-8 w-8 p-0'>
                                                                <Copy className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className='mt-2 text-sm text-purple-600'>
                                                        Data Roaming:{' '}
                                                        {androidInstruction.network_setup.is_roaming
                                                            ? 'Enabled'
                                                            : 'Disabled'}
                                                    </p>
                                                    <p className='text-sm text-purple-600'>
                                                        APN Type: {androidInstruction.network_setup.apn_type}
                                                    </p>
                                                </div>

                                                {/* Network Setup Steps */}
                                                <div className='space-y-3'>
                                                    {Object.entries(androidInstruction.network_setup.steps).map(
                                                        ([stepNumber, step]) => (
                                                            <div key={stepNumber} className='flex gap-3'>
                                                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-600'>
                                                                    {stepNumber}
                                                                </div>
                                                                <p className='flex-1 text-sm text-gray-700'>
                                                                    {step as string}
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
};

// ---- View Modal for full details ----
const ViewEsimModal = ({
    open,
    onOpenChange,
    esim
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    esim: any;
}) => {
    const { t } = useTranslation(); // Translation hook

    if (!esim) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] w-full max-w-2xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Info className='text-primary h-5 w-5' />
                        {t('profile.pages.esimDetails.modal.title')}
                    </DialogTitle>
                </DialogHeader>

                <div className='space-y-6'>
                    {/* QR Code */}
                    <div className='flex justify-center'>
                        <img src={esim.qrcode_url} alt='QR Code' className='h-40 w-40 rounded border p-2' />
                    </div>

                    {/* Basic Info */}
                    <div className='space-y-2 text-sm text-gray-700'>
                        <p>
                            <b>{t('profile.pages.esimDetails.fields.iccid')}</b> {esim.iccid}
                        </p>
                        <p>
                            <b>{t('profile.pages.esimDetails.fields.matchingId')}</b> {esim.matching_id}
                        </p>
                        <p>
                            <b>{t('profile.pages.esimDetails.fields.status')}</b> {esim.status}
                        </p>
                        <p>
                            <b>{t('profile.pages.esimDetails.fields.activatedAt')}</b> {/* {esim.activated_at} */}
                            {esim.activated_at == 'null' ? moment(esim.activated_at).format('YYYY-MM-DD HH:mm') : 'N/A'}
                        </p>
                        <p>
                            <b>{t('profile.pages.esimDetails.fields.expiredAt')}</b> {/* {esim.expired_at} */}
                            {esim.expired_at == 'null' ? moment(esim.expired_at).format('YYYY-MM-DD HH:mm') : 'N/A'}
                        </p>
                        <p>
                            <b>{t('profile.pages.esimDetails.fields.apnIos')}</b> {esim.apn?.ios?.apn_value}
                        </p>
                        <p>
                            <b>{t('profile.pages.esimDetails.fields.apnAndroid')}</b> {esim.apn?.android?.apn_value}
                        </p>
                    </div>

                    {/* Order Info */}
                    {esim.order && (
                        <div className='space-y-2 text-sm text-gray-700'>
                            <h3 className='font-semibold text-gray-900'>
                                {t('profile.pages.esimDetails.modal.orderInfo')}
                            </h3>
                            <p>
                                <b>Order Ref:</b> {esim.order.order_ref}
                            </p>
                            <p>
                                <b>{t('profile.pages.esimDetails.fields.package')}</b>{' '}
                                {esim.order.activation_details.package}
                            </p>
                            <p>
                                <b>{t('profile.pages.esimDetails.fields.data')}</b> {esim.order.activation_details.data}
                            </p>
                            <p>
                                <b>{t('profile.pages.esimDetails.fields.price')}</b>{' '}
                                {t('profile.pages.esimDetails.currency.format', {
                                    price: esim.order?.total_amount,
                                    currency: esim.order.activation_details.currency
                                })}
                            </p>
                            <p>
                                <b>{t('profile.pages.esimDetails.fields.validity')}</b>{' '}
                                {t('profile.pages.esimDetails.validity.format', {
                                    days: esim.order.activation_details.validity
                                })}
                            </p>

                            {/* Installation Guides */}
                            <div className='space-y-3 pt-2'>
                                <a
                                    href={esim.order.activation_details.installation_guides?.en}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-primary underline'>
                                    {t('profile.pages.esimDetails.modal.installationGuide')}
                                </a>
                                {esim.order.activation_details.manual_installation && (
                                    <div
                                        className='prose prose-sm max-w-none border-t pt-2'
                                        dangerouslySetInnerHTML={{
                                            __html: esim.order.activation_details.manual_installation
                                        }}
                                    />
                                )}
                                {esim.order.activation_details.qrcode_installation && (
                                    <div
                                        className='prose prose-sm max-w-none border-t pt-2'
                                        dangerouslySetInnerHTML={{
                                            __html: esim.order.activation_details.qrcode_installation
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Direct Apple Install Link */}
                    {esim.direct_apple_installation_url && (
                        <div>
                            <Button size='sm' asChild className='w-full justify-center gap-2'>
                                <a href={esim.direct_apple_installation_url} target='_blank' rel='noopener noreferrer'>
                                    <QrCode className='h-4 w-4' />
                                    {t('profile.pages.esimDetails.actions.installOnIos')}
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ---- Main Page ----
const MyEsimDetails = () => {
    const { t } = useTranslation(); // Translation hook
    const [openTopup, setOpenTopup] = React.useState(false);
    const [openView, setOpenView] = React.useState(false);
    const [openInstructions, setOpenInstructions] = React.useState(false);
    const [selectedEsim, setSelectedEsim] = React.useState<any>(null);

    const { data, isLoading } = useProtectedApiHandler<EsimsResponse>({
        url: '/myEsims'
    });

    const { data: instructionsData, isLoading: instructionsLoading } = useProtectedApiHandler<any>({
        url: selectedEsim ? `/instructions?iccid=${selectedEsim.iccid}` : '',
        enabled: !!selectedEsim && openInstructions
    });

    if (isLoading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <RefreshCw className='h-6 w-6 animate-spin text-gray-500' />
                <span className='ml-2 text-gray-600'>{t('profile.pages.esimDetails.loading')}</span>
            </div>
        );
    }

    interface ExpiryInfoProps {
        esim: {
            expired_at: string;
        };
    }

    function ExpiryInfo({ esim }: ExpiryInfoProps) {
        // Check if expired_at is null or invalid
        if (!esim.expired_at) {
            return (
                <div className='flex items-center gap-2 text-gray-700'>
                    <Timer className='h-4 w-4 text-gray-500' />
                    <span className='text-sm text-gray-500'>
                        {t('profile.pages.esimDetails.timeLeft.notAvailable')}
                    </span>
                </div>
            );
        }

        const expiryDate = new Date(esim.expired_at).getTime();

        // Check if date is valid
        if (isNaN(expiryDate)) {
            return (
                <div className='flex items-center gap-2 text-gray-700'>
                    <Timer className='h-4 w-4 text-gray-500' />
                    <span className='text-sm text-gray-500'>{t('profile.pages.esimDetails.timeLeft.invalidDate')}</span>
                </div>
            );
        }

        const now = Date.now();

        const diffMs = expiryDate - now;

        const isExpired = diffMs <= 0;
        const isRed = diffMs <= 1000 * 60 * 60 * 24;

        let timeLeftString = '';

        if (!isExpired) {
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
            const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);

            const parts = [];
            if (diffDays > 0) {
                parts.push(
                    t('profile.pages.esimDetails.timeLeft.days', {
                        count: diffDays
                    })
                );
            }
            if (diffHours > 0) {
                parts.push(
                    t('profile.pages.esimDetails.timeLeft.hours', {
                        count: diffHours
                    })
                );
            }
            if (diffMinutes > 0) {
                parts.push(
                    t('profile.pages.esimDetails.timeLeft.minutes', {
                        count: diffMinutes
                    })
                );
            }

            timeLeftString = parts.join(' ');
        }

        return (
            <div className='flex items-center gap-2 text-gray-700'>
                <Timer className='h-4 w-4 text-gray-500' />
                <span className={`text-sm ${isRed ? 'font-semibold text-red-500' : ''}`}>
                    {isExpired
                        ? t('profile.pages.esimDetails.timeLeft.expired')
                        : t('profile.pages.esimDetails.timeLeft.left', {
                              time: timeLeftString
                          })}
                </span>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Page Header */}
            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='flex items-center gap-2'>
                    <CardSim className='text-primary h-7 w-7' />
                    <h2 className='text-2xl font-bold text-gray-900'>{t('profile.pages.esimDetails.title')}</h2>
                </div>
            </div>

            {!data?.data || data.data.length === 0 ? (
                <Card>
                    <CardContent className='p-8 text-center sm:p-12'>
                        <AlertCircle className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                        <h3 className='mb-2 text-lg font-medium text-gray-900'>
                            {t('profile.pages.esimDetails.empty.title')}
                        </h3>
                        <p className='text-gray-500'>{t('profile.pages.esimDetails.empty.description')}</p>
                    </CardContent>
                </Card>
            ) : (
                data.data.map((esim: any) => (
                    <Card key={esim.id} className='overflow-hidden border shadow-md'>
                        <CardHeader className='flex flex-row items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <QrCode className='text-primary h-6 w-6' />
                                <CardTitle className='text-lg font-semibold'>
                                    {esim.order?.activation_details?.package || 'eSIM Package'}
                                </CardTitle>
                            </div>
                            <Badge
                                className={`rounded-full px-2 py-1 text-xs ${
                                    esim.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {esim.status}
                            </Badge>
                        </CardHeader>

                        <CardContent className='space-y-6'>
                            {/* ICCID */}
                            <div className='flex items-center gap-2 text-gray-700'>
                                <Hash className='h-4 w-4 text-gray-500' />
                                <span className='text-sm font-medium'>
                                    {t('profile.pages.esimDetails.fields.iccid')}
                                </span>
                                <span className='text-sm'>{esim.iccid}</span>
                            </div>

                            {/* Usage Info */}
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div className='flex items-center gap-2 text-gray-700'>
                                    <Signal className='h-4 w-4 text-gray-500' />
                                    <span className='text-sm font-medium'>
                                        {t('profile.pages.esimDetails.fields.validity')}
                                    </span>
                                    <span className='text-sm'>
                                        {t('profile.pages.esimDetails.validity.format', {
                                            days: esim.order?.activation_details?.validity ?? 0
                                        })}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-700'>
                                    <Smartphone className='h-4 w-4 text-gray-500' />
                                    <span className='text-sm font-medium'>
                                        {t('profile.pages.esimDetails.fields.price')}
                                    </span>
                                    <span className='text-sm'>
                                        {t('profile.pages.esimDetails.currency.format', {
                                            price: esim.order?.total_amount,
                                            currency: esim.order?.activation_details?.currency
                                        })}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-700'>
                                    <MessageCircle className='h-4 w-4 text-gray-500' />
                                    <span className='text-sm font-medium'>
                                        {t('profile.pages.esimDetails.fields.activatedOn')}
                                    </span>
                                    <span className='text-sm'>
                                        {esim.activated_at == 'null'
                                            ? moment(esim.activated_at).format('YYYY-MM-DD HH:mm')
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-gray-700'>
                                    <Timer className='h-4 w-4 text-gray-500' />
                                    <span className='text-sm font-medium'>
                                        {t('profile.pages.esimDetails.fields.expiryOn')}
                                    </span>
                                    <span className='text-sm'>
                                        {esim.expired_at == 'null'
                                            ? moment(esim.expired_at).format('YYYY-MM-DD HH:mm')
                                            : 'N/A'}
                                    </span>
                                </div>
                                <ExpiryInfo esim={esim} />
                            </div>

                            {/* Status */}
                            {/* <div className="flex items-center gap-2">
                                {esim.status === "EXPIRED" ? (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                <span
                                    className={`text-sm font-medium ${
                                        esim.status === "EXPIRED"
                                            ? "text-red-600"
                                            : "text-green-600"
                                    }`}
                                >
                                    {esim.status}
                                </span>
                            </div> */}

                            <div className='flex items-center gap-2'>
                                {esim.status === 'EXPIRED' ? (
                                    <XCircle className='h-5 w-5 text-red-500' />
                                ) : esim.status === 'NOT_ACTIVE' ? (
                                    <Clock className='h-5 w-5 text-orange-500' />
                                ) : (
                                    <CheckCircle className='h-5 w-5 text-green-500' />
                                )}
                                <span
                                    className={`text-sm font-medium ${
                                        esim.status === 'EXPIRED'
                                            ? 'text-red-600'
                                            : esim.status === 'NOT_ACTIVE'
                                              ? 'text-orange-600'
                                              : 'text-green-600'
                                    }`}>
                                    {t(`profile.pages.esimDetails.status.${esim.status.toLowerCase()}`)}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className='flex flex-wrap gap-3 pt-4'>
                                {esim.status !== 'EXPIRED' && (
                                    <Button size='sm' variant='outline' onClick={() => setOpenTopup(true)}>
                                        <RefreshCw className='mr-2 h-4 w-4' />
                                        {t('profile.pages.esimDetails.actions.topup')}
                                    </Button>
                                )}

                                <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => {
                                        setSelectedEsim(esim);
                                        setOpenView(true);
                                    }}>
                                    <Info className='mr-2 h-4 w-4' />
                                    {t('profile.pages.esimDetails.actions.view')}
                                </Button>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => {
                                        setSelectedEsim(esim);
                                        setOpenInstructions(true);
                                    }}>
                                    <Smartphone className='mr-2 h-4 w-4' />
                                    {t('profile.pages.esimDetails.actions.instructions')}
                                </Button>
                            </div>
                        </CardContent>

                        <TopupModal open={openTopup} onOpenChange={setOpenTopup} iccid={esim.iccid} />
                    </Card>
                ))
            )}

            {/* View Modal */}
            <ViewEsimModal open={openView} onOpenChange={setOpenView} esim={selectedEsim} />

            {/* Instructions Modal */}
            <InstructionsModal
                open={openInstructions}
                onOpenChange={setOpenInstructions}
                esim={selectedEsim}
                instructionsData={instructionsData}
                instructionsLoading={instructionsLoading}
            />
        </div>
    );
};

export default MyEsimDetails;
