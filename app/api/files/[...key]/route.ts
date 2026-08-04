import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getR2Client, R2_BUCKET } from "@/lib/r2"

// Streams an object from R2 through the app's own origin so browsers never have
// to reach the r2.dev public domain (which is DNS-blocked on Indonesian ISPs).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params
  const objectKey = key.map((seg) => decodeURIComponent(seg)).join("/")

  try {
    const client = getR2Client()
    const obj = await client.send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: objectKey })
    )

    if (!obj.Body) {
      return new NextResponse("Not found", { status: 404 })
    }

    const bytes = await obj.Body.transformToByteArray()

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": obj.ContentType || "application/octet-stream",
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
