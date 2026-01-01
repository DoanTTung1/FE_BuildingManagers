import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBan, FaHome } from 'react-icons/fa';
import '../../styles/ForbiddenPage.css'; // Đảm bảo import CSS đúng đường dẫn

const ForbiddenPage = () => {
    const navigate = useNavigate();

    return (
        <div className="forbidden-container">
            <div className="forbidden-content">
                <div className="forbidden-icon">
                    <FaBan />
                </div>

                <h1 className="forbidden-title">403 - KHÔNG CÓ QUYỀN TRUY CẬP</h1>

                <p className="forbidden-message">
                    Xin lỗi, tài khoản của bạn không có quyền truy cập vào trang quản trị này.<br />
                    Vui lòng liên hệ Admin nếu bạn nghĩ đây là một sự nhầm lẫn.
                </p>

                <div className="forbidden-actions">
                    <button onClick={() => navigate('/')} className="forbidden-button">
                        <FaHome />
                        Về Trang Chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForbiddenPage;