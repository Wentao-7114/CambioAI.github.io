import React, { useState, useRef, useEffect } from 'react';
import './ExtractFullContentChatbot.css';
import { useFileContext } from '../FileContext';  // This would be the custom hook to access the context

interface Message {
    text: string;
    isUser: boolean;
}

const ExtractFullContentChatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const { ExtractQAPostServer } = useFileContext();


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = { text: inputText, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        setTimeout(scrollToBottom, 0);


        ExtractQAPostServer(inputText).then(response => {
            const botReply: Message = {
                text: response,
                isUser: false
            };
            setIsTyping(false);
            setMessages(prev => [...prev, botReply]);
        });

        setInputText('');
    };

    const scrollToBottom = () => {
        const messagesContainer = messagesEndRef.current?.parentElement;
        if (!messagesContainer) return;
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        const messagesContainer = messagesEndRef.current?.parentElement;
        if (!messagesContainer) return;

        const isScrolledToBottom =
            messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 100; // adding small buffer

        if (isScrolledToBottom) {
            scrollToBottom();
        }
    }, [messages, isTyping]);

    return (
        <div className="chatbot-container">
            <h2>Chat</h2>
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
                    >
                        {message.text}
                    </div>
                ))}
                {isTyping && (
                    <div className="message bot-message typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="input-form">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                />
                <button type="submit" className="send-button">
                    Send
                </button>
            </form>
        </div>
    );
};

export default ExtractFullContentChatbot;