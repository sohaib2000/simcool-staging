// utils/formatData.ts

export const formatDataType = (data: string) => {
    // Remove any MB/GB text
    const numeric = parseFloat(data);

    if (isNaN(numeric)) return data;

    // If input is less than 1 GB → convert to MB
    if (numeric < 1) {
        return `${(numeric * 1024).toFixed(0)} MB`;
    }

    return `${numeric} GB`;
};
