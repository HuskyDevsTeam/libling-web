import { useSyncExternalStore } from "react"

interface Dimensions {
	width: number | null
	height: number | null
}

const serverSnapshot: Dimensions = { width: null, height: null }
let current: Dimensions = serverSnapshot

function read(): Dimensions {
	if (typeof window === "undefined") return serverSnapshot
	if (current.width !== window.innerWidth || current.height !== window.innerHeight) {
		current = { width: window.innerWidth, height: window.innerHeight }
	}
	return current
}

function subscribe(onChange: () => void) {
	window.addEventListener("resize", onChange)
	return () => window.removeEventListener("resize", onChange)
}

export default function useWindowDimensions(): Dimensions {
	return useSyncExternalStore(subscribe, read, () => serverSnapshot)
}
