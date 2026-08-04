import { NextRequest, NextResponse } from "next/server"
import { getPresignedUploadUrl, R2_PUBLIC_URL } from "@/lib/r2"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const ALLOWED_DOC_TYPES = ["application/pdf"]
const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_DOC_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize, key } = await request.json()

    if (!fileName || !fileType || !key) {
      return NextResponse.json({ error: "fileName, fileType, dan key wajib diisi" }, { status: 400 })
    }

    if (!ALL_ALLOWED.includes(fileType)) {
      return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType)
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
    if (fileSize > maxSize) {
      return NextResponse.json({ error: `Ukuran file maksimal ${Math.round(maxSize / (1024 * 1024))}MB` }, { status: 400 })
    }

    const uploadUrl = await getPresignedUploadUrl(key, fileType)
    const publicUrl = `${R2_PUBLIC_URL}/${key}`

    return NextResponse.json({ uploadUrl, key, publicUrl })
  } catch (error) {
    console.error("POST /api/uploads/sign error:", error)
    return NextResponse.json({ error: "Gagal membuat upload URL" }, { status: 500 })
  }
}
