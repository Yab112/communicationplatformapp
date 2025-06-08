import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export default async function LandingPage() {
  // Check if user is already authenticated
  const session = await getSession()

  if (session) {
    redirect("/feeds")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">UniConnect</span>
        </div>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Welcome to UniConnect
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  The social platform for university students and faculty
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/login">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Real-time Chat</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Connect with classmates and professors through instant messaging
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                    <path d="M10 2c1 .5 2 2 2 5" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Resource Sharing</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Share and access study materials, lecture notes, and more
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M17 6.1H3" />
                    <path d="M21 12.1H3" />
                    <path d="M15.1 18H3" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">News Feed</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Stay updated with the latest campus news and announcements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} UniConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
