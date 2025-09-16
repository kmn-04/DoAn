package backend.model;

public enum ActionType {
    // Authentication actions
    LOGIN("Đăng nhập"),
    LOGOUT("Đăng xuất"),
    
    // User profile actions
    UPDATE_PROFILE("Cập nhật hồ sơ"),
    CHANGE_PASSWORD("Đổi mật khẩu"),
    
    // Booking actions
    CREATE_BOOKING("Tạo booking"),
    CONFIRM_BOOKING("Xác nhận booking"),
    CANCEL_BOOKING("Hủy booking"),
    UPDATE_BOOKING("Cập nhật booking"),
    
    // Tour actions
    ADD_TO_FAVORITES("Thêm yêu thích"),
    REMOVE_FROM_FAVORITES("Bỏ yêu thích"),
    VIEW_TOUR("Xem tour"),
    
    // Admin/Staff actions
    CREATE_USER("Tạo người dùng"),
    UPDATE_USER("Cập nhật người dùng"),
    DELETE_USER("Xóa người dùng"),
    CREATE_PARTNER("Tạo đối tác"),
    UPDATE_PARTNER("Cập nhật đối tác"),
    DELETE_PARTNER("Xóa đối tác"),
    REPLY_CONTACT("Trả lời liên hệ"),
    
    // System actions
    SYSTEM_LOGIN("Đăng nhập hệ thống"),
    EXPORT_DATA("Xuất dữ liệu"),
    IMPORT_DATA("Nhập dữ liệu");
    
    private final String displayName;
    
    ActionType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
