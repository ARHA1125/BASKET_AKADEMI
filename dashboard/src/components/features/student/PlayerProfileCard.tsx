import { Badge } from "@/components/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { User } from "lucide-react"

export function PlayerProfileCard() {
  return (
    <Card className="col-span-12 lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Player Card</CardTitle>
        <Badge variant="outline">OVR: 82</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <User className="h-12 w-12 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold">Ahmad Faze</h2>
          <p className="text-sm text-gray-500">Point Guard | Rookie Level</p>
          
          <div className="mt-6 w-full space-y-4">
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
