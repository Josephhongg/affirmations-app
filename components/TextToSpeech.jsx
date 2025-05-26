"use client";

import { useState, useRef } from "react";
import styles from "./TextToSpeech.module.css";

export default function TextToSpeech() {
	// State for the text input
	const [text, setText] = useState("");
	// State to indicate loading status
	const [loading, setLoading] = useState(false);
	// State to store error messages
	const [error, setError] = useState("");
	// Ref to access the audio element directly
	const audioRef = useRef(null);

	// Handles the Play button click event
	const handlePlay = async () => {
		// If input is empty, show error and exit
		if (!text.trim()) {
			setError("Please enter an affirmation.");
			return;
		}

		setLoading(true); // Show loading state
		setError(""); // Clear previous errors

		try {
			// Send POST request to API with the input text
			const res = await fetch("/api/text-to-speech", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});

			// If response is not OK, extract and throw error
			if (!res.ok) {
				const { error } = await res
					.json()
					.catch(() => ({ error: "Unexpected error" }));
				throw new Error(error);
			}

			// Get audio data as a Blob and create a URL for it
			const audioBlob = await res.blob();
			const audioUrl = URL.createObjectURL(audioBlob);

			// Set the audio element's source and play the audio
			if (audioRef.current) {
				audioRef.current.src = audioUrl;
				audioRef.current.play();
			}

			setText(""); // Clear the textbox after playing
		} catch (err) {
			console.error("Playback error:", err);
			setError(err.message || "Something went wrong.");
		} finally {
			setLoading(false); // Reset loading state
		}
	};

	return (
		<div className={styles.container}>
			{/* Textarea for user to input affirmation */}
			<textarea
				className={styles.textbox}
				placeholder="Type your affirmation here..."
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			{/* Button to trigger text-to-speech */}
			<button className={styles.button} onClick={handlePlay} disabled={loading}>
				{loading ? "Loading..." : "Play Voice"}
			</button>
			{/* Display error message if any */}
			{error && <p className={styles.error}>{error}</p>}
			{/* Audio player to play the generated speech */}
			<audio ref={audioRef} className={styles.audio} controls />
		</div>
	);
}

