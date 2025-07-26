import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, you'd use a database like MongoDB, PostgreSQL, etc.
const sharedConversations = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, title } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages data' }, { status: 400 });
    }

    // Generate a unique share ID
    const shareId = generateShareId();
    
    // Store the conversation
    const conversationData = {
      id: shareId,
      title: title || 'StockSage AI Conversation',
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      createdAt: new Date().toISOString(),
      totalMessages: messages.length
    };

    sharedConversations.set(shareId, conversationData);

    // Return the shareable URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : request.nextUrl.origin;
    
    const shareUrl = `${baseUrl}/shared/${shareId}`;

    return NextResponse.json({ 
      success: true, 
      shareId, 
      shareUrl,
      expiresIn: '30 days' // You can implement expiration logic
    });

  } catch (error) {
    console.error('Error creating shared conversation:', error);
    return NextResponse.json({ error: 'Failed to create shared conversation' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const shareId = url.searchParams.get('id');

  if (!shareId) {
    return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
  }

  const conversation = sharedConversations.get(shareId);

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
