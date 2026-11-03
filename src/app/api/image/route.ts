import { createPropertyImage, updateProperty } from "@/services"
import { NextResponse } from "next/server"
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3"

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
const uploadFileToS3 = async (file: Buffer, filename: string) => {
	const key = `${Date.now()}-${filename}`
	const params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: key,
		Body: file,
		ContentType: "image/jpeg",
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
const getFileFromS3 = async (key: string) => {
	const { Body } = await getBucketClient().send(
		new GetObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME,
			Key: key,
		})
	)
	return Body?.transformToByteArray()
}

export async function POST(request: Request): Promise<NextResponse> {
	const { searchParams } = new URL(request.url)
	const propertyId = searchParams.get("propertyId")
	const ext = searchParams.get("type")
	const face = searchParams.get("face")

	if (request.body) {
		const buffer = Buffer.from(await request.arrayBuffer())
		const response = await uploadFileToS3(buffer, `file.${ext || "jpg"}`)

		const newImage = await createPropertyImage({
			name: response.filename,
			description: "",
			path: response.url,
			propertyId: parseInt(propertyId || "0"),
		})
		if (face == "1") {
			await updateProperty(parseInt(propertyId || "0"), {
				thumbnail: response.url,
			})
		}
		return NextResponse.json(response)
	}

	return NextResponse.json({ message: "nothing" })
}
