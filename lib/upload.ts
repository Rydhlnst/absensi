const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const ALLOWED_DOC_TYPES = ["application/pdf"]
const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_DOC_SIZE = 10 * 1024 * 1024

function getExt(file: File): string {
  const parts = file.name.split(".")
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "bin"
}

function validateFile(file: File, category: string): void {
  if (!ALL_ALLOWED.includes(file.type)) {
    throw new Error("Tipe file tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau PDF.")
  }
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE
  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024))
    throw new Error(`Ukuran file maksimal ${maxMb}MB`)
  }
  if (!/^[a-z0-9_-]+$/i.test(category)) {
    throw new Error("Kategori upload tidak valid")
  }
}

export async function uploadToR2(file: File, category: string): Promise<string> {
  validateFile(file, category)

  const ext = getExt(file)
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const key = `${category}/${timestamp}-${random}.${ext}`

  const signRes = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      key,
    }),
  })

  if (!signRes.ok) {
    const err = await signRes.json().catch(() => null)
    throw new Error(err?.error || "Gagal mendapatkan upload URL")
  }

  const { uploadUrl, publicUrl } = await signRes.json()

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  })

  if (!uploadRes.ok) {
    throw new Error("Gagal mengupload file ke storage")
  }

  return publicUrl
}

export async function uploadMultipleToR2(
  files: File[],
  category: string
): Promise<string[]> {
  const results = await Promise.all(
    files.map((file) => uploadToR2(file, category))
  )
  return results
}
