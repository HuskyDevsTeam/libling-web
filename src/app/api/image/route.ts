import { createPropertyImage, showProperty, updateProperty } from "@/server/data"
import { requireAdmin, UnauthorizedError } from "@/server/guard"
import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Se crea bajo demanda: en el build de Docker no hay variables de entorno
let _bucketClient: S3Client | undefined
const getBucketClient = () =>
	(_bucketClient ??= new S3Client({
		region: process.env.S3_REGION || "",
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY || "",
			secretAccessKey: process.env.S3_SECRET_KEY || "",
		},
	}))
const uploadFileToS3 = async (file: Buffer, filename: string, contentType: string) => {
	const key = `${Date.now()}-${randomUUID()}-${filename}`
	const params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: key,
		Body: file,
		ContentType: contentType,
	}
	const command = new PutObjectCommand(params)
	await getBucketClient().send(command)
	const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
	const response = {
		filename: key,
		url,
	}
	return response
}
const MAX_BYTES = 15 * 1024 * 1024

// Tipo real del archivo por sus primeros bytes (no se fia de la extension ni de la cabecera del cliente)
const detectImage = (b: Buffer): { ext: string; mime: string } | null => {
	if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" }
	if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" }
	if (b.length > 12 && b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return { ext: "webp", mime: "image/webp" }
	return null
}

const json = (message: string, status: number) => NextResponse.json({ message }, { status })

export async function POST(request: Request): Promise<NextResponse> {
	try {
		await requireAdmin()
	} catch (e) {
		if (e instanceof UnauthorizedError) return json("Unauthorized", 401)
		throw e
	}
	const { searchParams } = new URL(request.url)
	const propertyId = Number(searchParams.get("propertyId"))
	const face = searchParams.get("face")
	if (!Number.isInteger(propertyId) || propertyId <= 0) return json("Invalid propertyId", 400)
	if (!request.body) return json("Empty body", 400)
	if (Number(request.headers.get("content-length") || 0) > MAX_BYTES) return json("File too large", 413)

	const buffer = Buffer.from(await request.arrayBuffer())
	if (buffer.length === 0 || buffer.length > MAX_BYTES) return json("File too large", 413)
	const image = detectImage(buffer)
	if (!image) return json("Unsupported image type", 415)
	if (!(await showProperty({ id: propertyId }))) return json("Property not found", 404)

	const response = await uploadFileToS3(buffer, `file.${image.ext}`, image.mime)
	await createPropertyImage({
		name: response.filename,
		description: "",
		path: response.url,
		propertyId,
	})
	if (face == "1") {
		await updateProperty(propertyId, { thumbnail: response.url })
	}
	return NextResponse.json(response)
}
