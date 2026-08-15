import { NextResponse } from 'next/server'
import { coletarStatus } from '@/lib/status'

export const dynamic = 'force-dynamic'

/** Health check em JSON, para monitoração externa. */
export async function GET() {
  const status = await coletarStatus()
  return NextResponse.json(status, {
    status: status.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
