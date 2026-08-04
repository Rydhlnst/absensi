# Testing Checklist — App Absensi

## Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@mitrasolusindo.co.id` | `password123` |
| Admin | `admin@mitrasolusindo.co.id` | `password123` |
| Karyawan | `budi.santoso@mitrasolusindo.co.id` | `password123` |
| Karyawan | `dewi.anggraini@mitrasolusindo.co.id` | `password123` |

---

## 1. Authentication

- [ ] Login page loads with email/password form
- [ ] Wrong password shows error toast
- [ ] Employee login redirects to `/employee/dashboard`
- [ ] Admin login redirects to `/admin/dashboard`
- [ ] Super Admin login redirects to `/super-admin/dashboard`
- [ ] Unauthenticated access to any route redirects to `/login`

## 2. Device Binding (NEW)

- [ ] Login as employee → check `device` table in DB for new entry
- [ ] Login again from same browser → same device entry updated (not duplicated)
- [ ] Login from different browser → new device entry created

---

## 3. Employee Features

### 3.1 Dashboard (`/employee/dashboard`)
- [ ] Renders stat cards (total tugas, selesai, poin, jam kerja)
- [ ] Shows today's task if any
- [ ] Notification bell shows count

### 3.2 Attendance (`/employee/attendance`)
- [ ] Shows current time and date
- [ ] Check-in button triggers camera
- [ ] Photo preview shows with "Konfirmasi" and "Ambil Ulang" buttons
- [ ] Confirm check-in → uploads photo to R2 → success toast
- [ ] Check-out button appears after check-in
- [ ] Check-out photo preview flow works
- [ ] Shows working duration timer after check-in
- [ ] History shows last 7 days

### 3.3 Attendance History (`/employee/attendance-history`)
- [ ] Shows attendance records with status badges
- [ ] Shows summary stats

### 3.4 Tasks (`/employee/tasks`)
- [ ] Shows tabs: Belum Selesai / Selesai
- [ ] Task cards show category, priority, status badges
- [ ] Click task → navigates to detail page

### 3.5 Task Detail (`/employee/tasks/[id]`)
- [ ] Shows task info: customer, location, description, points
- [ ] Timeline shows events chronologically
- [ ] "Mulai Tugas" button changes status to in_progress
- [ ] "Upload Bukti" opens file picker (image/PDF, multiple)
- [ ] Attachment preview shows thumbnails with delete buttons
- [ ] "Upload N File" confirms and uploads to R2
- [ ] Existing attachments display as image previews or PDF links
- [ ] Notes section: add note → saves and displays
- [ ] "Selesaikan Tugas" button → marks complete + shows reward points toast

### 3.6 Task History (`/employee/task-history`)
- [ ] Shows completed/cancelled tasks
- [ ] Filter works

### 3.7 Rewards (`/employee/rewards`)
- [ ] Shows total points banner
- [ ] Shows reward history with earned/redeemed types

### 3.8 Leave (`/employee/leave`)
- [ ] Form renders: type, start date, end date, reason
- [ ] Submit leave request → success toast
- [ ] Shows my leave requests with status

### 3.9 Profile (`/employee/profile`)
- [ ] Shows avatar, name, position, department
- [ ] Camera button on avatar → file picker → uploads to R2 → updates avatar
- [ ] Edit profile → save changes → success toast
- [ ] Change password → works with strength indicator
- [ ] Notification settings toggles render
- [ ] Theme selector renders

---

## 4. Admin Features

### 4.1 Dashboard (`/admin/dashboard`)
- [ ] Stat cards render (karyawan, tugas, hadir, etc.)
- [ ] Charts/graphs display

### 4.2 Tasks (`/admin/tasks`)
- [ ] Task list renders with filters
- [ ] Create task → form dialog opens
- [ ] Assign task to employee → notification sent to employee
- [ ] Edit task → updates successfully
- [ ] Delete task → confirmation → removes

### 4.3 Employees (`/admin/employees`)
- [ ] Employee list renders
- [ ] "Tambah Teknisi" button opens form
- [ ] Create employee → adds to list
- [ ] Edit employee → updates
- [ ] Delete employee → confirmation → removes

### 4.4 Attendance (`/admin/attendance`)
- [ ] Shows all employee attendance records
- [ ] Check-in/check-out photo thumbnails display
- [ ] Click photo → opens full view
- [ ] Filters work (date, employee, status)

### 4.5 Rewards (`/admin/rewards`)
- [ ] "Riwayat Klaim & Pencairan" section renders
- [ ] Search by employee name works
- [ ] "Kelola Parameter Hadiah" section renders
- [ ] **"Tambah Hadiah" button opens form dialog** (NEW)
- [ ] Form: name, description, points, stock, category, image upload, active toggle
- [ ] Image upload → R2 → shows preview
- [ ] Create reward item → appears in list
- [ ] Edit reward item → form prefills → save updates
- [ ] Delete reward item → confirmation → removes
- [ ] "Riwayat Poin Per Karyawan" → select employee → shows history

### 4.6 Leave Approvals (`/admin/leave-approvals`) — NEW
- [ ] Page loads with pending leaves (default filter)
- [ ] Shows employee name, type, date range, reason
- [ ] "Setujui" button → approves → toast → list refreshes
- [ ] "Tolak" button → opens dialog → enter reason → reject → toast
- [ ] Status filter works (pending/approved/rejected/all)
- [ ] Search by employee name works
- [ ] Pagination works if >10 items
- [ ] Check `/employee/attendance` for notification after approval

### 4.7 Reports (`/admin/reports`)
- [ ] Report cards render
- [ ] "Cetak PDF" button works

### 4.8 Settings (`/admin/settings`)
- [ ] Shows schedule form (jam masuk/pulang)
- [ ] Inputs are read-only for admin
- [ ] "Hanya Super Admin" banner displays
- [ ] Branch list renders

---

## 5. Super Admin Features

### 5.1 Dashboard (`/super-admin/dashboard`)
- [ ] All stat cards render
- [ ] Charts display

### 5.2 Admins (`/super-admin/admins`)
- [ ] Admin list renders
- [ ] Create/edit/delete admin works

### 5.3 Attendance (`/super-admin/attendance`)
- [ ] All attendance records display
- [ ] Photo thumbnails show

### 5.4 Tasks (`/super-admin/tasks`)
- [ ] All tasks display with filters
- [ ] Create/edit/delete task works

### 5.5 Salaries (`/super-admin/salaries`) — NEW
- [ ] Salary list renders with search and month/year filters
- [ ] Create salary → form works
- [ ] Edit salary → updates
- [ ] Delete salary → confirmation

### 5.6 Reports (`/super-admin/reports`)
- [ ] 4 report cards display
- [ ] "Lihat Detail Absensi" → detail view
- [ ] "Lihat Detail Tugas" → detail view
- [ ] Back button returns to overview
- [ ] Badge counts show on cards

### 5.7 Logs (`/super-admin/logs`)
- [ ] System logs render
- [ ] "Clear Logs" button → confirmation dialog → clears logs

### 5.8 Settings (`/super-admin/settings`)
- [ ] All inputs editable
- [ ] "Simpan Pengaturan" button visible
- [ ] Logo upload → R2 → preview → save
- [ ] "Tambah branch" button works
- [ ] Branch CRUD works

### 5.9 Roles (`/super-admin/roles`)
- [ ] Roles page loads

---

## 6. Notifications

- [ ] Bell icon shows unread count (real data from `/api/notifications`)
- [ ] Click bell → dropdown shows notifications
- [ ] Click notification → mark as read
- [ ] "Tandai semua sudah dibaca" → marks all read
- [ ] Assign task to employee → employee sees "Tugas Baru" notification
- [ ] Approve leave → employee sees "Cuti Disetujui" notification
- [ ] Reject leave → employee sees "Cuti Ditolak" notification with reason
- [ ] Complete task with points → employee sees "Poin Reward Diperoleh" notification

---

## 7. API Endpoints (manual or via test)

- [ ] `GET /api/stats` → returns JSON with all fields
- [ ] `GET /api/employees` → returns user list
- [ ] `GET /api/tasks` → returns task list
- [ ] `GET /api/attendance` → returns attendance records
- [ ] `GET /api/rewards` → returns reward entries
- [ ] `GET /api/settings` → returns company settings
- [ ] `GET /api/notifications` → returns notifications
- [ ] `GET /api/reward-items` → returns reward items
- [ ] `GET /api/salaries` → returns salary records
- [ ] `GET /api/timeline-events` → returns timeline events
- [ ] `GET /api/system-logs` → returns system logs
- [ ] `GET /api/admins` → returns admin list
- [ ] `GET /api/devices` → returns device bindings
- [ ] `GET /api/leaves` → returns leave requests
- [ ] `GET /api/branches` → returns office branches
- [ ] `POST /api/uploads/sign` → returns presigned R2 URL

---

## 8. Cloudflare R2 Uploads

> **NOTE:** R2 env vars must be filled in `.env` before testing uploads.

- [ ] Logo upload → R2 URL returned → saves in `company_setting.logo`
- [ ] Avatar upload → R2 URL → saves in `user.image`
- [ ] Check-in photo → R2 URL → saves in `attendance.checkInPhoto`
- [ ] Check-out photo → R2 URL → saves in `attendance.checkOutPhoto`
- [ ] Task attachments → R2 URLs → saves in `task.attachments` (JSON array)
- [ ] Reward item image → R2 URL → saves in `reward_item.image`
- [ ] Upload oversized file → detailed error toast
- [ ] Upload wrong file type → detailed error toast

---

## 9. Responsive Layout

### Desktop (>1024px)
- [ ] Sidebar visible on left
- [ ] Header with notification bell on top
- [ ] Content area fills remaining space

### Mobile (<768px)
- [ ] Sidebar hidden
- [ ] Bottom navigation bar visible
- [ ] All pages render properly on small screens
- [ ] Tables become scrollable
- [ ] Dialogs fit mobile viewport

---

## 10. Playwright E2E Tests

```bash
pnpm exec playwright test
```

- [ ] All 64 tests pass
