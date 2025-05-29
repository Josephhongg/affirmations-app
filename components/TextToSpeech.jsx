"use client";

import { useState, useRef } from "react";
import styles from "./TextToSpeech.module.css";

// TextToSpeech component allows users to input text and play it as speech
export default function TextToSpeech() {
	// State to hold the user's input text
	const [text, setText] = useState("");
	// Ref to access the audio element directly
	const audioRef = useRef(null);

	// Handles the play button click event
	const handleClick = async () => {
		// If input is empty, show error and return
		if (!text.trim()) {
			setError("Please enter an affirmation.");
			return;
		}

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
			console.log(err);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.affirmationsApp}>
				<h2>Affirmations App</h2>
				<div className={styles.row}>
					<textarea
						placeholder="Add your text"
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
					<button onClick={handleClick}>Play</button>
				</div>
				<audio ref={audioRef} controls />
			</div>
		</div>
	);
}
