import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaPaperPlane, FaTimes, FaRobot, FaUser } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient'; // <--- Import API Client
import '../../styles/ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi là trợ lý ảo Building Manager. Bạn cần tìm thuê văn phòng ở khu vực nào?", sender: "bot" }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Xử lý gửi tin nhắn
    const handleSend = async () => {
        if (!inputText.trim()) return;

        // 1. Hiển thị tin nhắn của User ngay lập tức
        const userMsg = { id: Date.now(), text: inputText, sender: "user" };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true); // Hiện hiệu ứng "Bot đang nhập..."

        try {
            // 2. GỌI API BACKEND (Kết nối thật)
            // Lưu ý: Backend trả về String response trực tiếp
            const res = await axiosClient.post('/api/chat', { message: userMsg.text });

            // 3. Hiển thị phản hồi từ Server
            const botResponse = typeof res === 'string' ? res : res.data;
            const botMsg = { id: Date.now() + 1, text: botResponse, sender: "bot" };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg = {
                id: Date.now() + 1,
                text: "Hệ thống đang bảo trì, vui lòng gọi hotline 0912.345.678.",
                sender: "bot"
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false); // Tắt hiệu ứng nhập
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="chat-widget-wrapper">
            {/* Nút tròn nổi */}
            {!isOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                    <FaCommentDots />
                </button>
            )}

            {/* Cửa sổ Chat */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="header-info">
                            <FaRobot className="bot-avatar-icon" />
                            <span>Trợ Lý Ảo AI</span>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="chat-body">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-item ${msg.sender}`}>
                                {msg.sender === 'bot' && <div className="avatar small"><FaRobot /></div>}
                                <div className="message-bubble" style={{ whiteSpace: 'pre-line' }}>
                                    {/* pre-line giúp hiển thị xuống dòng \n từ backend */}
                                    {msg.text}
                                </div>
                                {msg.sender === 'user' && <div className="avatar small user"><FaUser /></div>}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="message-item bot">
                                <div className="avatar small"><FaRobot /></div>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-footer">
                        <input
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isTyping} // Chặn nhập khi bot chưa trả lời xong
                        />
                        <button onClick={handleSend} disabled={isTyping}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;