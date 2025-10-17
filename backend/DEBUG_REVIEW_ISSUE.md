# Debug: Không thể viết đánh giá sau khi hoàn thành tour

## 🔍 Checklist Debug

### 1. Kiểm tra Booking Status
Chạy query SQL để xem trạng thái booking:

```sql
-- Xem bookings của user
SELECT 
    b.id,
    b.booking_code,
    b.confirmation_status,
    b.payment_status,
    b.start_date,
    t.name as tour_name,
    t.duration,
    DATE_ADD(b.start_date, INTERVAL t.duration DAY) as tour_end_date,
    u.email,
    u.name as user_name
FROM bookings b
JOIN tours t ON b.tour_id = t.id
JOIN users u ON b.user_id = u.id
WHERE u.email = 'YOUR_EMAIL_HERE'  -- Thay bằng email của bạn
ORDER BY b.created_at DESC;
```

**✅ Expected:**
- `confirmation_status` = `CONFIRMED` hoặc `COMPLETED`
- `payment_status` = `PAID`
- `tour_end_date` < current date (tour đã kết thúc)

---

### 2. Trigger Auto-Completion Job

Nếu `confirmation_status` vẫn là `CONFIRMED` mặc dù tour đã kết thúc, cần trigger completion job:

#### **Option A: Via API (Recommended)**

1. Login as ADMIN
2. Get JWT token
3. Call API:

```bash
curl -X POST http://localhost:8080/api/bookings/completion/trigger \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "completedCount": 5,
    "message": "Auto-completed 5 bookings"
  }
}
```

#### **Option B: Via SQL (Manual)**

```sql
-- Update bookings manually (if needed)
UPDATE bookings b
JOIN tours t ON b.tour_id = t.id
SET 
    b.confirmation_status = 'COMPLETED',
    b.updated_at = NOW()
WHERE 
    b.confirmation_status = 'CONFIRMED'
    AND b.payment_status = 'PAID'
    AND DATE_ADD(b.start_date, INTERVAL t.duration DAY) < CURDATE();

-- Verify
SELECT COUNT(*) as completed_count 
FROM bookings 
WHERE confirmation_status = 'COMPLETED';
```

---

### 3. Kiểm tra Review Permission

Check xem user có thể review không:

```bash
# Replace {tourId} and JWT token
curl -X GET "http://localhost:8080/api/reviews/tour/2/can-review" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": true
}
```

**Nếu trả về `false`, check:**

```sql
-- Check if user already reviewed
SELECT * FROM reviews 
WHERE user_id = YOUR_USER_ID 
  AND tour_id = YOUR_TOUR_ID;

-- If review exists, user cannot review again!
```

---

### 4. Kiểm tra Frontend

Open browser DevTools → Console → Check for errors:

**Expected logs:**
```
✅ canUserReview: true
```

**If `false`, check:**
- User logged in?
- JWT token valid?
- API response from `/reviews/tour/{id}/can-review`

---

## 🚀 Quick Fix Steps

### Step 1: Login as Admin
```
Email: admin@example.com (or your admin account)
Password: (your admin password)
```

### Step 2: Trigger Completion
Via browser console:
```javascript
fetch('http://localhost:8080/api/bookings/completion/trigger', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Completed:', d))
.catch(e => console.error('❌ Error:', e));
```

### Step 3: Refresh Tour Detail Page
- F5 reload page
- Button "Viết đánh giá" should appear!

---

## 🔄 Scheduled Jobs

Để tránh vấn đề này trong tương lai, backend có scheduled job:

| Job | Schedule | Action |
|-----|----------|--------|
| `BookingCompletionScheduler` | **2:00 AM daily** | Auto-complete bookings after tour end date |
| `BookingReminderScheduler` | **8:00 AM daily** | Send reminders 3 days before tour |

**Note:** Scheduler chỉ chạy khi backend đang running!

---

## 📊 Debug Queries

### Query 1: Tìm bookings cần complete
```sql
SELECT 
    b.id,
    b.booking_code,
    t.name,
    b.start_date,
    t.duration,
    DATE_ADD(b.start_date, INTERVAL t.duration DAY) as tour_end_date,
    DATEDIFF(CURDATE(), DATE_ADD(b.start_date, INTERVAL t.duration DAY)) as days_since_end,
    b.confirmation_status,
    b.payment_status
FROM bookings b
JOIN tours t ON b.tour_id = t.id
WHERE 
    b.confirmation_status = 'CONFIRMED'
    AND b.payment_status = 'PAID'
    AND DATE_ADD(b.start_date, INTERVAL t.duration DAY) < CURDATE()
ORDER BY b.start_date DESC;
```

### Query 2: Check user review eligibility
```sql
SELECT 
    u.email,
    t.name as tour_name,
    b.confirmation_status,
    b.payment_status,
    DATE_ADD(b.start_date, INTERVAL t.duration DAY) as tour_end_date,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM reviews r 
            WHERE r.user_id = u.id AND r.tour_id = t.id
        ) THEN 'Already Reviewed'
        WHEN b.confirmation_status IN ('CONFIRMED', 'COMPLETED') 
             AND b.payment_status = 'PAID' 
        THEN 'Can Review'
        ELSE 'Cannot Review'
    END as review_status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN tours t ON b.tour_id = t.id
WHERE u.email = 'YOUR_EMAIL_HERE'
ORDER BY b.created_at DESC;
```

---

## ✅ Verification

After fix, verify:

1. ✅ Booking `confirmation_status` = `COMPLETED`
2. ✅ API `/reviews/tour/{id}/can-review` returns `true`
3. ✅ Button "Viết đánh giá" hiển thị
4. ✅ Click button → Modal mở ra
5. ✅ Submit review thành công!

