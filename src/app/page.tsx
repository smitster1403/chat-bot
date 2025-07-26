'use client';

import { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      alert('Please enter a valid API key');
      return;
    }
    localStorage.setItem('openai-api-key', apiKey);
    setShowApiKeyInput(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem('openai-api-key');
    setApiKey('');
    setShowApiKeyInput(true);
    setMessages([]);
  };

  // Export conversation functionality
  const exportConversationAsJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      chatbot: "StockSage AI - Stock Market Analysis",
      totalMessages: messages.length,
      conversation: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stocksage-conversation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportConversationAsCSV = () => {
    const csvHeader = 'Role,Content,Timestamp\n';
    const csvContent = messages.map(msg => {
      const content = msg.content.replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${msg.role}","${content}","${msg.timestamp.toISOString()}"`;
    }).join('\n');
    
    const csvData = csvHeader + csvContent;
    const dataBlob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stocksage-conversation-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportConversationAsText = () => {
    const header = `StockSage AI - Stock Market Analysis Conversation
Export Date: ${new Date().toLocaleString()}
Total Messages: ${messages.length}
${'='.repeat(60)}\n\n`;

    const conversationText = messages.map(msg => {
      const timestamp = msg.timestamp.toLocaleString();
      const role = msg.role === 'user' ? 'YOU' : 'STOCKSAGE AI';
      return `[${timestamp}] ${role}:\n${msg.content}\n\n${'─'.repeat(40)}\n`;
    }).join('\n');

    const footer = `\n${'='.repeat(60)}\nEnd of conversation export from StockSage AI\nVisit: https://platform.openai.com for more AI tools`;
    
    const fullText = header + conversationText + footer;
    const dataBlob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stocksage-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyConversationToClipboard = async () => {
    const header = `StockSage AI - Stock Market Analysis Conversation
Export Date: ${new Date().toLocaleString()}
Total Messages: ${messages.length}
${'='.repeat(60)}\n\n`;

    const conversationText = messages.map(msg => {
      const timestamp = msg.timestamp.toLocaleString();
      const role = msg.role === 'user' ? 'YOU' : 'STOCKSAGE AI';
      return `[${timestamp}] ${role}:\n${msg.content}\n\n${'─'.repeat(40)}\n`;
    }).join('\n');

    const fullText = header + conversationText;
    
    try {
      await navigator.clipboard.writeText(fullText);
      alert('✅ Conversation copied to clipboard! You can now paste it anywhere.');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('❌ Failed to copy to clipboard. Please try downloading instead.');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !apiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend API
      });

      // Stock market focused system prompt
      const systemPrompt = `You are StockSage AI, a professional stock market analysis assistant specializing in financial insights and investment guidance. Your expertise includes:

- Technical analysis and chart patterns
- Fundamental analysis of companies
- Market trends and sector analysis  
- Risk assessment and portfolio management
- Economic indicators and their market impact
- Options trading strategies
- Dividend analysis and income investing

Always provide:
- Data-driven insights with reasoning
- Risk disclaimers when appropriate
- Multiple perspectives on investment decisions
- Clear explanations of financial concepts
- Current market context when relevant

Remember: You provide educational information and analysis, not personalized financial advice. Always remind users to consult with financial advisors and do their own research before making investment decisions.

Format your responses professionally with clear sections when analyzing stocks or market conditions.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: inputValue }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.choices[0]?.message?.content || 'No response received.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      let errorContent = 'Sorry, there was an error processing your request.';
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorContent = '⚠️ API quota exceeded. Please check your OpenAI billing and usage limits at platform.openai.com/usage. You may need to upgrade your plan or wait for your quota to reset.';
        } else if (error.message.includes('401')) {
          errorContent = '🔑 Invalid API key. Please check your API key and try again.';
        } else if (error.message.includes('timeout')) {
          errorContent = '⏱️ Request timed out. Please try again.';
        } else {
          errorContent = `❌ Error: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="api-key-container">
          <h1 className="api-key-title">
            📈 StockSage AI
          </h1>
          <p className="api-key-description">
            Your AI-powered stock market analysis assistant. Enter your OpenAI API key to access professional financial insights and market analysis.
          </p>
          <div className="form-group">
            <input
              type="password"
              placeholder="Enter your OpenAI API key (sk-...)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="form-input"
            />
          </div>
          <button
            onClick={saveApiKey}
            className="btn-primary"
          >
            Start Stock Analysis
          </button>
          <div className="api-instructions">
            <h3>How to get your API key:</h3>
            <ol>
              <li>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a></li>
              <li>2. Sign in or create an OpenAI account</li>
              <li>3. Click &ldquo;Create new secret key&rdquo;</li>
              <li>4. Copy the key and paste it above</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <h1>📈 StockSage AI <span className="subtitle">- Market Analysis</span></h1>
          <div className="header-actions">
            <div className="dropdown">
              <button 
                className={`dropdown-toggle ${messages.length === 0 ? 'disabled' : ''}`}
                disabled={messages.length === 0}
                title={messages.length === 0 ? 'Start a conversation to export' : `Export ${messages.length} messages`}
              >
                📥 Export Chat {messages.length > 0 && `(${messages.length})`}
              </button>
              {messages.length > 0 && (
                <div className="dropdown-menu">
                  <button onClick={copyConversationToClipboard} className="dropdown-item">
                    📋 Copy to Clipboard
                  </button>
                  <button onClick={exportConversationAsText} className="dropdown-item">
                    📄 Download as Text
                  </button>
                  <button onClick={exportConversationAsJSON} className="dropdown-item">
                    🔧 Download as JSON
                  </button>
                  <button onClick={exportConversationAsCSV} className="dropdown-item">
                    📊 Download as CSV
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={clearApiKey}
              className="btn-secondary"
            >
              🔑 Change API Key
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="messages-container">
          <div className="messages-wrapper">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h2>Welcome to StockSage AI</h2>
                <p>Ask me about stocks, market trends, technical analysis, or investment strategies!</p>
                <div className="quick-prompts">
                  <button 
                    onClick={() => setInputValue("What's your analysis of Apple (AAPL) stock?")}
                    className="quick-prompt-btn"
                  >
                    Analyze AAPL
                  </button>
                  <button 
                    onClick={() => setInputValue("What are the key market trends this week?")}
                    className="quick-prompt-btn"
                  >
                    Market Trends
                  </button>
                  <button 
                    onClick={() => setInputValue("Explain technical analysis basics")}
                    className="quick-prompt-btn"
                  >
                    Technical Analysis
                  </button>
                  <button 
                    onClick={() => setInputValue("What should I know about dividend investing?")}
                    className="quick-prompt-btn"
                  >
                    Dividend Investing
                  </button>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role}`}
              >
                <div className={`message-bubble ${message.role}`}>
                  <div className="message-content">{message.content}</div>
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="loading-message">
                <div className="loading-bubble">
                  <div className="loading-dots">
                    <div className="dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <span className="loading-text">Analyzing market data...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about stocks, market analysis, trading strategies... (Press Enter to send)"
              className="message-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
            >
              📊 Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
