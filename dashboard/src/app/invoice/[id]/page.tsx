import InvoiceDetailView from '@/components/ui/invoice/InvoiceDetailView';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: any 
): Promise<Metadata> {

  const { id } = await params
  
  let invoiceAmount = '0';
  let schoolName = 'Wirabhakti Basketball Club';
  
  try {

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/payment-module/${id}`, { cache: 'no-store' });
      
      if (res.ok) {
          const invoice = await res.json();
       
          invoiceAmount = new Intl.NumberFormat('id-ID').format(invoice.amount);
      }
  } catch (e) {
      console.error('Error fetching invoice metadata:', e);
  }


  const invoiceTitle = `Tagihan Online - Invoice #${id}`;
  const invoiceDesc = `Tagihan ${schoolName}. Total: Rp ${invoiceAmount}. Klik untuk melihat detail dan pembayaran.`;

  return {
    title: invoiceTitle,
    description: invoiceDesc,
    openGraph: {
        title: invoiceTitle,
        description: invoiceDesc,
        type: 'website',
        images: ['https://placehold.co/600x400/indigo/white?text=INVOICE'],
    },
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <InvoiceDetailView params={resolvedParams} />;
}
