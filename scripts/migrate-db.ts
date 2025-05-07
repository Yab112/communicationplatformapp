import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function main() {
  try {
    console.log("Running database migrations...")
    await execAsync("npx prisma migrate dev")

    console.log("Seeding database...")
    await execAsync("npx prisma db seed")

    console.log("Database setup complete!")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

main()
