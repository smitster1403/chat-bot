# AI Chat Bot

A professional, responsive chat interface built with Next.js, React, and TypeScript that allows users to have conversations with OpenAI's GPT models using their own API key.

## Features

- 🔐 **Secure API Key Storage**: API keys are stored locally in the browser using localStorage
- 💬 **Real-time Chat Interface**: Clean, professional chat UI with message history
- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ⚡ **Fast Performance**: Built with Next.js 15 and React 19
- 🎯 **TypeScript**: Fully typed for better development experience
- 🎭 **Professional UI**: Modern design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- An OpenAI API key (get one at [OpenAI Platform](https://platform.openai.com/api-keys))

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in or create an OpenAI account
3. Click "Create new secret key"
4. Give it a name (e.g., "Chat Bot App")
5. Copy the generated key (it starts with `sk-`)
6. Paste it into the app when prompted

## How to Use

1. **First Time Setup**: When you first open the app, you'll see an API key input screen
2. **Enter API Key**: Paste your OpenAI API key and click "Save API Key & Start Chatting"
3. **Start Chatting**: Begin typing your messages in the input field at the bottom
4. **Send Messages**: Press Enter or click the Send button to send messages
5. **View Responses**: The AI will respond in real-time with helpful answers

### Security Features

- ✅ API keys are stored only in your browser's localStorage
- ✅ Keys are never sent to any server except OpenAI's API
- ✅ You can change or remove your API key at any time
- ✅ All communication is direct between your browser and OpenAI

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout with fonts and metadata
    page.tsx           # Main chat interface component
    globals.css        # Global styles with Tailwind CSS
```

## Key Technologies

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with hooks and modern features
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **OpenAI SDK**: Official OpenAI JavaScript client

## API Usage

The app uses OpenAI's Chat Completions API with the following configuration:

- **Model**: `gpt-3.5-turbo` (fast and cost-effective)
- **Max Tokens**: 500 (controls response length)
- **Context**: Maintains conversation history for coherent dialogue

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization

You can easily customize the chat bot by:

1. **Changing the AI Model**: Edit the `model` parameter in `page.tsx`
2. **Adjusting Response Length**: Modify the `max_tokens` parameter
3. **Styling**: Update Tailwind classes or add custom CSS
4. **Adding Features**: Extend the component with new functionality

## Important Notes

### Browser-Side API Calls

This implementation makes API calls directly from the browser using `dangerouslyAllowBrowser: true`. This is acceptable for personal use but for production applications, consider:

1. Creating a backend API route to proxy OpenAI requests
2. Implementing proper authentication and rate limiting
3. Using environment variables for additional security

### Cost Considerations

- Each message costs a small amount based on OpenAI's pricing
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)
- Set up billing alerts to avoid unexpected charges

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your API key starts with `sk-` and has sufficient credits
2. **Network Error**: Check your internet connection and firewall settings
3. **Blank Responses**: Verify your API key has proper permissions

### Getting Help

- Check the browser console for error messages
- Verify your API key at [OpenAI Platform](https://platform.openai.com)
- Ensure you have billing set up with OpenAI

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this chat bot!
