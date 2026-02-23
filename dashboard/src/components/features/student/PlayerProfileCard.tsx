import { Badge } from "@/components/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { User } from "lucide-react"
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef } from 'react';

export function PlayerProfileCard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".gsap-profile-item",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, stagger: 0.1, duration: 0.5, ease: "back.out(1.5)" }
    );
  }, { scope: containerRef });

  return (
    <Card ref={containerRef} className="col-span-12 lg:col-span-4">
      <CardHeader className="gsap-profile-item flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Player Card</CardTitle>
        <Badge variant="outline">OVR: 82</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="gsap-profile-item mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <User className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="gsap-profile-item text-2xl font-bold">Ahmad Faze</h2>
          <p className="gsap-profile-item text-sm text-gray-500">Point Guard | Rookie Level</p>
          
          <div className="gsap-profile-item mt-6 w-full space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>XP Progress</span>
                <span>1250 / 2000 XP</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-2 w-[62%] rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
