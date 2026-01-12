package backend.service;

import backend.dto.response.BookingResponse;
import backend.dto.response.ReviewResponse;
import backend.entity.PointTransaction;
import backend.entity.LoyaltyPoints;
import backend.entity.User;
import java.math.BigDecimal;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    
    /**
     * Export bookings to CSV format
     */
    public byte[] exportBookingsToCsv(List<BookingResponse> bookings) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // CSV Header with Vietnamese labels
        csv.append("Mã Booking,Tên Tour,Khách hàng,Email,SĐT,Địa chỉ,Ngày đặt,Ngày khởi hành,")
           .append("Người lớn,Trẻ em,Em bé,Tổng người,")
           .append("Đơn giá,Tổng tiền,Giảm giá,Thành tiền,")
           .append("Mã khuyến mãi,Phương thức thanh toán,Nhà cung cấp thanh toán,")
           .append("Trạng thái xác nhận,Trạng thái thanh toán,Ngày cập nhật\n");
        
        // CSV Data
        for (BookingResponse booking : bookings) {
            String paymentMethod = getPaymentMethod(booking);
            String paymentProvider = getPaymentProvider(booking);
            
            csv.append(escapeCsv(booking.getBookingCode())).append(",");
            csv.append(escapeCsv(booking.getTour() != null ? booking.getTour().getName() : "")).append(",");
            csv.append(escapeCsv(booking.getCustomerName())).append(",");
            csv.append(escapeCsv(booking.getCustomerEmail())).append(",");
            csv.append(escapeCsv(booking.getCustomerPhone())).append(",");
            csv.append(escapeCsv(booking.getCustomerAddress() != null ? booking.getCustomerAddress() : "")).append(",");
            csv.append(booking.getCreatedAt() != null ? booking.getCreatedAt().format(DATE_FORMATTER) : "").append(",");
            csv.append(booking.getStartDate() != null ? booking.getStartDate().format(DATE_FORMATTER) : "").append(",");
            csv.append(booking.getNumAdults() != null ? booking.getNumAdults() : 0).append(",");
            csv.append(booking.getNumChildren() != null ? booking.getNumChildren() : 0).append(",");
            csv.append(booking.getNumInfants() != null ? booking.getNumInfants() : 0).append(",");
            csv.append(booking.getTotalPeople() != null ? booking.getTotalPeople() : 0).append(",");
            csv.append(booking.getUnitPrice() != null ? booking.getUnitPrice().toString() : "0").append(",");
            csv.append(booking.getTotalPrice() != null ? booking.getTotalPrice().toString() : "0").append(",");
            csv.append(booking.getDiscountAmount() != null ? booking.getDiscountAmount().toString() : "0").append(",");
            csv.append(booking.getFinalAmount() != null ? booking.getFinalAmount().toString() : "0").append(",");
            csv.append(escapeCsv(booking.getPromotion() != null && booking.getPromotion().getCode() != null ? booking.getPromotion().getCode() : "")).append(",");
            csv.append(escapeCsv(paymentMethod)).append(",");
            csv.append(escapeCsv(paymentProvider)).append(",");
            csv.append(escapeCsv(translateConfirmationStatus(booking.getConfirmationStatus()))).append(",");
            csv.append(escapeCsv(translatePaymentStatus(booking.getPaymentStatus()))).append(",");
            csv.append(booking.getUpdatedAt() != null ? booking.getUpdatedAt().format(DATETIME_FORMATTER) : "");
            csv.append("\n");
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Export bookings to Excel format
     */
    public byte[] exportBookingsToExcel(List<BookingResponse> bookings) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Bookings");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Mã Booking", "Tên Tour", "Khách hàng", "Email", "SĐT", "Địa chỉ",
                "Ngày đặt", "Ngày khởi hành",
                "Người lớn", "Trẻ em", "Em bé", "Tổng người",
                "Đơn giá", "Tổng tiền", "Giảm giá", "Thành tiền",
                "Mã khuyến mãi", "Phương thức thanh toán", "Nhà cung cấp thanh toán",
                "Trạng thái xác nhận", "Trạng thái thanh toán", "Ngày cập nhật"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (BookingResponse booking : bookings) {
                Row row = sheet.createRow(rowNum++);
                int cellNum = 0;
                
                String paymentMethod = getPaymentMethod(booking);
                String paymentProvider = getPaymentProvider(booking);
                
                createCell(row, cellNum++, booking.getBookingCode(), dataStyle);
                createCell(row, cellNum++, booking.getTour() != null ? booking.getTour().getName() : "", dataStyle);
                createCell(row, cellNum++, booking.getCustomerName(), dataStyle);
                createCell(row, cellNum++, booking.getCustomerEmail(), dataStyle);
                createCell(row, cellNum++, booking.getCustomerPhone(), dataStyle);
                createCell(row, cellNum++, booking.getCustomerAddress() != null ? booking.getCustomerAddress() : "", dataStyle);
                createCell(row, cellNum++, booking.getCreatedAt() != null ? booking.getCreatedAt().format(DATE_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, booking.getStartDate() != null ? booking.getStartDate().format(DATE_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, booking.getNumAdults() != null ? booking.getNumAdults() : 0, dataStyle);
                createCell(row, cellNum++, booking.getNumChildren() != null ? booking.getNumChildren() : 0, dataStyle);
                createCell(row, cellNum++, booking.getNumInfants() != null ? booking.getNumInfants() : 0, dataStyle);
                createCell(row, cellNum++, booking.getTotalPeople() != null ? booking.getTotalPeople() : 0, dataStyle);
                createCell(row, cellNum++, booking.getUnitPrice() != null ? booking.getUnitPrice().doubleValue() : 0, dataStyle);
                createCell(row, cellNum++, booking.getTotalPrice() != null ? booking.getTotalPrice().doubleValue() : 0, dataStyle);
                createCell(row, cellNum++, booking.getDiscountAmount() != null ? booking.getDiscountAmount().doubleValue() : 0, dataStyle);
                createCell(row, cellNum++, booking.getFinalAmount() != null ? booking.getFinalAmount().doubleValue() : 0, dataStyle);
                createCell(row, cellNum++, booking.getPromotion() != null && booking.getPromotion().getCode() != null ? booking.getPromotion().getCode() : "", dataStyle);
                createCell(row, cellNum++, paymentMethod, dataStyle);
                createCell(row, cellNum++, paymentProvider, dataStyle);
                createCell(row, cellNum++, translateConfirmationStatus(booking.getConfirmationStatus()), dataStyle);
                createCell(row, cellNum++, translatePaymentStatus(booking.getPaymentStatus()), dataStyle);
                createCell(row, cellNum++, booking.getUpdatedAt() != null ? booking.getUpdatedAt().format(DATETIME_FORMATTER) : "", dataStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                // Set minimum width
                if (sheet.getColumnWidth(i) < 2000) {
                    sheet.setColumnWidth(i, 2000);
                }
                // Limit maximum width
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private void createCell(Row row, int cellNum, Object value, CellStyle style) {
        Cell cell = row.createCell(cellNum);
        if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value != null) {
            cell.setCellValue(value.toString());
        }
        cell.setCellStyle(style);
    }
    
    private String getPaymentMethod(BookingResponse booking) {
        if (booking.getPayments() != null && !booking.getPayments().isEmpty()) {
            return booking.getPayments().get(0).getPaymentMethod() != null 
                ? booking.getPayments().get(0).getPaymentMethod() : "";
        }
        return "";
    }
    
    private String getPaymentProvider(BookingResponse booking) {
        if (booking.getPayments() != null && !booking.getPayments().isEmpty()) {
            return booking.getPayments().get(0).getPaymentProvider() != null 
                ? booking.getPayments().get(0).getPaymentProvider() : "";
        }
        return "";
    }
    
    private String translateConfirmationStatus(String status) {
        if (status == null) return "";
        return switch (status.toUpperCase()) {
            case "PENDING" -> "Chờ xác nhận";
            case "CONFIRMED" -> "Đã xác nhận";
            case "CANCELLED" -> "Đã hủy";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLATION_REQUESTED" -> "Yêu cầu hủy";
            default -> status;
        };
    }
    
    private String translatePaymentStatus(String status) {
        if (status == null) return "";
        return switch (status.toUpperCase()) {
            case "UNPAID" -> "Chưa thanh toán";
            case "PAID" -> "Đã thanh toán";
            case "REFUNDED" -> "Đã hoàn tiền";
            case "REFUNDING" -> "Đang hoàn tiền";
            default -> status;
        };
    }
    
    private String escapeCsv(String value) {
        if (value == null) return "";
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
    
    /**
     * Export users to CSV format
     */
    public byte[] exportUsersToCsv(List<User> users) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // CSV Header with Vietnamese labels
        csv.append("ID,Tên,Email,SĐT,Địa chỉ,Ngày sinh,Vai trò,Trạng thái,")
           .append("Email đã xác thực,Ngày tạo,Ngày cập nhật,Lần đăng nhập cuối,Hoạt động cuối cùng,")
           .append("Số lần đăng nhập,Tổng booking,Tổng lượt xem tour\n");
        
        // CSV Data
        for (User user : users) {
            csv.append(user.getId() != null ? user.getId() : "").append(",");
            csv.append(escapeCsv(user.getName())).append(",");
            csv.append(escapeCsv(user.getEmail())).append(",");
            csv.append(escapeCsv(user.getPhone() != null ? user.getPhone() : "")).append(",");
            csv.append(escapeCsv(user.getAddress() != null ? user.getAddress() : "")).append(",");
            csv.append(user.getDateOfBirth() != null ? user.getDateOfBirth().format(DATE_FORMATTER) : "").append(",");
            csv.append(escapeCsv(user.getRole() != null ? user.getRole().getName() : "")).append(",");
            csv.append(escapeCsv(user.getStatus() != null ? translateUserStatus(user.getStatus().toString()) : "")).append(",");
            csv.append(user.getEmailVerifiedAt() != null ? user.getEmailVerifiedAt().format(DATETIME_FORMATTER) : "").append(",");
            csv.append(user.getCreatedAt() != null ? user.getCreatedAt().format(DATETIME_FORMATTER) : "").append(",");
            csv.append(user.getUpdatedAt() != null ? user.getUpdatedAt().format(DATETIME_FORMATTER) : "").append(",");
            csv.append(user.getLastLoginAt() != null ? user.getLastLoginAt().format(DATETIME_FORMATTER) : "").append(",");
            csv.append(user.getLastActivityAt() != null ? user.getLastActivityAt().format(DATETIME_FORMATTER) : "").append(",");
            csv.append(user.getLoginCount() != null ? user.getLoginCount() : 0).append(",");
            csv.append(user.getTotalBookings() != null ? user.getTotalBookings() : 0).append(",");
            csv.append(user.getTotalTourViews() != null ? user.getTotalTourViews() : 0);
            csv.append("\n");
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Export users to Excel format
     */
    public byte[] exportUsersToExcel(List<User> users) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Users");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "ID", "Tên", "Email", "SĐT", "Địa chỉ", "Ngày sinh", "Vai trò", "Trạng thái",
                "Email đã xác thực", "Ngày tạo", "Ngày cập nhật", "Lần đăng nhập cuối", "Hoạt động cuối cùng",
                "Số lần đăng nhập", "Tổng booking", "Tổng lượt xem tour"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (User user : users) {
                Row row = sheet.createRow(rowNum++);
                int cellNum = 0;
                
                createCell(row, cellNum++, user.getId() != null ? user.getId() : 0L, dataStyle);
                createCell(row, cellNum++, user.getName() != null ? user.getName() : "", dataStyle);
                createCell(row, cellNum++, user.getEmail() != null ? user.getEmail() : "", dataStyle);
                createCell(row, cellNum++, user.getPhone() != null ? user.getPhone() : "", dataStyle);
                createCell(row, cellNum++, user.getAddress() != null ? user.getAddress() : "", dataStyle);
                createCell(row, cellNum++, user.getDateOfBirth() != null ? user.getDateOfBirth().format(DATE_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, user.getRole() != null ? user.getRole().getName() : "", dataStyle);
                createCell(row, cellNum++, user.getStatus() != null ? translateUserStatus(user.getStatus().toString()) : "", dataStyle);
                createCell(row, cellNum++, user.getEmailVerifiedAt() != null ? user.getEmailVerifiedAt().format(DATETIME_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, user.getCreatedAt() != null ? user.getCreatedAt().format(DATETIME_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, user.getUpdatedAt() != null ? user.getUpdatedAt().format(DATETIME_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, user.getLastLoginAt() != null ? user.getLastLoginAt().format(DATETIME_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, user.getLastActivityAt() != null ? user.getLastActivityAt().format(DATETIME_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, user.getLoginCount() != null ? user.getLoginCount() : 0, dataStyle);
                createCell(row, cellNum++, user.getTotalBookings() != null ? user.getTotalBookings() : 0, dataStyle);
                createCell(row, cellNum++, user.getTotalTourViews() != null ? user.getTotalTourViews() : 0, dataStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < 2000) {
                    sheet.setColumnWidth(i, 2000);
                }
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private String translateUserStatus(String status) {
        if (status == null) return "";
        return switch (status.toUpperCase()) {
            case "ACTIVE" -> "Đang hoạt động";
            case "INACTIVE" -> "Không hoạt động";
            case "BANNED" -> "Đã bị cấm";
            default -> status;
        };
    }
    
    /**
     * Dashboard report data structure
     */
    public static class DashboardReport {
        private String period;
        private BigDecimal revenue;
        private Long newBookings;
        private Long newUsers;
        private Long cancelledBookings;
        private Double cancellationRate;
        private Long activeUsers;
        
        // Getters and setters
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        public Long getNewBookings() { return newBookings; }
        public void setNewBookings(Long newBookings) { this.newBookings = newBookings; }
        public Long getNewUsers() { return newUsers; }
        public void setNewUsers(Long newUsers) { this.newUsers = newUsers; }
        public Long getCancelledBookings() { return cancelledBookings; }
        public void setCancelledBookings(Long cancelledBookings) { this.cancelledBookings = cancelledBookings; }
        public Double getCancellationRate() { return cancellationRate; }
        public void setCancellationRate(Double cancellationRate) { this.cancellationRate = cancellationRate; }
        public Long getActiveUsers() { return activeUsers; }
        public void setActiveUsers(Long activeUsers) { this.activeUsers = activeUsers; }
    }
    
    /**
     * Export dashboard report to CSV
     */
    public byte[] exportDashboardReportToCsv(List<DashboardReport> reports) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        csv.append("Kỳ,Doanh thu (VND),Booking mới,User mới,Booking hủy,Tỉ lệ hủy (%),User đang hoạt động\n");
        
        for (DashboardReport report : reports) {
            csv.append(escapeCsv(report.getPeriod())).append(",");
            csv.append(report.getRevenue() != null ? report.getRevenue().toString() : "0").append(",");
            csv.append(report.getNewBookings() != null ? report.getNewBookings() : 0).append(",");
            csv.append(report.getNewUsers() != null ? report.getNewUsers() : 0).append(",");
            csv.append(report.getCancelledBookings() != null ? report.getCancelledBookings() : 0).append(",");
            csv.append(report.getCancellationRate() != null ? String.format("%.1f", report.getCancellationRate()) : "0.0").append(",");
            csv.append(report.getActiveUsers() != null ? report.getActiveUsers() : 0).append("\n");
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Export dashboard report to Excel
     */
    public byte[] exportDashboardReportToExcel(List<DashboardReport> reports) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Báo cáo Dashboard");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setAlignment(HorizontalAlignment.LEFT);
            
            CellStyle numberStyle = workbook.createCellStyle();
            numberStyle.setAlignment(HorizontalAlignment.RIGHT);
            
            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setAlignment(HorizontalAlignment.RIGHT);
            CreationHelper createHelper = workbook.getCreationHelper();
            currencyStyle.setDataFormat(createHelper.createDataFormat().getFormat("#,##0"));
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Kỳ", "Doanh thu (VND)", "Booking mới", "User mới", "Booking hủy", "Tỉ lệ hủy (%)", "User đang hoạt động"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (DashboardReport report : reports) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(report.getPeriod());
                row.createCell(1).setCellValue(report.getRevenue() != null ? report.getRevenue().doubleValue() : 0);
                row.getCell(1).setCellStyle(currencyStyle);
                row.createCell(2).setCellValue(report.getNewBookings() != null ? report.getNewBookings() : 0);
                row.getCell(2).setCellStyle(numberStyle);
                row.createCell(3).setCellValue(report.getNewUsers() != null ? report.getNewUsers() : 0);
                row.getCell(3).setCellStyle(numberStyle);
                row.createCell(4).setCellValue(report.getCancelledBookings() != null ? report.getCancelledBookings() : 0);
                row.getCell(4).setCellStyle(numberStyle);
                row.createCell(5).setCellValue(report.getCancellationRate() != null ? report.getCancellationRate() : 0.0);
                row.getCell(5).setCellStyle(numberStyle);
                row.createCell(6).setCellValue(report.getActiveUsers() != null ? report.getActiveUsers() : 0);
                row.getCell(6).setCellStyle(numberStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export monthly revenue stats to CSV
     */
    public byte[] exportRevenueStatsToCsv(List<MonthlyRevenueRow> rows) throws IOException {
        StringBuilder csv = new StringBuilder();
        csv.append("Tháng,Doanh thu (VND),Số booking\\n");
        for (MonthlyRevenueRow row : rows) {
            csv.append(escapeCsv(row.monthLabel())).append(",");
            csv.append(row.revenue()).append(",");
            csv.append(row.bookingCount()).append("\\n");
        }
        return csv.toString().getBytes("UTF-8");
    }

    /**
     * Export monthly revenue stats to Excel
     */
    public byte[] exportRevenueStatsToExcel(List<MonthlyRevenueRow> rows) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Revenue Stats");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            Row header = sheet.createRow(0);
            String[] headers = {"Tháng", "Doanh thu (VND)", "Số booking"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (MonthlyRevenueRow row : rows) {
                Row r = sheet.createRow(rowIdx++);
                createCell(r, 0, row.monthLabel(), dataStyle);
                createCell(r, 1, row.revenue().doubleValue(), dataStyle);
                createCell(r, 2, row.bookingCount(), dataStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < 2000) sheet.setColumnWidth(i, 2000);
                if (sheet.getColumnWidth(i) > 15000) sheet.setColumnWidth(i, 15000);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Simple record for monthly revenue export
     */
    public record MonthlyRevenueRow(String monthLabel, BigDecimal revenue, long bookingCount) {}
    
    /**
     * Export point transactions to CSV format
     */
    public byte[] exportPointTransactionsToCsv(List<PointTransaction> transactions) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // CSV Header with Vietnamese labels
        csv.append("ID,User ID,Loại giao dịch,Nguồn,Điểm,Mô tả,Số dư trước,Số dư sau,")
           .append("Ngày hết hạn,Đã hết hạn,Ngày tạo\n");
        
        // CSV Data
        for (PointTransaction tx : transactions) {
            csv.append(tx.getId() != null ? tx.getId() : "").append(",");
            csv.append(tx.getUser() != null && tx.getUser().getId() != null ? tx.getUser().getId() : "").append(",");
            csv.append(escapeCsv(translateTransactionType(tx.getTransactionType()))).append(",");
            csv.append(escapeCsv(translateSourceType(tx.getSourceType()))).append(",");
            csv.append(tx.getPoints() != null ? tx.getPoints() : 0).append(",");
            csv.append(escapeCsv(tx.getDescription() != null ? tx.getDescription() : "")).append(",");
            csv.append(tx.getBalanceBefore() != null ? tx.getBalanceBefore() : 0).append(",");
            csv.append(tx.getBalanceAfter() != null ? tx.getBalanceAfter() : 0).append(",");
            csv.append(tx.getExpiresAt() != null ? tx.getExpiresAt().format(DATE_FORMATTER) : "").append(",");
            csv.append(tx.getIsExpired() != null && tx.getIsExpired() ? "Có" : "Không").append(",");
            csv.append(tx.getCreatedAt() != null ? tx.getCreatedAt().format(DATETIME_FORMATTER) : "");
            csv.append("\n");
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Export point transactions to Excel format
     */
    public byte[] exportPointTransactionsToExcel(List<PointTransaction> transactions) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Point Transactions");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "ID", "User ID", "Loại giao dịch", "Nguồn", "Điểm", "Mô tả",
                "Số dư trước", "Số dư sau", "Ngày hết hạn", "Đã hết hạn", "Ngày tạo"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (PointTransaction tx : transactions) {
                Row row = sheet.createRow(rowNum++);
                int cellNum = 0;
                
                createCell(row, cellNum++, tx.getId() != null ? tx.getId() : 0L, dataStyle);
                createCell(row, cellNum++, tx.getUser() != null && tx.getUser().getId() != null ? tx.getUser().getId() : 0L, dataStyle);
                createCell(row, cellNum++, translateTransactionType(tx.getTransactionType()), dataStyle);
                createCell(row, cellNum++, translateSourceType(tx.getSourceType()), dataStyle);
                createCell(row, cellNum++, tx.getPoints() != null ? tx.getPoints() : 0, dataStyle);
                createCell(row, cellNum++, tx.getDescription() != null ? tx.getDescription() : "", dataStyle);
                createCell(row, cellNum++, tx.getBalanceBefore() != null ? tx.getBalanceBefore() : 0, dataStyle);
                createCell(row, cellNum++, tx.getBalanceAfter() != null ? tx.getBalanceAfter() : 0, dataStyle);
                createCell(row, cellNum++, tx.getExpiresAt() != null ? tx.getExpiresAt().format(DATE_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, tx.getIsExpired() != null && tx.getIsExpired() ? "Có" : "Không", dataStyle);
                createCell(row, cellNum++, tx.getCreatedAt() != null ? tx.getCreatedAt().format(DATETIME_FORMATTER) : "", dataStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < 2000) {
                    sheet.setColumnWidth(i, 2000);
                }
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    /**
     * Export top users by points to CSV format
     */
    public byte[] exportTopUsersToCsv(List<LoyaltyPoints> loyaltyPoints) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // CSV Header with Vietnamese labels
        csv.append("User ID,Tên,Email,Số dư điểm,Tổng tích lũy,Tổng đã đổi,Tổng hết hạn,Cấp độ\n");
        
        // CSV Data
        for (LoyaltyPoints lp : loyaltyPoints) {
            User user = lp.getUser();
            csv.append(user != null && user.getId() != null ? user.getId() : "").append(",");
            csv.append(escapeCsv(user != null && user.getName() != null ? user.getName() : "")).append(",");
            csv.append(escapeCsv(user != null && user.getEmail() != null ? user.getEmail() : "")).append(",");
            csv.append(lp.getPointsBalance() != null ? lp.getPointsBalance() : 0).append(",");
            csv.append(lp.getTotalEarned() != null ? lp.getTotalEarned() : 0).append(",");
            csv.append(lp.getTotalRedeemed() != null ? lp.getTotalRedeemed() : 0).append(",");
            csv.append(lp.getTotalExpired() != null ? lp.getTotalExpired() : 0).append(",");
            csv.append(escapeCsv(lp.getLevel() != null ? translateLoyaltyLevel(lp.getLevel()) : ""));
            csv.append("\n");
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Export top users by points to Excel format
     */
    public byte[] exportTopUsersToExcel(List<LoyaltyPoints> loyaltyPoints) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Top Users");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "User ID", "Tên", "Email", "Số dư điểm", "Tổng tích lũy", "Tổng đã đổi", "Tổng hết hạn", "Cấp độ"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (LoyaltyPoints lp : loyaltyPoints) {
                Row row = sheet.createRow(rowNum++);
                int cellNum = 0;
                User user = lp.getUser();
                
                createCell(row, cellNum++, user != null && user.getId() != null ? user.getId() : 0L, dataStyle);
                createCell(row, cellNum++, user != null && user.getName() != null ? user.getName() : "", dataStyle);
                createCell(row, cellNum++, user != null && user.getEmail() != null ? user.getEmail() : "", dataStyle);
                createCell(row, cellNum++, lp.getPointsBalance() != null ? lp.getPointsBalance() : 0, dataStyle);
                createCell(row, cellNum++, lp.getTotalEarned() != null ? lp.getTotalEarned() : 0, dataStyle);
                createCell(row, cellNum++, lp.getTotalRedeemed() != null ? lp.getTotalRedeemed() : 0, dataStyle);
                createCell(row, cellNum++, lp.getTotalExpired() != null ? lp.getTotalExpired() : 0, dataStyle);
                createCell(row, cellNum++, lp.getLevel() != null ? translateLoyaltyLevel(lp.getLevel()) : "", dataStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < 2000) {
                    sheet.setColumnWidth(i, 2000);
                }
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private String translateTransactionType(PointTransaction.TransactionType type) {
        if (type == null) return "";
        return switch (type) {
            case EARNED -> "Tích điểm";
            case REDEEMED -> "Đổi điểm";
            case EXPIRED -> "Hết hạn";
            case ADJUSTED -> "Điều chỉnh";
            case BONUS -> "Thưởng";
            case PENALTY -> "Phạt";
        };
    }
    
    private String translateSourceType(PointTransaction.SourceType type) {
        if (type == null) return "";
        return switch (type) {
            case BOOKING -> "Đặt tour";
            case REVIEW -> "Đánh giá";
            case REFERRAL -> "Giới thiệu";
            case BIRTHDAY -> "Sinh nhật";
            case PROMOTION -> "Khuyến mãi";
            case SOCIAL_SHARE -> "Chia sẻ MXH";
            case FIRST_BOOKING -> "Booking đầu tiên";
            case ADMIN -> "Admin";
        };
    }
    
    private String translateLoyaltyLevel(LoyaltyPoints.LoyaltyLevel level) {
        if (level == null) return "";
        return switch (level) {
            case BRONZE -> "Đồng";
            case SILVER -> "Bạc";
            case GOLD -> "Vàng";
            case PLATINUM -> "Bạch kim";
            case DIAMOND -> "Kim cương";
        };
    }
    
    /**
     * Export reviews to CSV format
     */
    public byte[] exportReviewsToCsv(List<ReviewResponse> reviews) throws IOException {
        StringBuilder csv = new StringBuilder();
        
        // CSV Header with Vietnamese labels
        csv.append("ID,User ID,Tên User,Email,Tour ID,Tên Tour,Đánh giá,Comment,Hình ảnh,")
           .append("Trạng thái,Nghi vấn,Spam,Đánh giá hữu ích,Admin Reply,")
           .append("Ngày tạo,Ngày cập nhật\n");
        
        // CSV Data
        for (ReviewResponse review : reviews) {
            csv.append(review.getId() != null ? review.getId() : "").append(",");
            csv.append(review.getUser() != null && review.getUser().getId() != null ? review.getUser().getId() : "").append(",");
            csv.append(escapeCsv(review.getUser() != null && review.getUser().getName() != null ? review.getUser().getName() : "")).append(",");
            csv.append(escapeCsv(review.getUser() != null && review.getUser().getEmail() != null ? review.getUser().getEmail() : "")).append(",");
            csv.append(review.getTour() != null && review.getTour().getId() != null ? review.getTour().getId() : "").append(",");
            csv.append(escapeCsv(review.getTour() != null && review.getTour().getName() != null ? review.getTour().getName() : "")).append(",");
            csv.append(review.getRating() != null ? review.getRating() : 0).append(",");
            csv.append(escapeCsv(review.getComment() != null ? review.getComment() : "")).append(",");
            csv.append(escapeCsv(review.getImages() != null && !review.getImages().isEmpty() ? String.join(";", review.getImages()) : "")).append(",");
            csv.append(escapeCsv(translateReviewStatus(review.getStatus()))).append(",");
            csv.append(review.getIsSuspicious() != null && review.getIsSuspicious() ? "Có" : "Không").append(",");
            csv.append(review.getIsSpam() != null && review.getIsSpam() ? "Có" : "Không").append(",");
            csv.append(review.getHelpfulCount() != null ? review.getHelpfulCount() : 0).append(",");
            csv.append(escapeCsv(review.getAdminReply() != null ? review.getAdminReply() : "")).append(",");
            csv.append(review.getCreatedAt() != null ? review.getCreatedAt().format(DATETIME_FORMATTER) : "").append(",");
            csv.append(review.getUpdatedAt() != null ? review.getUpdatedAt().format(DATETIME_FORMATTER) : "");
            csv.append("\n");
        }
        
        return csv.toString().getBytes("UTF-8");
    }
    
    /**
     * Export reviews to Excel format
     */
    public byte[] exportReviewsToExcel(List<ReviewResponse> reviews) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Reviews");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            dataStyle.setWrapText(true);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "ID", "User ID", "Tên User", "Email", "Tour ID", "Tên Tour", "Đánh giá", "Comment",
                "Hình ảnh", "Trạng thái", "Nghi vấn", "Spam", "Đánh giá hữu ích", "Admin Reply",
                "Ngày tạo", "Ngày cập nhật"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (ReviewResponse review : reviews) {
                Row row = sheet.createRow(rowNum++);
                int cellNum = 0;
                
                createCell(row, cellNum++, review.getId() != null ? review.getId() : 0L, dataStyle);
                createCell(row, cellNum++, review.getUser() != null && review.getUser().getId() != null ? review.getUser().getId() : 0L, dataStyle);
                createCell(row, cellNum++, review.getUser() != null && review.getUser().getName() != null ? review.getUser().getName() : "", dataStyle);
                createCell(row, cellNum++, review.getUser() != null && review.getUser().getEmail() != null ? review.getUser().getEmail() : "", dataStyle);
                createCell(row, cellNum++, review.getTour() != null && review.getTour().getId() != null ? review.getTour().getId() : 0L, dataStyle);
                createCell(row, cellNum++, review.getTour() != null && review.getTour().getName() != null ? review.getTour().getName() : "", dataStyle);
                createCell(row, cellNum++, review.getRating() != null ? review.getRating() : 0, dataStyle);
                createCell(row, cellNum++, review.getComment() != null ? review.getComment() : "", dataStyle);
                createCell(row, cellNum++, review.getImages() != null && !review.getImages().isEmpty() ? String.join("; ", review.getImages()) : "", dataStyle);
                createCell(row, cellNum++, translateReviewStatus(review.getStatus()), dataStyle);
                createCell(row, cellNum++, review.getIsSuspicious() != null && review.getIsSuspicious() ? "Có" : "Không", dataStyle);
                createCell(row, cellNum++, review.getIsSpam() != null && review.getIsSpam() ? "Có" : "Không", dataStyle);
                createCell(row, cellNum++, review.getHelpfulCount() != null ? review.getHelpfulCount() : 0, dataStyle);
                createCell(row, cellNum++, review.getAdminReply() != null ? review.getAdminReply() : "", dataStyle);
                createCell(row, cellNum++, review.getCreatedAt() != null ? review.getCreatedAt().format(DATETIME_FORMATTER) : "", dataStyle);
                createCell(row, cellNum++, review.getUpdatedAt() != null ? review.getUpdatedAt().format(DATETIME_FORMATTER) : "", dataStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < 2000) {
                    sheet.setColumnWidth(i, 2000);
                }
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private String translateReviewStatus(String status) {
        if (status == null) return "";
        return switch (status.toUpperCase()) {
            case "PENDING" -> "Chờ duyệt";
            case "APPROVED" -> "Đã duyệt";
            case "REJECTED" -> "Từ chối";
            default -> status;
        };
    }
}

