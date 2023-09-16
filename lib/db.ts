import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// ! To prevent hot reloading from happening
// ? Hot reloading is something that happens when a component renders or changes
// * To prevent this from happening a global instance is created for development 
// * and everytime a component re-renders this global instance is used instead of 
// * creating a new Client() every single time

export const db = globalThis.prisma || new PrismaClient()
if(process.env.NODE_ENV !== 'production') globalThis.prisma = db
