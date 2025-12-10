interface NavLink {
    label: string;
    href?: string;
    submenu?: {
        name: string;
        href: string;
    }[];
}

export interface NavbarDataTypes {
    topNavbar: {
        content: string;
        buttonText: string;
    };
    secondNavbar: {
        logo: string;
        navlinkes: NavLink[];
        fistBtnText: string;
        sectBtnText: string;
    };
}

export interface LoginWithOtpResponse {
    success: boolean;
    message: string;
    data: {
        email: string;
    };
}

export interface LoginWithOtpErrorResponse {
    success: boolean;
    message: string;
}

export interface LoginResponsewithGoogleVeryFi {
    success: boolean;
    message: string;
    data: LoginData;
}

export interface LoginData {
    user: User;
    referral_point: string; // API returns it as a string ("50")
    device_details: DeviceDetails | null;
    token: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    otp: string | null;
    otp_expires_at: string | null;
    refCode: string | null;
    refBy: string | null;
    country: string | null;
    countryCode: string | null;
    currencyId: number | null;
    is_active: number; // 0 | 1
    image: string | null;
    deleted_at: string | null;
    created_at: string; // ISO datetime string
    updated_at: string; // ISO datetime string
    payment_mode?: string | null; // optional - present in example
    kyc_status?: 'Not applied' | 'pending' | 'approved' | 'rejected'; // optional - present in example
    notification_count?: number; // optional - present in example
    currency?: ProfileUpdateCurencyType; // optional - present in example
    referral_point?: string; // optional - present in example
}

export interface DeviceDetails {
    id: number;
    user_id: number;
    deviceid: string | null;
    fcmToken: string | null;
    deviceLocation: string | null;
    deviceManufacture: string | null;
    deviceModel: string | null;
    appVersion: string | null;
    created_at: string;
    updated_at: string;
}

export interface LogOutResponceType {
    success: boolean;
    message: string;
}

export interface CurrencyResponceType {
    success: boolean;
    message: string;
    data: CurrencyData[];
}
export interface CurrencyData {
    id: number;
    name: string;
    symbol: string;
}

export interface ProfileUpdateCurencyType {
    id: number;
    name: string;
    symbol: string;
    is_active: number;
    referral_point: number;
    created_at: string;
    updated_at: string;
}

export interface ProfileUpdateData {
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
    currencyId: string;
    is_active: number;
    image: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    payment_mode: string;
    currency: ProfileUpdateCurencyType;
}

export interface ProfileUpdateRes {
    success: boolean;
    data: ProfileUpdateData;
    message: string;
}

export interface Order {
    id: number;
    user_id: number;
    esim_package_id: number;
    currency_id: number;
    airalo_price: number;
    order_ref: string;
    gst: number;
    total_amount: string;
    status: 'pending' | 'cancelled' | 'completed'; // Add more statuses if needed
    activation_details: any;
    webhook_request_id: number | null;
    user_note: string | null;
    admin_note: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrdersResponse {
    success: boolean;
    message: string;
    data: {
        current_page: number;
        data: Order[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}

export interface Location {
    id: number;
    region_id: number;
    name: string;
    slug: string;
    country_code: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Usage {
    remaining: number;
    total: number;
    expired_at: string;
    is_unlimited: boolean;
    status: string;
    remaining_voice: number;
    remaining_text: number;
    total_voice: number;
    total_text: number;
}

export interface Package {
    id: number;
    iccid: string;
    esim_status: string;
    location: Location;
    usage: Usage;
}

export interface PackageApiResponse {
    success: boolean;
    data: Package[];
    message: string;
}

export interface ProfileInfo {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at?: string | null;
    otp?: string | null;
    otp_expires_at?: string | null;
    refCode: string;
    refBy?: string | null;
    country: string;
    countryCode: string;
    currencyId: number;
    is_active: number;
    image?: string | null;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
    kyc_status: 'Not applied' | 'pending' | 'approved' | 'rejected';
    referral_point: string;
    payment_mode: string;
    notification_count: number;
    currency: ProfileUpdateCurencyType;
}

export interface ProfileGetInfoRes {
    success: boolean;
    data: ProfileInfo;
    message: string;
}

export interface FaqItem {
    id: number;
    question: string;
    answer: string;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface FaqsResponse {
    success: boolean;
    data: FaqItem[];
    message: string;
}

export interface TicketMessage {
    id: number;
    support_ticket_id: number;
    user_id: number;
    message: string;
    sender_type: 'user' | 'admin';
    is_read: number;
    created_at: string;
    updated_at: string;
}

export interface Ticket {
    id: number;
    user_id: number;
    subject: string;
    status: 'open' | 'closed';
    created_at: string;
    updated_at: string;
    is_reply: number;
    messages: TicketMessage[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface TicketsData {
    current_page: number;
    data: Ticket[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface TicketsResponse {
    success: boolean;
    data: TicketsData;
    message: string;
}

// Ticket data with messages
export interface TicketDetails {
    id: number;
    user_id: number;
    subject: string;
    status: string; // "open" | "closed" | etc.
    created_at: string;
    updated_at: string;
    is_reply: number; // 0 | 1 → can normalize to boolean
    messages: TicketMessage[];
}

// Full API response
export interface GetTicketDetailsRes {
    success: boolean;
    data: TicketDetails;
    message: string;
}

// notification types

export interface NotificationResponse {
    success: boolean;
    data: NotificationData;
    message: string;
}

export interface NotificationData {
    current_page: number;
    data: NotificationItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: NoiFyLinksLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface NotificationItem {
    id: number;
    user_id: number;
    title: string;
    description: string;
    type: number;
    is_read: number;
    is_admin_read: number;
    created_at: string;
    updated_at: string;
}

export interface NoiFyLinksLink {
    url: string | null;
    label: string;
    active: boolean;
}

// meta api types
export interface MetaApiResponse {
    success: boolean;
    data: ApiData;
    message: string;
}

/** The `data` object inside the response */
export interface ApiData {
    logo: string; // path to light logo image
    DarkLogo: string; // path to dark logo image
    favicon: string; // path to favicon image
    webconfig: WebConfig;
}

/** Web configuration object */
export interface WebConfig {
    siteName: string;
    firebaseApiKey?: string | null;
    firebaseAuthDomain?: string | null;
    firebaseProjectId?: string | null;
    firebaseStorageBucket?: string | null;
    firebaseSenderId?: string | null;
    firebaseAppId?: string | null;
    firebaseVapidKey?: string | null;
    webBaseUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    address?: string | boolean | null;
}
