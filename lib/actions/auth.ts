"use server"

import { compare } from "bcrypt"

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword)
} 