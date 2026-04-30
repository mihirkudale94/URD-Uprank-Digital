import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with API Key from .env.local
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
       console.log("Simulating email send (no API key configured):", data);
       return NextResponse.json({ success: true, message: "System Note: Email simulated. Configure RESEND_API_KEY to send real emails." });
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: "Uprank Digital <onboarding@resend.dev>", // Replace with verified domain e.g. info@uprankdigital.com
      to: ["aaaraha@gmail.com", "sachin@uprankdigital.com"],
      subject: `New Website Inquiry from ${data.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Business:</strong> ${data.business || 'N/A'}</p>
        <p><strong>URL:</strong> ${data.url || 'N/A'}</p>
        <p><strong>Services Needed:</strong> ${data.services ? data.services.join(", ") : 'N/A'}</p>
        <br/>
        <h3>Message:</h3>
        <p>${data.message}</p>
      `,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
