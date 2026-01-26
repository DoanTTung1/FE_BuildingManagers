// src/pages/news/NewsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaArrowRight, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { NEWS_DATA } from '../../data/newsData';
import './News.css';

const NewsPage = () => {
    const navigate = useNavigate();
    
    // --- STATE ---
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Số bài viết mỗi trang (Grid 3x2)

    const categories = [
        'All', 'Thị Trường', 'Đầu Tư', 'Quy Hoạch', 'Pháp Lý', 
        'Kiến Trúc', 'Phong Thủy', 'Phân Tích', 'Xu Hướng', 'Cho Thuê'
    ];

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredNews = NEWS_DATA.filter(item => {
        const matchCategory = filter === 'All' || item.category === filter;
        const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    // Tách bài nổi bật (Featured) ra khỏi danh sách phân trang
    const featuredNews = NEWS_DATA.find(item => item.featured) || NEWS_DATA[0];
    
    // Danh sách còn lại để phân trang (loại bỏ bài featured nếu nó nằm trong list lọc)
    const listNewsRaw = filteredNews.filter(item => item.id !== featuredNews.id);

    // --- LOGIC PHÂN TRANG ---
    // 1. Tính toán index
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // 2. Cắt mảng dữ liệu cho trang hiện tại
    const currentListNews = listNewsRaw.slice(indexOfFirstItem, indexOfLastItem);
    
    // 3. Tính tổng số trang
    const totalPages = Math.ceil(listNewsRaw.length / itemsPerPage);

    // 4. Hàm chuyển trang
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Cuộn nhẹ lên đầu danh sách tin (tùy chọn)
        const gridElement = document.querySelector('.news-grid');
        if(gridElement) gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- EFFECT ---
    // Reset về trang 1 khi thay đổi bộ lọc hoặc tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);

    return (
        <div className="news-page-container">
            {/* Header Banner */}
            <div className="news-header">
                <div className="news-header-content">
                    <h1>Tin Tức & Sự Kiện</h1>
                    <p>Cập nhật thông tin thị trường Bất Động Sản mới nhất 24/7</p>
                </div>
            </div>

            <div className="news-body-wrapper">
                {/* 1. THANH CÔNG CỤ */}
                <div className="news-toolbar">
                    <div className="news-categories">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                className={`cat-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="news-search">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm tin tức..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="search-icon"/>
                    </div>
                </div>

                {/* 2. TIN NỔI BẬT (Chỉ hiện ở trang 1 và khi không search/filter quá sâu) */}
                {filter === 'All' && !searchTerm && currentPage === 1 && (
                    <div className="featured-news" onClick={() => navigate(`/news/${featuredNews.id}`)}>
                        <div className="featured-img">
                            <img src={featuredNews.image} alt={featuredNews.title} />
                            <span className="category-tag">{featuredNews.category}</span>
                        </div>
                        <div className="featured-content">
                            <div className="meta-info">
                                <span><FaCalendarAlt /> {featuredNews.date}</span>
                                <span><FaUser /> {featuredNews.author}</span>
                            </div>
                            <h2>{featuredNews.title}</h2>
                            <p>{featuredNews.summary}</p>
                            <button className="read-more-btn">Đọc tiếp <FaArrowRight /></button>
                        </div>
                    </div>
                )}

                {/* 3. DANH SÁCH TIN (GRID) - Đã phân trang */}
                <div className="news-grid">
                    {currentListNews.length > 0 ? (
                        currentListNews.map(item => (
                            <div key={item.id} className="news-card" onClick={() => navigate(`/news/${item.id}`)}>
                                <div className="card-img-wrapper">
                                    <img src={item.image} alt={item.title} />
                                    <span className="card-cat">{item.category}</span>
                                </div>
                                <div className="card-body">
                                    <div className="card-meta">
                                        <small>{item.date}</small>
                                        <small>• {item.author}</small>
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p className="card-summary">{item.summary.substring(0, 100)}...</p>
                                    <span className="link-text">Xem chi tiết</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-result">Không tìm thấy bài viết nào.</div>
                    )}
                </div>

                {/* 4. PHÂN TRANG UI */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <button 
                            className="page-btn prev" 
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <FaChevronLeft />
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button 
                                key={index + 1}
                                className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                onClick={() => paginate(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button 
                            className="page-btn next" 
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;