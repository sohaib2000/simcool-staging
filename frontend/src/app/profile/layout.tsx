"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BASE_URL } from "@/config/constant";
import { useTranslation } from "@/contexts/LanguageContext";
import { useProtectedApiHandler } from "@/lib/apiHandler/useProtectedApiHandler";
import { RootState } from "@/redux/store/store";

// Translation hook

import {
    Calendar,
    CardSim,
    ChevronRight,
    Handshake,
    Mail,
    MapPin,
    Package,
    Settings,
    Shield,
    User,
} from "lucide-react";
import moment from "moment";
import { FaQuestionCircle } from "react-icons/fa";
import { RiCustomerService2Fill } from "react-icons/ri";
import { useSelector } from "react-redux";

interface ProfileLayoutProps {
    children: React.ReactNode;
}

export interface Currency {
    id: number;
    name: string;
    symbol: string;
    is_active: number;
    referral_point: number;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    otp: string | null;
    otp_expires_at: string | null;
    refCode: string;
    refBy: string | null;
    country: string;
    countryCode: string;
    currencyId: number;
    is_active: number;
    image: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    kyc_status: "rejected" | "approved" | "pending";
    referral_point: string;
    payment_mode: string;
    notification_count: number;
    membershipLevel: string;
    currency: Currency;
}

export interface UserResponse {
    success: boolean;
    data: User;
    message: string;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
    const pathname = usePathname();
    const userReduxData = useSelector((state: RootState) => state.user.user);
    const { t } = useTranslation(); // Translation hook

    const navigationLinks = [
        {
            label: t("profile.sidebar.navigation.accountInfo"),
            href: "/profile",
            icon: User,
            description: t("profile.sidebar.navigation.accountInfoDesc"),
            isActive: pathname === "/profile",
        },
        {
            label: t("profile.sidebar.navigation.esimDetails"),
            href: "/profile/esim-details",
            icon: CardSim,
            description: t("profile.sidebar.navigation.esimDetailsDesc"),
            isActive: pathname === "/profile/esim-details",
        },
        {
            label: t("profile.sidebar.navigation.orderHistory"),
            href: "/profile/order-history",
            icon: Package,
            description: t("profile.sidebar.navigation.orderHistoryDesc"),
            isActive: pathname === "/profile/order-history",
        },
        {
            label: t("profile.sidebar.navigation.privacyPolicy"),
            href: "/profile/privacy-policy",
            icon: Shield,
            description: t("profile.sidebar.navigation.privacyPolicyDesc"),
            isActive: pathname === "/profile/privacy-policy",
        },
        {
            label: t("profile.sidebar.navigation.termsConditions"),
            href: "/profile/terms-and-conditions",
            icon: Handshake,
            description: t("profile.sidebar.navigation.termsConditionsDesc"),
            isActive: pathname === "/profile/terms-and-conditions",
        },
        {
            label: t("profile.sidebar.navigation.faq"),
            href: "/profile/faq",
            icon: FaQuestionCircle,
            description: t("profile.sidebar.navigation.faqDesc"),
            isActive: pathname === "/profile/faq",
        },
        {
            label: t("profile.sidebar.navigation.customerSupport"),
            href: "/profile/customer-support",
            icon: RiCustomerService2Fill,
            description: t("profile.sidebar.navigation.customerSupportDesc"),
            isActive: pathname === "/profile/customer-support",
        },
    ];

    const { data: profileData } = useProtectedApiHandler<UserResponse>({
        url: "/profile",
    });

    const userData = profileData?.data;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Profile Header - Common for all profile pages */}
            <div className="border-b bg-white">
                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                {userReduxData?.image ? (
                                    <img
                                        src={`${BASE_URL}/${userReduxData?.image}`}
                                        alt={
                                            userReduxData?.name ||
                                            t("profile.header.defaultAlt")
                                        }
                                        className="flex h-20 w-20 items-center justify-center rounded-full border-2 object-cover text-2xl font-bold text-white shadow-lg md:h-24 md:w-24 md:text-3xl"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-lg md:h-24 md:w-24 md:text-3xl">
                                        {(userReduxData?.name || "U")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-green-500">
                                    <div className="h-3 w-3 rounded-full bg-white"></div>
                                </div>
                            </div>

                            {/* User Info */}
                            <div>
                                <div className="mb-2 flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                                        {userReduxData?.name}
                                    </h1>
                                    <Badge
                                        variant="secondary"
                                        className="bg-yellow-100 font-medium text-yellow-800"
                                    >
                                        {userData?.membershipLevel}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-2 text-gray-600 sm:flex-row sm:items-center sm:gap-6">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">
                                            {userReduxData?.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">
                                            {userData?.country}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">
                                            {t("profile.header.joined")}{" "}
                                            {moment(
                                                userData?.created_at,
                                            ).format("MMM D, YYYY, hh:mm A")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-10">
                    {/* Left Sidebar - Increased Width (30% ratio) */}
                    <div className="lg:col-span-3">
                        <Card className="sticky top-[160px]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Settings className="h-5 w-5" />
                                    {t("profile.sidebar.title")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {navigationLinks.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        className={`group flex items-center justify-between rounded-lg border p-4 transition-all duration-200 ${
                                            link.isActive
                                                ? "border-blue-500 bg-blue-50 text-blue-900"
                                                : "border-transparent hover:border-blue-200 hover:bg-blue-50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                                                    link.isActive
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                                                }`}
                                            >
                                                <link.icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div
                                                    className={`font-medium ${
                                                        link.isActive
                                                            ? "text-blue-900"
                                                            : "text-gray-900 group-hover:text-blue-900"
                                                    }`}
                                                >
                                                    {link.label}
                                                </div>
                                                <div
                                                    className={`text-sm ${
                                                        link.isActive
                                                            ? "text-blue-700"
                                                            : "text-gray-500 group-hover:text-blue-600"
                                                    }`}
                                                >
                                                    {link.description}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight
                                            className={`h-5 w-5 flex-shrink-0 transition-colors ${
                                                link.isActive
                                                    ? "text-blue-600"
                                                    : "text-gray-400 group-hover:text-blue-600"
                                            }`}
                                        />
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Content Area - 70% width */}
                    <div className="lg:col-span-7">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
