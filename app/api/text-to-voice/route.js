// app/api/text-to-speech/route.js
export async function POST(req) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  try {
    const { text } = await req.json();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "audio/mpeg",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
      }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to generate speech.";
      try {
        const errData = await response.json();
        errorMessage = errData?.error?.message || errData?.message || errorMessage;
      } catch (parseErr) {
        console.error("Failed to parse error response:", parseErr);
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    });
  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
