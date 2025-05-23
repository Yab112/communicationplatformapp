"use client"

export function WelcomeMessage() {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg px-4 py-3 bg-[var(--color-muted)] text-[var(--color-fg)] mr-4 max-w-[85%] shadow-sm">
        <h3 className="font-semibold mb-2 text-sm">👋 Welcome to Campus Assistant!</h3>
        <p className="text-sm text-[var(--color-muted-fg)] mb-2">
          I can help you with:
        </p>
        <ul className="text-sm space-y-1 text-[var(--color-muted-fg)]">
          <li>• Course information and schedules</li>
          <li>• Academic calendar and deadlines</li>
          <li>• Campus facilities and resources</li>
          <li>• Events and activities</li>
          <li>• General campus inquiries</li>
        </ul>
        <p className="text-sm text-[var(--color-muted-fg)] mt-2">
          How can I assist you today?
        </p>
      </div>
    </div>
  )
} 