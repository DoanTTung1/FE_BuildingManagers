import React, { useState, useEffect } from 'react';
import {
    Table, Button, Input, Space, Modal, message, Tag, Tooltip, Typography, Select, Image
} from 'antd';
import {
    PlusOutlined, SearchOutlined, EditOutlined,
    DeleteOutlined, UsergroupAddOutlined,
    UndoOutlined, RestOutlined, CheckCircleOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AssignmentModal from '../../components/admin/AssignmentModal';

const { Title } = Typography;
const { Option } = Select;

// Dữ liệu Quận khớp hoàn toàn với bảng `district` trong file aaa.sql của bạn
const DISTRICTS = [
    { id: 1, name: 'Quận 1' },
    { id: 2, name: 'Quận 2' },
    { id: 3, name: 'Quận 3' },
    { id: 4, name: 'Quận 4' },
    { id: 5, name: 'Quận Bình Thạnh' },
    { id: 6, name: 'Quận Phú Nhuận' }
];

const BuildingManager = () => {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- STATE BỘ LỌC ---
    const [searchText, setSearchText] = useState('');
    const [filterDistrict, setFilterDistrict] = useState(undefined); // Mặc định undefined để axios không gửi params này
    const [filterStatus, setFilterStatus] = useState(1); // Mặc định load bài Active (1)

    const [assignmentBuildingId, setAssignmentBuildingId] = useState(null);

    // Tự động load lại khi thay đổi bộ lọc Status hoặc Quận
    useEffect(() => {
        fetchBuildings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, filterDistrict]);

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            // [FIX LỖI QUAN TRỌNG]: Xử lý tham số sạch trước khi gửi
            const params = {
                name: searchText,
                status: filterStatus
            };

            // Chỉ thêm districtId vào params nếu có giá trị (khác null/undefined)
            // Khắc phục lỗi gửi "districtId=null" làm Backend không trả về dữ liệu
            if (filterDistrict) {
                params.districtId = filterDistrict;
            }

            const res = await axiosClient.get('/api/buildings/admin', { params });
            setBuildings(Array.isArray(res) ? res : (res.data || []));
        } catch (error) {
            message.error("Không tải được danh sách tòa nhà!");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchBuildings();
    };

    // --- CÁC HÀNH ĐỘNG QUẢN TRỊ ---

    // 1. Duyệt bài (Status 2 -> 1)
    const handleApprove = (id) => {
        Modal.confirm({
            title: 'Xác nhận duyệt tin đăng?',
            content: 'Tòa nhà này sẽ được hiển thị công khai trên trang chủ.',
            okText: 'Duyệt ngay',
            okType: 'primary',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.put(`/api/buildings/${id}/approve`);
                    message.success("Đã duyệt tòa nhà thành công!");
                    fetchBuildings(); // Reload bảng
                } catch (error) {
                    message.error("Lỗi khi duyệt bài!");
                }
            }
        });
    };

    // 2. Xóa mềm (Vào thùng rác)
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Chuyển vào thùng rác?',
            content: 'Bạn có thể khôi phục lại sau.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/api/buildings/${id}`);
                    message.success("Đã chuyển vào thùng rác!");
                    fetchBuildings();
                } catch (error) {
                    message.error("Lỗi khi xóa!");
                }
            }
        });
    };

    // 3. Xóa vĩnh viễn
    const handleHardDelete = (id) => {
        Modal.confirm({
            title: 'CẢNH BÁO: Xóa vĩnh viễn',
            content: 'Hành động này không thể hoàn tác. Dữ liệu sẽ mất vĩnh viễn!',
            okText: 'Xóa vĩnh viễn',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/api/buildings/hard/${id}`);
                    message.success("Đã xóa vĩnh viễn!");
                    fetchBuildings();
                } catch (error) {
                    message.error("Lỗi xóa vĩnh viễn!");
                }
            }
        });
    };

    // 4. Khôi phục
    const handleRestore = async (id) => {
        try {
            await axiosClient.put(`/api/buildings/${id}/restore`);
            message.success("Khôi phục thành công!");
            fetchBuildings();
        } catch (error) {
            message.error("Lỗi khôi phục!");
        }
    };

    // --- CẤU HÌNH CỘT BẢNG ---
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
            align: 'center',
        },
        {
            title: 'Ảnh',
            dataIndex: 'avatar', // Trường 'avatar' trong DB của bạn
            width: 100,
            align: 'center',
            render: (src) => (
                <Image
                    width={80}
                    height={60}
                    src={src ? (src.startsWith('http') ? src : `data:image/jpeg;base64,${src}`) : "https://via.placeholder.com/150?text=No+Img"}
                    style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
                    fallback="https://via.placeholder.com/150?text=Error"
                />
            )
        },
        {
            title: 'Thông Tin Tòa Nhà',
            dataIndex: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#001529', fontSize: '15px' }}>{text}</span>
                    <span style={{ color: '#666', fontSize: '13px' }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {record.address || `${record.street}, ${record.ward}`}
                    </span>
                    <div style={{ marginTop: 4 }}>
                        {filterStatus === 2 && <Tag color="orange">🟠 Chờ duyệt</Tag>}
                        {filterStatus === 0 && <Tag color="red">🔴 Đã xóa</Tag>}
                        {filterStatus === 1 && <Tag color="green">🟢 Đang hoạt động</Tag>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Giá Thuê',
            dataIndex: 'rentPrice',
            width: 140,
            render: (price) => (
                <span style={{ color: '#cf1322', fontWeight: 700, fontSize: '14px' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price)}
                </span>
            ),
            sorter: (a, b) => a.rentPrice - b.rentPrice,
        },
        {
            title: 'Diện Tích',
            dataIndex: 'floorArea',
            width: 110,
            align: 'center',
            render: (area) => area ? <Tag color="geekblue">{area} m²</Tag> : <Tag>N/A</Tag>,
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: 180,
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    {/* NÚT DUYỆT BÀI (Chỉ hiện khi lọc status = 2) */}
                    {filterStatus === 2 && (
                        <Tooltip title="Duyệt bài này">
                            <Button
                                type="primary"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApprove(record.id)}
                            />
                        </Tooltip>
                    )}

                    {/* ACTIONS CHO ACTIVE (1) & PENDING (2) */}
                    {filterStatus !== 0 && (
                        <>
                            <Tooltip title="Giao việc">
                                <Button
                                    style={{ color: '#13c2c2', borderColor: '#13c2c2' }}
                                    icon={<UsergroupAddOutlined />}
                                    onClick={() => setAssignmentBuildingId(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Sửa thông tin">
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<EditOutlined />}
                                    onClick={() => navigate(`/admin/building-edit/${record.id}`)}
                                />
                            </Tooltip>
                            <Tooltip title="Xóa tạm">
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(record.id)}
                                />
                            </Tooltip>
                        </>
                    )}

                    {/* ACTIONS CHO THÙNG RÁC (0) */}
                    {filterStatus === 0 && (
                        <>
                            <Tooltip title="Khôi phục lại">
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                                    icon={<UndoOutlined />}
                                    onClick={() => handleRestore(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Xóa vĩnh viễn">
                                <Button
                                    danger
                                    type="primary"
                                    icon={<RestOutlined />}
                                    onClick={() => handleHardDelete(record.id)}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 12, minHeight: '85vh', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>

            {/* HEADER & ADD BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0, color: '#001529' }}>🏢 Quản Lý Tòa Nhà</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    style={{ backgroundColor: '#001529', borderRadius: '6px', height: '40px' }}
                    onClick={() => navigate('/admin/building-create')}
                    disabled={filterStatus === 0}
                >
                    Thêm Tòa Nhà
                </Button>
            </div>

            {/* FILTER TOOLBAR */}
            <div style={{
                display: 'flex',
                gap: 12,
                marginBottom: 24,
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #f0f0f0',
                flexWrap: 'wrap'
            }}>

                {/* 1. Bộ lọc Trạng Thái */}
                <Select
                    value={filterStatus}
                    style={{ width: 200 }}
                    size="large"
                    onChange={(val) => setFilterStatus(val)}
                >
                    <Option value={1}>🟢 Đang hoạt động</Option>
                    <Option value={2}>🟠 Chờ duyệt (Pending)</Option>
                    <Option value={0}>🔴 Thùng rác</Option>
                </Select>

                {/* 2. Bộ lọc Quận (Fix lỗi Select không reset được) */}
                <Select
                    placeholder="Lọc theo Quận"
                    style={{ width: 200 }}
                    size="large"
                    allowClear
                    value={filterDistrict} // Liên kết 2 chiều với state
                    onChange={(val) => setFilterDistrict(val)}
                >
                    {DISTRICTS.map(d => (
                        <Option key={d.id} value={d.id}>{d.name}</Option>
                    ))}
                </Select>

                {/* 3. Tìm kiếm tên */}
                <div style={{ display: 'flex', flex: 1, gap: 10 }}>
                    <Input
                        placeholder="Nhập tên tòa nhà cần tìm..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        size="large"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Button type="default" size="large" onClick={handleSearch} style={{ minWidth: 100 }}>
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            {/* DATA TABLE */}
            <Table
                columns={columns}
                dataSource={buildings}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 6,
                    showTotal: (total) => `Tổng cộng ${total} tòa nhà`,
                    position: ['bottomCenter']
                }}
                locale={{ emptyText: 'Không tìm thấy dữ liệu tòa nhà nào.' }}
                bordered
                scroll={{ x: 800 }} // Hỗ trợ scroll ngang trên mobile
            />

            {/* MODAL PHÂN CÔNG */}
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