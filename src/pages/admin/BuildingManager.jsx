import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, message, Tooltip, Select, Space } from 'antd';
import {
    PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, 
    UsergroupAddOutlined, UndoOutlined, RestOutlined, CheckCircleOutlined,
    EnvironmentOutlined, ReloadOutlined, ShopOutlined, PieChartOutlined, 
    ClockCircleOutlined, ThunderboltFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AssignmentModal from '../../components/admin/AssignmentModal';
import './BuildingManager.css';

const { Option } = Select;

const DISTRICTS = [
    { id: 1, name: 'Quận 1' }, { id: 2, name: 'Quận 2' }, { id: 3, name: 'Quận 3' },
    { id: 4, name: 'Quận 4' }, { id: 5, name: 'Bình Thạnh' }, { id: 6, name: 'Phú Nhuận' }
];

const BuildingManager = () => {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });

    const [searchText, setSearchText] = useState('');
    const [filterDistrict, setFilterDistrict] = useState(undefined);
    const [filterStatus, setFilterStatus] = useState(1);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    
    // State quản lý việc mở Modal Giao việc
    const [assignmentBuildingId, setAssignmentBuildingId] = useState(null);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchBuildings(); }, [filterStatus, filterDistrict]);

    const fetchStats = async () => {
        try {
            const res = await axiosClient.get('/api/buildings/admin'); 
            const all = Array.isArray(res) ? res : (res.data || []);
            setStats({
                total: all.length,
                active: all.filter(x => x.status === 1 || x.status === 'ACTIVE').length,
                pending: all.filter(x => x.status === 2 || x.status === 'PENDING').length
            });
        } catch (e) {}
    };

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            const params = { name: searchText, status: filterStatus };
            if (filterDistrict) params.districtId = filterDistrict;
            const res = await axiosClient.get('/api/buildings/admin', { params });
            setBuildings(Array.isArray(res) ? res : (res.data || []));
            setSelectedRowKeys([]); 
        } catch (error) { message.error("Lỗi tải dữ liệu!"); } 
        finally { setLoading(false); }
    };

    const handleResetFilter = () => {
        setSearchText('');
        setFilterDistrict(undefined);
        setFilterStatus(1);
    };

    const handleDeleteMultiple = () => {
        if (selectedRowKeys.length === 0) return;
        const isTrash = filterStatus === 0;

        Modal.confirm({
            title: isTrash 
                ? `CẢNH BÁO: Xóa vĩnh viễn ${selectedRowKeys.length} mục?` 
                : `Xóa ${selectedRowKeys.length} mục vào thùng rác?`,
            content: isTrash 
                ? 'Hành động này KHÔNG THỂ hoàn tác. Dữ liệu sẽ mất mãi mãi!' 
                : 'Bạn có thể khôi phục lại sau trong thùng rác.',
            okText: isTrash ? 'Xóa vĩnh viễn' : 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const deletePromises = selectedRowKeys.map(id => {
                        if (isTrash) return axiosClient.delete(`/api/buildings/hard/${id}`);
                        else return axiosClient.delete(`/api/buildings/${id}`);
                    });
                    await Promise.all(deletePromises);
                    message.success(isTrash ? "Đã xóa vĩnh viễn!" : "Đã chuyển vào thùng rác!");
                    fetchBuildings(); 
                    fetchStats();
                } catch (e) { message.error("Lỗi xóa dữ liệu!"); }
            }
        });
    };

    const confirmAction = (type, id) => {
        Modal.confirm({
            title: type === 'DELETE' ? 'Chuyển vào thùng rác?' : (type === 'HARD_DELETE' ? 'Xóa vĩnh viễn?' : 'Xác nhận?'),
            okText: 'Đồng ý', okType: type.includes('DELETE') ? 'danger' : 'primary', cancelText: 'Hủy',
            onOk: async () => {
                try {
                    if(type === 'APPROVE') await axiosClient.put(`/api/buildings/${id}/approve`);
                    if(type === 'DELETE') await axiosClient.delete(`/api/buildings/${id}`);
                    if(type === 'HARD_DELETE') await axiosClient.delete(`/api/buildings/hard/${id}`);
                    if(type === 'RESTORE') await axiosClient.put(`/api/buildings/${id}/restore`);
                    message.success("Thành công!"); fetchBuildings(); fetchStats();
                } catch(e) { message.error("Lỗi!"); }
            }
        });
    };

    const columns = [
        {
            title: 'TÒA NHÀ & ĐỊA CHỈ', dataIndex: 'name',
            render: (text, record) => (
                <div className="cell-flex">
                    <img className="cell-img" src={record.avatar || "https://via.placeholder.com/100"} alt="img" />
                    <div className="cell-text">
                        <span className="text-name">{text}</span>
                        <span className="text-addr"><EnvironmentOutlined style={{marginTop:3, color: '#1890ff'}}/> {record.address || `${record.street}, ${record.ward}`}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI', dataIndex: 'status', width: 160,
            render: (_, r) => (
                <>
                    {(r.status === 'PENDING' || filterStatus === 2) && <span className="tag-status s-pending">● Chờ duyệt</span>}
                    {filterStatus === 1 && <span className="tag-status s-active">● Hoạt động</span>}
                    {filterStatus === 0 && <span className="tag-status s-deleted">● Đã xóa</span>}
                </>
            )
        },
        {
            title: 'GIÁ THUÊ / THÁNG', dataIndex: 'rentPrice', width: 180,
            render: (price) => <span className="tag-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</span>
        },
        {
            title: 'DIỆN TÍCH', dataIndex: 'floorArea', width: 120, align: 'center',
            render: (area) => area ? <span className="tag-area">{area} m²</span> : '-'
        },
        {
            title: '', key: 'action', width: 170, align: 'right',
            render: (_, r) => (
                <div className="action-box">
                    {filterStatus === 2 && <Tooltip title="Duyệt"><button className="btn-act ok" onClick={() => confirmAction('APPROVE', r.id)}><CheckCircleOutlined /></button></Tooltip>}
                    {filterStatus !== 0 && (
                        <>
                            <Tooltip title="Giao việc">
                                <button className="btn-act" onClick={() => setAssignmentBuildingId(r.id)}>
                                    <UsergroupAddOutlined />
                                </button>
                            </Tooltip>
                            <Tooltip title="Sửa"><button className="btn-act" onClick={() => navigate(`/admin/building-edit/${r.id}`)}><EditOutlined /></button></Tooltip>
                            <Tooltip title="Xóa"><button className="btn-act del" onClick={() => confirmAction('DELETE', r.id)}><DeleteOutlined /></button></Tooltip>
                        </>
                    )}
                    {filterStatus === 0 && (
                        <>
                            <Tooltip title="Khôi phục"><button className="btn-act" onClick={() => confirmAction('RESTORE', r.id)}><UndoOutlined /></button></Tooltip>
                            <Tooltip title="Xóa vĩnh viễn"><button className="btn-act del" onClick={() => confirmAction('HARD_DELETE', r.id)}><RestOutlined /></button></Tooltip>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="admin-wrapper">
            <div className="header-row">
                <div className="page-title">
                    <h1>Quản Lý Tòa Nhà</h1>
                    <p>Hệ thống quản lý dữ liệu tập trung.</p>
                </div>
                <Space>
                    {selectedRowKeys.length > 0 && (
                        <Button danger size="large" onClick={handleDeleteMultiple} style={{borderRadius: 8}}>
                            {filterStatus === 0 
                                ? `Xóa vĩnh viễn ${selectedRowKeys.length} mục` 
                                : `Xóa ${selectedRowKeys.length} mục`}
                        </Button>
                    )}
                    
                    <button className="btn-primary-gradient" onClick={() => navigate('/admin/building-create')} disabled={filterStatus === 0}>
                        <PlusOutlined /> Thêm Tòa Nhà
                    </button>
                </Space>
            </div>

            <div className="stats-container">
                <div className="stat-item">
                    <div className="stat-info"><span>TỔNG SỐ TÒA NHÀ</span><h3>{stats.total}</h3></div>
                    <div className="stat-icon" style={{background:'#e6f7ff', color:'#1890ff'}}><ShopOutlined /></div>
                </div>
                <div className="stat-item">
                    <div className="stat-info"><span>ĐANG HOẠT ĐỘNG</span><h3 style={{color:'#52c41a'}}>{stats.active}</h3></div>
                    <div className="stat-icon" style={{background:'#f6ffed', color:'#52c41a'}}><ThunderboltFilled /></div>
                </div>
                <div className="stat-item">
                    <div className="stat-info"><span>CHỜ PHÊ DUYỆT</span><h3 style={{color:'#fa8c16'}}>{stats.pending}</h3></div>
                    <div className="stat-icon" style={{background:'#fff7e6', color:'#fa8c16'}}><ClockCircleOutlined /></div>
                </div>
            </div>

            <div className="filter-bar">
                <Select className="clean-select" value={filterStatus} onChange={setFilterStatus} style={{width: 180}}>
                    <Option value={1}>🟢 Đang hoạt động</Option>
                    <Option value={2}>🟠 Chờ duyệt</Option>
                    <Option value={0}>🔴 Thùng rác</Option>
                </Select>
                <Select className="clean-select" placeholder="Chọn khu vực" allowClear value={filterDistrict} onChange={setFilterDistrict} style={{width: 180}}>
                    {DISTRICTS.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                </Select>
                <Input 
                    className="clean-input" 
                    placeholder="Tìm kiếm tên tòa nhà, địa chỉ..." 
                    prefix={<SearchOutlined style={{color:'#bfbfbf'}}/>} 
                    allowClear 
                    value={searchText} 
                    onChange={e => setSearchText(e.target.value)} 
                    onPressEnter={fetchBuildings}
                    style={{flex: 1, minWidth: 250}}
                />
                <Tooltip title="Làm mới"><button className="btn-reset" onClick={handleResetFilter}><ReloadOutlined /></button></Tooltip>
            </div>

            <div className="table-wrapper">
                <Table
                    className="clean-table"
                    rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                    columns={columns}
                    dataSource={buildings}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    locale={{ emptyText: 'Chưa có dữ liệu nào' }}
                />
            </div>
            
            {/* --- FIX LỖI: CHỈ HIỂN THỊ KHI CÓ ID --- */}
            {assignmentBuildingId && (
                <AssignmentModal 
                    buildingId={assignmentBuildingId} 
                    onClose={() => setAssignmentBuildingId(null)} 
                />
            )}
        </div>
    );
};

export default BuildingManager;