#!/usr/bin/env node
/**
 * Admin Setup Script
 * 
 * This script helps set up an admin user for the Clinical Evaluation System.
 * Usage: npm run setup-admin --email=admin@example.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupAdmin() {
  const args = process.argv.slice(2)
  const emailArg = args.find(arg => arg.startsWith('--email='))
  
  if (!emailArg) {
    console.error('❌ Error: Please provide an admin email')
    console.error('Usage: npm run setup-admin -- --email=admin@example.com')
    process.exit(1)
  }

  const email = emailArg.replace('--email=', '').trim()

  if (!email.includes('@')) {
    console.error('❌ Error: Invalid email format')
    process.exit(1)
  }

  try {
    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Create new admin user
      user = await prisma.user.create({
        data: {
          email,
          name: 'System Administrator',
          role: 'ADMIN',
          clerkId: `pending_${Date.now()}`, // Will be updated when user first signs in
        },
      })
      console.log(`✅ New admin user created: ${email}`)
    } else if (user.role === 'ADMIN') {
      console.log(`✅ User ${email} is already an admin`)
    } else {
      // Update existing user to admin
      user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      })
      console.log(`✅ User ${email} has been promoted to admin`)
    }

    console.log(`
Admin Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${user.email}
Role: ${user.role}
ID: ${user.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
1. Sign in with ${email} at /sign-in
2. Your account will be automatically linked to Clerk
3. You'll have access to the Admin Panel at /admin
4. Use the admin panel to manage students and assessors
    `)
  } catch (error) {
    console.error('❌ Error setting up admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdmin()
