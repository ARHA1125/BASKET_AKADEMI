import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Award, Shirt } from "lucide-react"

export function VisualLocker() {
  return (
    <Card className="col-span-12 lg:col-span-8">
      <CardHeader>
        <CardTitle>My Locker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
            <Shirt className="mb-2 h-8 w-8 text-blue-500" />
            <span className="text-xs font-medium">Home Jersey</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
            <Shirt className="mb-2 h-8 w-8 text-orange-500" />
            <span className="text-xs font-medium">Away Jersey</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
            <Award className="mb-2 h-8 w-8 text-yellow-500" />
            <span className="text-xs font-medium">MVP Badge</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 p-4 opacity-50">
            <span className="text-xs text-gray-400">Empty Slot</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
