'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SharedConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  totalMessages: number;
}

export default function SharedConversation() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [conversation, setConversation] = useState<SharedConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      fetchSharedConversation(shareId);
    }
  }, [shareId]);

  const fetchSharedConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/share?id=${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('This shared conversation could not be found. It may have expired or been removed.');
        } else {
          setError('Failed to load the shared conversation. Please try again.');
        }
        return;
      }

      const data = await response.json();
      setConversation(data);
    } catch (err) {
      console.error('Error fetching shared conversation:', err);
      setError('Failed to load the shared conversation. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('✅ Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('❌ Failed to copy link. Please copy it manually from the address bar.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="chat-container">
          <div className="messages-container">
            <div className="messages-wrapper">
              <div className="empty-state">
                <div className="empty-state-icon">⏳</div>
                <h2>Loading Shared Conversation...</h2>
                <p>Please wait while we fetch the conversation data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="chat-container">
          <div className="messages-container">
            <div className="messages-wrapper">
              <div className="empty-state">
                <div className="empty-state-icon">❌</div>
                <h2>Conversation Not Found</h2>
                <p>{error}</p>
                <div style={{ marginTop: '24px' }}>
                  <Link href="/" className="quick-prompt-btn">
                    🏠 Go to StockSage AI
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <h1>📈 StockSage AI <span className="subtitle">- Shared Analysis</span></h1>
          <div className="header-actions">
            <button
              onClick={copyShareLink}
              className="btn-secondary"
            >
              🔗 Copy Link
            </button>
            <Link href="/" className="btn-secondary">
              🏠 New Chat
            </Link>
          </div>
        </header>

        {/* Conversation Info */}
        <div className="shared-info">
          <div className="shared-info-content">
            <h3>📊 {conversation.title}</h3>
            <div className="shared-meta">
              <span>🗓️ Shared on {formatDate(conversation.createdAt)}</span>
              <span>💬 {conversation.totalMessages} messages</span>
              <span>👁️ Read-only view</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          <div className="messages-wrapper">
            {conversation.messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
              >
                <div className={`message-bubble ${message.role}`}>
                  <div className="message-content">{message.content}</div>
                  <div className="message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Read-only Footer */}
        <div className="shared-footer">
          <div className="shared-footer-content">
            <p>
              📖 This is a read-only view of a StockSage AI conversation. 
              <Link href="/" className="footer-link">Start your own analysis →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
