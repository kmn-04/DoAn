Testcase 3: Chưa thể tìm kiếm ở header dashboard
Testcase 5: Lỗi khi áp dụng mã giảm giá:
api.ts:84 
 GET http://localhost:8080/api/bookings/calculate-price?tourId=1&adults=2&children=1&promotionCode=NEWUSER50 500 (Internal Server Error)

api.ts:52 ❌ API Response Error: 
{status: 500, url: '/bookings/calculate-price', message: 'Request failed with status code 500', data: {…}}
api.ts:75 Server error occurred
BookingCheckoutPage.tsx:226 Error validating promotion: 
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
Testcase 8: Chưa thể review tour vừa hoàn thành
Testcase 10: Tôi đã hoàn thành 1 tour nhưng mục thống kê hiển thị là 0
Lỗi ko thể đổi avatar api.ts:86 
 PUT http://localhost:8080/api/users/1202 500 (Internal Server Error)

api.ts:52 ❌ API Response Error: 
{status: 500, url: '/users/1202', message: 'Request failed with status code 500', data: {…}}
api.ts:75 Server error occurred
ProfilePage.tsx:313 Error updating profile with avatar: 
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
﻿Testcase 19: Xem chi tiết user chưa hiển thị hết dữ liệu, thiếu rất nhiều trường
Testcase 20: Toàn bộ chưa hoạt động

Testcase 22:  Lỗi khi thêm mới, sửa
partnerAdminService.ts:77 
 POST http://localhost:8080/api/admin/partners 500 (Internal Server Error)

api.ts:52 ❌ API Response Error: 
{status: 500, url: '/admin/partners', message: 'Request failed with status code 500', data: {…}}
api.ts:75 Server error occurred
AdminPartners.tsx:226 Error saving partner: 
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}