// src/pages/news/NewsDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FaCalendarAlt, FaUser, FaFacebookF, FaTwitter, FaLinkedinIn, 
    FaArrowLeft, FaClock, FaShareAlt, FaBookmark 
} from 'react-icons/fa';
import { NEWS_DATA } from '../../data/newsData';
import './NewsDetail.css'; // Đổi tên file CSS riêng cho trang chi tiết để dễ quản lý

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const news = NEWS_DATA.find(item => item.id === parseInt(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!news) return (
        <div className="news-error-container">
            <h2>Không tìm thấy bài viết</h2>
            <button onClick={() => navigate('/news')}>Quay về trang tin</button>
        </div>
    );

    const relatedNews = NEWS_DATA.filter(item => item.category === news.category && item.id !== news.id).slice(0, 3);

    // Tính thời gian đọc giả định (số từ / 200)
    const wordCount = news.content.split(' ').length + news.summary.split(' ').length;
    const readTime = Math.ceil(wordCount / 100) + 1; // Giả định đọc nhanh

    return (
        <div className="article-page">
            {/* 1. PROGRESS BAR (Thanh tiến trình đọc - Optional) */}
            <div className="scroll-progress"></div>

            <div className="article-container">
                {/* 2. HEADER SECTION (Tiêu đề lớn) */}
                <header className="article-header">
                    <div className="breadcrumb">
                        <span onClick={() => navigate('/news')}>Tin tức</span> 
                        <span className="separator">/</span> 
                        <span className="current">{news.category}</span>
                    </div>

                    <h1 className="article-title">{news.title}</h1>
                    <p className="article-excerpt">{news.summary}</p>

                    <div className="article-meta-row">
                        <div className="author-block">
                            <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt={news.author} />
                            <div className="author-text">
                                <span className="author-name">{news.author}</span>
                                <div className="meta-sub">
                                    <span className="date">{news.date}</span>
                                    <span className="dot">•</span>
                                    <span className="read-time"><FaClock /> {readTime} phút đọc</span>
                                </div>
                            </div>
                        </div>

                        <div className="action-block">
                            <button className="icon-btn" title="Lưu bài viết"><FaBookmark /></button>
                            <button className="icon-btn" title="Chia sẻ"><FaShareAlt /></button>
                        </div>
                    </div>
                </header>

                {/* 3. HERO IMAGE */}
                <figure className="article-hero">
                    <img src={news.image} alt={news.title} />
                    <figcaption>Ảnh minh họa: Dự án thực tế tại Bình Dương</figcaption>
                </figure>

                <div className="article-body-wrapper">
                    {/* 4. MAIN CONTENT */}
                    <div className="article-main">
                        <div className="content-render" dangerouslySetInnerHTML={{ __html: news.content }} />
                        
                        {/* Dummy Text để bài viết dài ra cho đẹp (Demo) */}
                        <div className="dummy-content">
                            <p>Ngoài ra, các chuyên gia cũng nhận định rằng thị trường đang bước vào giai đoạn thanh lọc mạnh mẽ. Những chủ đầu tư có tiềm lực tài chính yếu kém sẽ dần bị loại bỏ, nhường sân chơi cho các đơn vị uy tín với pháp lý minh bạch.</p>
                            <blockquote>
                                "Đầu tư bất động sản năm 2026 không dành cho những người thích lướt sóng. Đây là cuộc chơi của tầm nhìn dài hạn và giá trị thực."
                            </blockquote>
                            <p>Do đó, người mua nhà cần hết sức cẩn trọng trong việc xem xét hồ sơ pháp lý, tiến độ xây dựng và uy tín của chủ đầu tư trước khi xuống tiền.</p>
                        </div>

                        <div className="article-tags">
                            <span>#BấtĐộngSản</span>
                            <span>#KinhTế2026</span>
                            <span>#{news.category}</span>
                        </div>

                        <div className="author-box-footer">
                            <div className="ab-avatar">
                                <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Author" />
                            </div>
                            <div className="ab-info">
                                <h4>Viết bởi {news.author}</h4>
                                <p>Chuyên gia phân tích thị trường tại EliteHomes với 5 năm kinh nghiệm trong lĩnh vực Bất động sản cao cấp.</p>
                            </div>
                        </div>
                    </div>

                    {/* 5. STICKY SIDEBAR */}
                    <aside className="article-sidebar">
                        <div className="sidebar-widget">
                            <h3 className="widget-title">Bài viết liên quan</h3>
                            <div className="related-list">
                                {relatedNews.map(item => (
                                    <div key={item.id} className="related-card" onClick={() => navigate(`/news/${item.id}`)}>
                                        <div className="rc-img">
                                            <img src={item.image} alt={item.title} />
                                        </div>
                                        <div className="rc-info">
                                            <h5>{item.title}</h5>
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-widget newsletter">
                            <h3>Đừng bỏ lỡ tin hot!</h3>
                            <p>Nhận bản tin thị trường BĐS hàng tuần.</p>
                            <input type="email" placeholder="Email của bạn..." />
                            <button>Đăng Ký Ngay</button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;