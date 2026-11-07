import { useState, useEffect } from "react"

export default function useWindowDimensions() {
	const hasWindow = typeof window !== "undefined"
	
	function getWindowDimensions() {
		const width = hasWindow ? window.innerWidth : null
		const height = hasWindow ? window.innerHeight : null
		return {
			width,
			height,
		}
	}

	const [windowDimensions, setWindowDimensions] = useState(
		getWindowDimensions()
	)
	function handleResize() {
		setWindowDimensions(getWindowDimensions())
	}

	useEffect(() => {
		if (hasWindow) {
			handleResize()
			window.addEventListener("DOMContentLoaded", handleResize)
			window.addEventListener("resize", handleResize)
			return () => window.removeEventListener("resize", handleResize)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps -- el efecto se ejecuta solo cuando cambian estas dependencias a proposito
	}, [hasWindow])


	return windowDimensions
}
