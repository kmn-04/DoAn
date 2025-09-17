# Management Common CSS

File CSS chung cho tất cả các trang quản lý (Category, Partner, Tour, User Management).

## Cách sử dụng

1. Import CSS chung vào component:
```javascript
import '../styles/shared/ManagementCommon.css';
```

2. Sử dụng các class chuẩn:

### Container chính
```jsx
<div className="management-container">
```

### Header
```jsx
<div className="management-header">
  <div className="header-content">
    <div className="header-left">
      <h1 className="page-title">Tên trang</h1>
    </div>
    <button className="btn btn-primary add-new-btn">
      <Plus size={16} />
      Thêm mới
    </button>
  </div>
</div>
```

### Statistics Cards
```jsx
<div className="stats-container">
  <div className="stats-grid">
    <div className="stat-card total">
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <div className="stat-value">100</div>
        <div className="stat-label">Tổng số</div>
      </div>
    </div>
  </div>
</div>
```

### Search & Filter
```jsx
<div className="search-filter-section">
  <div className="search-filter-box">
    <div className="search-section">
      <Search size={20} />
      <input type="text" className="search-input" placeholder="Tìm kiếm..." />
    </div>
    
    <div className="filter-divider"></div>
    
    <div className="filter-section">
      <select className="filter-dropdown">
        <option>Tất cả</option>
      </select>
    </div>
  </div>
</div>
```

### Data Table
```jsx
<div className="table-container">
  <table className="data-table">
    <thead>
      <tr>
        <th>Cột 1</th>
        <th>Cột 2</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Dữ liệu</td>
        <td>Dữ liệu</td>
        <td>
          <div className="action-buttons">
            <button className="btn-icon btn-view">
              <Eye size={16} />
            </button>
            <button className="btn-icon btn-edit">
              <Edit size={16} />
            </button>
            <button className="btn-icon btn-delete">
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Pagination
```jsx
<div className="pagination-container">
  <button className="pagination-btn" disabled>Trước</button>
  <span>Trang 1 / 10</span>
  <button className="pagination-btn">Sau</button>
</div>
```

### Buttons
```jsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
```

### Loading & Error States
```jsx
<div className="loading-state">Đang tải...</div>
<div className="error-state">Có lỗi xảy ra</div>
```

## Stat Card Variants

- `.stat-card.total` - Màu xanh dương
- `.stat-card.active` - Màu xanh lá
- `.stat-card.inactive` - Màu cam
- Có thể thêm các variant khác tùy theo từng trang

## Responsive Design

CSS đã được tối ưu cho responsive design:
- Mobile: < 640px
- Tablet: 640px - 768px
- Desktop: > 768px

## Ghi chú

- Tất cả các trang quản lý nên sử dụng chung file CSS này
- Các styles riêng biệt chỉ nên được thêm vào file CSS riêng của từng component
- Đảm bảo import CSS chung sau CSS riêng để tránh override styles
