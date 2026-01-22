export interface InvoiceItem {
    id: string;
    description: string;
    amount: number;
    student?: {
        id: string;
        user?: {
            fullName: string;
        };
        trainingClass?: {
            name: string;
        };
    };
}

export interface Invoice {
    id: string;
    student: string; 
    category: string;
    date: string;
    amount: number;
    status: string;
    method: string;
    dueDate?: string;
    items?: InvoiceItem[];
    month?: string;
    deliveryStatus?: 'SUDAH_TERKIRIM' | 'BELUM_TERKIRIM';
    createdAt?: string;
    parent?: {
        user: {
            fullName: string;
            email: string;
            phoneNumber: string;
            address: string;
        };
    };
    photoUrl?: string;
    photo_url?: string;
}
