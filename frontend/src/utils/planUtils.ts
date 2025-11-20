// lib/utils/planUtils.ts

export interface PlanDetails {
    data?: string;
    sms?: string;
    mins?: string;
    days?: string;
}

export const formatData = (data: string): string => {
    const value = parseFloat(data);

    if (isNaN(value)) return data;

    if (value < 1) {
        return `${(value * 1024).toFixed(0)} MB`;
    }

    return `${value} GB`;
};

export const getCountryFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌍';

    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
};

export const parsePlan = (planString: string): PlanDetails => {
    const parts = planString.split(' - ');
    const result: PlanDetails = {};

    parts.forEach((part) => {
        const lower = part.toLowerCase();

        if (lower.includes('gb')) {
            result.data = part.trim();
        } else if (lower.includes('sms')) {
            result.sms = part.trim();
        } else if (lower.includes('mins')) {
            result.mins = part.trim();
        } else if (lower.includes('days')) {
            result.days = part.trim();
        }
    });

    return result;
};
