import React, { useState, useEffect } from 'react';
import { Table, Input, Modal, message, Tooltip, Tag, Select } from 'antd';
import {
    DeleteOutlined, CheckCircleOutlined, SearchOutlined,
    ReloadOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined,
    MessageOutlined, UserOutlined
} from '@ant-design/icons';
import contactApi from '../../api/contactApi';
import './BuildingManager.css'; // Tái sử dụng CSS của trang Building cho đồng bộ

const { Option } = Select;

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, UNREAD, PROCESSED

    // --- 1. Tải dữ liệu khi vào trang ---
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await contactApi.getAll();
            // Backend trả về List<Contact>, axios nhận về res.data hoặc res trực tiếp tùy config
            const data = Array.isArray(res) ? res : (res.data || []);
            setContacts(data);
        } catch (error) {
            message.error("Không thể tải danh sách liên hệ!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Xử lý: Đánh dấu đã xong ---
    const handleProcess = (id) => {
        Modal.confirm({
            title: 'Xác nhận đã xử lý?',
            content: 'Bạn xác nhận đã liên hệ và tư vấn xong cho khách hàng này?',
            okText: 'Xác nhận', cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await contactApi.markAsProcessed(id);
                    message.success("Đã cập nhật trạng thái!");
                    fetchContacts(); // Tải lại danh sách
                } catch (e) { 
                    message.error("Lỗi hệ thống!"); 
                }
            }
        });
    };

    // --- 3. Xử lý: Xóa ---
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xóa tin nhắn này?',
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa ngay', okType: 'danger', cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await contactApi.delete(id);
                    message.success("Đã xóa thành công!");
                    fetchContacts();
                } catch (e) { 
                    message.error("Lỗi xóa dữ liệu!"); 
                }
            }
        });
    };

    // --- 4. Logic Lọc (Client Side) ---
    const filteredData = contacts.filter(item => {
        const matchSearch = 
            item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.phone?.includes(searchText) ||
            item.email?.toLowerCase().includes(searchText.toLowerCase());
        
        const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;

        return matchSearch && matchStatus;
    });

    // --- 5. Cấu hình cột bảng ---
    const columns = [
        {
            title: 'KHÁCH HÀNG', dataIndex: 'name', width: 220,
            render: (text, r) => (
                <div className="cell-text">
                    <span className="text-name" style={{fontSize:15, display:'flex', alignItems:'center', gap:5}}>
                        <UserOutlined style={{color:'#1890ff'}}/> {text}
                    </span>
                    <span className="text-addr" style={{fontSize:12, color:'#999'}}>
                        {r.createdDate ? new Date(r.createdDate).toLocaleString('vi-VN') : 'Vừa xong'}
                    </span>
                </div>
            )
        },
        {
            title: 'LIÊN LẠC', key: 'contact', width: 240,
            render: (_, r) => (
                <div style={{display:'flex', flexDirection:'column', gap: 6, fontSize: 13, color:'#555'}}>
                    <span style={{display:'flex', gap:8}}>
                        <PhoneOutlined style={{color:'#1890ff', marginTop:3}}/> <b>{r.phone}</b>
                    </span>
                    <span style={{display:'flex', gap:8}}>
                        <MailOutlined style={{color:'#fa8c16', marginTop:3}}/> {r.email}
                    </span>
                </div>
            )
        },
        {
            title: 'NHU CẦU', dataIndex: 'subject', width: 140, align: 'center',
            render: (sub) => {
                let color = 'default';
                let label = 'KHÁC';
                if(sub === 'buy') { color = 'blue'; label = 'MUA CĂN HỘ'; }
                if(sub === 'rent') { color = 'cyan'; label = 'THUÊ VĂN PHÒNG'; }
                if(sub === 'consign') { color = 'purple'; label = 'KÝ GỬI'; }
                return <Tag color={color} style={{fontWeight:700}}>{label}</Tag>;
            }
        },
        {
            title: 'LỜI NHẮN', dataIndex: 'message',
            render: (text) => (
                <div style={{
                    maxWidth: 400, whiteSpace:'pre-wrap', color:'#444', 
                    background:'#f9f9f9', padding:'10px', borderRadius:'8px', fontSize:'13px'
                }}>
                    <MessageOutlined style={{marginRight:5, color:'#aaa'}}/> {text}
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI', dataIndex: 'status', width: 150, align: 'center',
            render: (status) => (
                status === 'PROCESSED' 
                ? <Tag color="success" icon={<CheckCircleOutlined />}>ĐÃ XỬ LÝ</Tag>
                : <Tag color="warning" icon={<ClockCircleOutlined />}>CHỜ XỬ LÝ</Tag>
            )
        },
        {
            title: '', key: 'action', width: 100, align: 'right',
            render: (_, r) => (
                <div className="action-box">
                    {r.status !== 'PROCESSED' && (
                        <Tooltip title="Đánh dấu đã xong">
                            <button className="btn-act ok" onClick={() => handleProcess(r.id)}>
                                <CheckCircleOutlined />
                            </button>
                        </Tooltip>
                    )}
                    <Tooltip title="Xóa">
                        <button className="btn-act del" onClick={() => handleDelete(r.id)}>
                            <DeleteOutlined />
                        </button>
                    </Tooltip>
                </div>
            )
        }
    ];

    // Thống kê nhanh
    const total = contacts.length;
    const pending = contacts.filter(c => c.status !== 'PROCESSED').length;

    return (
        <div className="admin-wrapper">
            <div className="header-row">
                <div className="page-title">
                    <h1>Hộp Thư Liên Hệ</h1>
                    <p>Quản lý yêu cầu tư vấn từ khách hàng.</p>
                </div>
            </div>

            <div className="stats-container">
                <div className="stat-item">
                    <div className="stat-info"><span>TỔNG TIN NHẮN</span><h3>{total}</h3></div>
                    <div className="stat-icon" style={{background:'#e6f7ff', color:'#1890ff'}}><MessageOutlined /></div>
                </div>
                <div className="stat-item">
                    <div className="stat-info"><span>CHỜ XỬ LÝ</span><h3 style={{color:'#fa8c16'}}>{pending}</h3></div>
                    <div className="stat-icon" style={{background:'#fff7e6', color:'#fa8c16'}}><ClockCircleOutlined /></div>
                </div>
                <div className="stat-item">
                    <div className="stat-info"><span>ĐÃ GIẢI QUYẾT</span><h3 style={{color:'#52c41a'}}>{total - pending}</h3></div>
                    <div className="stat-icon" style={{background:'#f6ffed', color:'#52c41a'}}><CheckCircleOutlined /></div>
                </div>
            </div>

            <div className="filter-bar">
                <Select 
                    className="clean-select" 
                    value={filterStatus} 
                    onChange={setFilterStatus} 
                    style={{width: 200}}
                >
                    <Option value="ALL">📋 Tất cả trạng thái</Option>
                    <Option value="UNREAD">🟠 Chờ xử lý</Option>
                    <Option value="PROCESSED">🟢 Đã xử lý</Option>
                </Select>

                <Input 
                    className="clean-input" 
                    placeholder="Tìm tên, SĐT, Email..." 
                    prefix={<SearchOutlined style={{color:'#bfbfbf'}}/>} 
                    allowClear 
                    value={searchText} 
                    onChange={e => setSearchText(e.target.value)} 
                    style={{flex: 1, minWidth: 250}}
                />
                
                <Tooltip title="Làm mới"><button className="btn-reset" onClick={fetchContacts}><ReloadOutlined /></button></Tooltip>
            </div>

            <div className="table-wrapper">
                <Table
                    className="clean-table"
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                    locale={{ emptyText: 'Hộp thư trống' }}
                />
            </div>
        </div>
    );
};

export default ContactManager;