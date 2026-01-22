import { Button } from "@/components/Button";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function NotFound() {
  const cookieStore = await cookies()
  const role = cookieStore.get("role")?.value?.toLowerCase()

  let href = "/"
  if (role === 'student') href = "/student"
  if (role === 'parent') href = "/parent"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
      <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800">404</h1>
      
      <div className="relative -mt-12 space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Page not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or doesn&apos;t exist.
        </p>
        
        <div className="flex justify-center gap-4 pt-4">
           <Link href={href}>
             <Button>Back to Dashboard</Button>
           </Link>
        </div>
      </div>
    </div>
  );
}
