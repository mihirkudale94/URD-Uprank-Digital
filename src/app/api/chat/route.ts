import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are the AI Concierge for Uprank Digital, a premier digital agency. 
                  Company Info: 
                  - Founder: Sachin Raje.
                  - Services: Digital Transformation (Web/App), Marketing (SEO, Social), Advertising, Content, Software.
                  - Location: Pune (Karve Nagar & Paud Road).
                  - Philosophy: Ask, Think, Create, Repeat.
                  - Mission: High quality, value for money, transparency.
                  
                  Guidelines: 
                  - Be professional, helpful, and concise. 
                  - Use the company's "Creating Spark" tone.
                  - If someone asks to contact, refer them to the contact form or info@uprankdigital.com.
                  - User message: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I'm having trouble connecting right now. Please try again or contact us directly!";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
