import { Invoice } from './invoices';

export interface SwipeableVerificationModalProps {
  invoices: Invoice[];
  startIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (
    invoiceId: string,
    paymentMethod: 'TRANSFER' | 'CASH',
    paidAmount?: number
  ) => Promise<void>;
  apiUrl: string;
}

export interface ProofViewerModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (id: string, paymentMethod: 'TRANSFER' | 'CASH', paidAmount?: number) => Promise<void>;
  apiUrl: string;
}
