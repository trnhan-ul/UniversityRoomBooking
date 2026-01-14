# Test Login & Role-based Routing

Hướng dẫn test login và kiểm tra role:

## 1. Start Backend Server

```bash
cd backend
npm install
npm start
```

Server sẽ chạy tại: http://localhost:5000

## 2. Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

## 3. Test các tài khoản mẫu

Dữ liệu mẫu đã được tạo trong `backend/config/init.js`:

### Administrator
- **Email:** admin@fpt.edu.vn
- **Password:** Admin@123
- **Redirect to:** /administrator/dashboard
- **Features:** Quản lý users, phân quyền, báo cáo hệ thống, cấu hình

### Facility Manager
- **Email:** manager@fpt.edu.vn
- **Password:** Manager@123
- **Redirect to:** /facility-manager/dashboard
- **Features:** Quản lý phòng, thiết bị, duyệt/từ chối booking

### Lecturer
- **Email:** lecturer@fpt.edu.vn
- **Password:** Lecturer@123
- **Redirect to:** /lecturer/dashboard
- **Features:** Đặt phòng cho giảng dạy, xem lịch, báo cáo

### Student
- **Email:** student@fpt.edu.vn
- **Password:** Student@123
- **Redirect to:** /student/dashboard
- **Features:** Tìm phòng, đặt phòng, xem lịch đặt

## 4. Kiểm tra các tính năng

### ✅ Login Flow
1. Mở http://localhost:3000
2. Nhập email và password của một trong 4 role
3. Sau khi login thành công, hệ thống tự động redirect đến dashboard tương ứng

### ✅ Role-based Access Control
1. Login với role Student
2. Thử truy cập `/administrator/dashboard` trong URL
3. Sẽ thấy trang "Access Denied" vì không có quyền

### ✅ Protected Routes
1. Logout
2. Thử truy cập trực tiếp `/student/dashboard`
3. Sẽ tự động redirect về `/login`

### ✅ Token Authentication
- Token được lưu trong localStorage
- Token tự động thêm vào header của mọi API request
- Token hết hạn sau 7 ngày

## 5. Cấu trúc Dashboard theo Role

### Student Dashboard (Xanh dương)
- Search Rooms
- Book Room
- My Bookings
- My Schedule
- Notifications
- Booking History

### Lecturer Dashboard (Xanh lá)
- Book Classroom
- Teaching Schedule
- My Bookings
- Usage Reports
- Booking History
- Notifications

### Facility Manager Dashboard (Tím)
- Manage Classrooms
- Manage Equipment
- Approve Bookings
- Reject Bookings
- All Bookings
- Room Schedules
- Usage Reports
- Room Settings
- Notifications

### Administrator Dashboard (Đỏ)
- User Management
- Assign Roles
- Create Users
- Activate/Deactivate Users
- System Reports
- Usage Analytics
- System Settings
- Booking Rules
- System Logs

## 6. API Endpoints

### Auth
- **POST** `/api/auth/login` - Login

### Headers cho API requests
```javascript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

## 7. Troubleshooting

### Lỗi: "Please verify your email before logging in"
- Các user mẫu đã set `is_email_verified: true`
- Nếu tạo user mới, cần set field này = true hoặc implement email verification

### Lỗi: CORS
- Đảm bảo backend đã config CORS cho http://localhost:3000

### Lỗi: Cannot find module
- Chạy `npm install` trong cả backend và frontend

## 8. Files đã tạo/cập nhật

### Frontend
✅ `/src/components/common/ProtectedRoute.jsx` - Component bảo vệ routes
✅ `/src/pages/StudentDashboard.jsx` - Dashboard cho Student
✅ `/src/pages/LecturerDashboard.jsx` - Dashboard cho Lecturer
✅ `/src/pages/FacilityManagerDashboard.jsx` - Dashboard cho Facility Manager
✅ `/src/pages/AdministratorDashboard.jsx` - Dashboard cho Administrator
✅ `/src/App.jsx` - Router với protected routes
✅ `/src/pages/Login.jsx` - Login với role-based redirect

### Backend
✅ `/models/User.js` - Role enum updated
✅ `/config/init.js` - Dữ liệu mẫu cho 4 roles
✅ `/controllers/authController.js` - Login với email verification check
✅ `/middleware/auth.js` - Authentication & authorization
