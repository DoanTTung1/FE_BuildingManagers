import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaPaperPlane, FaTimes, FaRobot } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../styles/ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    // State tin nhắn mẫu ban đầu
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! 👋\nTôi là trợ lý ảo của Elite Homes.\nTôi có thể giúp bạn tìm văn phòng theo Giá hoặc Khu vực.", sender: "bot" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), text: inputText, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true);

        try {
            const res = await axiosClient.post('/api/chat', { message: userMsg.text });
            const botResponse = typeof res === 'string' ? res : res.data; // Xử lý tùy format trả về
            const botMsg = { id: Date.now() + 1, text: botResponse, sender: "bot" };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "⚠️ Hệ thống đang quá tải, vui lòng thử lại sau.",
                sender: "bot"
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="chat-widget-wrapper">
            {/* Toggle Button */}
            {!isOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                    <FaCommentDots />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header hiện đại với Status Online */}
                    <div className="chat-header">
                        <div className="header-info">
                            <div className="bot-avatar-icon">
                                <FaRobot />
                            </div>
                            <div className="header-text">
                                <h3>Trợ Lý AI</h3>
                                <span>● Đang hoạt động</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="chat-body">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-item ${msg.sender}`}>
                                {msg.sender === 'bot' && (
                                    <div className="avatar small">
                                        <FaRobot />
                                    </div>
                                )}
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Hiệu ứng Typing 3 chấm mượt mà */}
                        {isTyping && (
                            <div className="message-item bot">
                                <div className="avatar small">
                                    <FaRobot />
                                </div>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div className="chat-footer">
                        <input
                            type="text"
                            placeholder="Nhập yêu cầu của bạn..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isTyping}
                            autoFocus
                        />
                        <button onClick={handleSend} disabled={isTyping || !inputText.trim()}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;