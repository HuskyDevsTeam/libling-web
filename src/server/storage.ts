import { S3Client, PutObjectCommand, GetObjectCommand, type PutObjectCommandInput } from "@aws-sdk/client-s3"

/**
 * Almacenamiento de objetos compatible con S3. Hoy AWS S3; para Cloudflare R2 basta con definir
 *   S3_ENDPOINT=https://<cuenta>.r2.cloudflarestorage.com  S3_REGION=auto  S3_PUBLIC_URL=https://<dominio publico>
 * y cambiar IMAGE_HOST al host publico. Sin ese codigo propio: es el mismo SDK.
 * Sin dependencias de Next para poder usarlo desde scripts.
 */
let client: S3Client | undefined
function getClient() {
	return (client ??= new S3Client({
		region: process.env.S3_REGION || "",
		endpoint: process.env.S3_ENDPOINT || undefined,
		forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
		credentials: { accessKeyId: process.env.S3_ACCESS_KEY || "", secretAccessKey: process.env.S3_SECRET_KEY || "" },
	}))
}

export function publicUrl(key: string): string {
	const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "")
	if (base) return `${base}/${key}`
	return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
}

/** Clave dentro del bucket a partir de una URL publica (null si no es de este bucket). */
export function keyFromUrl(url: string): string | null {
	try {
		const u = new URL(url)
		const base = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null
		if (base && u.origin === base.origin) return decodeURIComponent(u.pathname.slice(base.pathname.replace(/\/$/, "").length + 1))
		if (u.hostname.startsWith(`${process.env.S3_BUCKET_NAME}.s3.`)) return decodeURIComponent(u.pathname.slice(1))
		return null
	} catch {
		return null
	}
}

export async function putObject(key: string, body: Buffer, contentType: string, extra: Partial<PutObjectCommandInput> = {}) {
	await getClient().send(
		new PutObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME,
			Key: key,
			Body: body,
			ContentType: contentType,
			// Las versiones WebP llevan el timestamp y un UUID en el nombre: no cambian nunca, se pueden cachear un año
			CacheControl: "public, max-age=31536000, immutable",
			...extra,
		})
	)
	return publicUrl(key)
}

export async function getObject(key: string): Promise<Buffer> {
	const res = await getClient().send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }))
	return Buffer.from(await res.Body!.transformToByteArray())
}
