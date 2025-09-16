import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Debug environment variables
    console.log('Agent ID:', process.env.NEXT_PUBLIC_AGENT_ID);
    console.log('API Key exists:', !!process.env.ELEVENLABS_API_KEY);
    
    if (!process.env.NEXT_PUBLIC_AGENT_ID) {
      throw new Error('NEXT_PUBLIC_AGENT_ID environment variable is not set');
    }
    
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${process.env.NEXT_PUBLIC_AGENT_ID}`,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error('Error in get-signed-url:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}
