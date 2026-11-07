import sharp from "sharp"

/**
 * Conversion de fotos a WebP. Sin dependencias de Next: lo usan la subida (API) y el script que
 * convierte las fotos que ya estaban guardadas.
 *  - "large": para la ficha, maximo 1920 px por el lado largo, calidad 80.
 *  - "thumb": para listados, tarjetas y galeria, maximo 480 px, calidad 75.
 * Se corrige la orientacion EXIF y se descartan los metadatos (ubicacion GPS, camara, etc.).
 */
export const LARGE_SIZE = 1920
export const THUMB_SIZE = 480
// Defensa frente a "bombas de descompresion": una imagen diminuta en disco con miles de millones de pixeles
const MAX_INPUT_PIXELS = 80_000_000

export interface ProcessedImage {
	buffer: Buffer
	width: number
	height: number
}

async function variant(input: Buffer, size: number, quality: number): Promise<ProcessedImage> {
	const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
		.rotate()
		.resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
		.webp({ quality, effort: 4 })
		.toBuffer({ resolveWithObject: true })
	return { buffer: data, width: info.width, height: info.height }
}

export async function processImage(input: Buffer): Promise<{ large: ProcessedImage; thumb: ProcessedImage }> {
	const [large, thumb] = await Promise.all([variant(input, LARGE_SIZE, 80), variant(input, THUMB_SIZE, 75)])
	return { large, thumb }
}
