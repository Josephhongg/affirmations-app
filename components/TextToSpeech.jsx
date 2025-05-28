"use client";

import { useState, useRef } from "react";
import styles from "./TextToSpeech.module.css";

// TextToSpeech component allows users to input text and play it as speech
export default function TextToSpeech() {
	// State to hold the user's input text
	const [text, setText] = useState("");
	// State to indicate if the request is loading
	const [loading, setLoading] = useState(false);
	// State to hold any error messages
	const [error, setError] = useState("");
	// Ref to access the audio element directly
	const audioRef = useRef(null);

	// Handles the play button click event
	const handlePlay = async () => {
		// If input is empty, show error and return
		if (!text.trim()) {
			setError("Please enter an affirmation.");
			return;
		}

		setLoading(true); // Set loading state
		setError(""); // Clear previous errors

		try {
			// Send POST request to API with the input text
			const res = await fetch("/api/text-to-speech", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});
			console.log(res);

			// If response is not OK, extract and throw error
			if (!res.ok) {
				const { error } = await res
					.json()
					.catch(() => ({ error: "Unexpected error" }));
				throw new Error(error);
			}

			// Get audio data from response as a Blob
			const audioBlob = await res.blob();
			// Create a URL for the audio Blob
			const audioUrl = URL.createObjectURL(audioBlob);

			// If audio element exists, set its source and play
			if (audioRef.current) {
				audioRef.current.src = audioUrl;
				audioRef.current.play();
			}

			setText(""); // Clear the input text after playing
		} catch (err) {
			// Log and display any errors
			console.error("Playback error:", err);
			setError(err.message || "Something went wrong.");
		} finally {
			setLoading(false); // Reset loading state
		}
	};

	return (
		<div className={styles.container}>
			<div>
				{/* Textarea for user to input affirmation */}
				<textarea
					className={styles.textbox}
					placeholder="Type your affirmation here..."
					value={text}
					onChange={(e) => setText(e.target.value)}
					rows={5}
					cols={50}
				/>
			</div>

			<div>
				{/* Button to trigger text-to-speech */}
				<button
					className={styles.button}
					onClick={handlePlay}
					disabled={loading}
				>
					{loading ? "Loading..." : "Play Voice"}
				</button>
				{/* Display error message if any */}
				{error && <p className={styles.error}>{error}</p>}
				{/* Audio player to play the generated speech */}
				<audio ref={audioRef} className={styles.audio} controls />
			</div>
		</div>
	);
}
