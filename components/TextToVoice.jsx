"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./TextToVoice.module.css";

export default function TextToVoice() {
	const [text, setText] = useState(""); // Holds the user's affirmation input
	const audioRef = useRef(null); // Ref for the AI voice audio element
	const backgroundRef = useRef(null); // Ref for the background music audio element

	// useEffect sets up cleanup and behavior after the AI voice finishes playing
	useEffect(() => {
		const voiceAudio = audioRef.current;
		const backgroundAudio = backgroundRef.current;

		// If refs are not ready, exit
		if (!voiceAudio || !backgroundAudio) return;

		// Pause and reset background music when AI voice ends
		const handleVoiceEnd = () => {
			backgroundAudio.pause();
			backgroundAudio.currentTime = 0; // Reset playback position
		};

		// Attach event listener to AI voice audio
		voiceAudio.addEventListener("ended", handleVoiceEnd);

		// Clean up event listener when component unmounts or updates
		return () => {
			voiceAudio.removeEventListener("ended", handleVoiceEnd);
		};
	}, []);

	// Called when user clicks "Play" button
	const handleClick = async () => {
		// Guard clause: make sure input is not empty
		if (!text.trim()) {
			alert("Please enter an affirmation.");
			return;
		}

		try {
			// Send POST request to your API with the user's affirmation
			const res = await fetch("/api/text-to-voice", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});

			// Handle API errors
			if (!res.ok) {
				const { error } = await res
					.json()
					.catch(() => ({ error: "Unexpected error" }));
				throw new Error(error);
			}

			// Convert response to a Blob (binary large object) for audio playback
			const audioBlob = await res.blob();
			const audioUrl = URL.createObjectURL(audioBlob); // Create a URL for the blob

			// Set AI voice audio and play it
			if (audioRef.current) {
				audioRef.current.src = audioUrl;
				audioRef.current.play();
			}

			// Reset and play background music at the same time
			if (backgroundRef.current) {
				backgroundRef.current.currentTime = 0; // Start from beginning
				backgroundRef.current.play();
			}

			// Clear the input after playing
			setText("");
		} catch (err) {
			console.error("Error:", err); // Log error to the console
		}
	};

	return (
		<div className={styles.container}>
			<h2>Positive Affirmations</h2>
			<div className={styles.row}>
				{/* Textarea for user input */}
				<textarea
					placeholder="Add your text"
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				{/* Play button triggers voice + background music */}
				<button onClick={handleClick}>Play</button>
			</div>
			{/* Hidden audio element for AI voice (shows controls for testing) */}
			<audio ref={audioRef} controls />
			{/* Hidden audio element for background music */}
			<audio ref={backgroundRef} src="/audio/morning-in-the-forest.mp3" />
		</div>
	);
}
