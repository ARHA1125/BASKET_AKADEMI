import { Button } from "@/components/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { AlertCircle } from "lucide-react"
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef } from 'react';

export function BillWatchWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".gsap-bill-item",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
    );
  }, { scope: containerRef });

  return (
    <Card ref={containerRef} className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10">
      <CardHeader className="gsap-bill-item flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
          Unpaid Invoices
        </CardTitle>
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      </CardHeader>
      <CardContent>
        <div className="gsap-bill-item text-2xl font-bold text-red-700 dark:text-red-400">
          Rp 750,000
        </div>
        <p className="gsap-bill-item text-xs text-red-600/80 dark:text-red-400/80">
          Due: 5 Days ago (Monthly Tuition)
        </p>
        <div className="gsap-bill-item">
            <Button className="mt-4 w-full bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600">
            Pay Now
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}
