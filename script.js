// === State ===
let lockEnabled = localStorage.getItem('lockEnabled') === 'true'; // đọc trạng thái từ localStorage
let locked = false;               // màn hình khoá có đang hiển thị không?
let timeUpdateInterval = null;

// DOM elements
const lockScreen = document.getElementById('lockScreen');
const mainScreen = document.getElementById('mainScreen');
const currentTimeEl = document.getElementById('currentTime');
const passwordHintSpan = document.getElementById('passwordHint');
const lockPassword = document.getElementById('lockPassword');
const unlockBtn = document.getElementById('unlockBtn');
const lockError = document.getElementById('lockError');

const enableLockBtn = document.getElementById('enableLockBtn');
const disableLockBtn = document.getElementById('disableLockBtn');
const lockNowBtn = document.getElementById('lockNowBtn');

// === Hàm lấy thời gian hiện tại dạng HH:MM và số HHMM ===
function getCurrentTimeDigits() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return {
        display: `${hours}:${minutes}`,
        code: hours + minutes
    };
}

// === Cập nhật đồng hồ và gợi ý mật khẩu ===
function updateTimeDisplay() {
    const { display, code } = getCurrentTimeDigits();
    if (currentTimeEl) currentTimeEl.textContent = display;
    if (passwordHintSpan) passwordHintSpan.textContent = code;
}

// === Hiện / ẩn màn hình khoá ===
function setLockScreen(show) {
    locked = show;
    if (show) {
        lockScreen.classList.add('active');
        mainScreen.classList.add('hidden');
        // focus vào ô input
        setTimeout(() => lockPassword?.focus(), 300);
    } else {
        lockScreen.classList.remove('active');
        mainScreen.classList.remove('hidden');
        lockPassword.value = '';         // xoá mật khẩu cũ
        lockError.textContent = '';      // xoá lỗi
    }
}

// === Kiểm tra mật khẩu nhập vào ===
function checkPassword() {
    const inputCode = lockPassword.value.trim();
    const { code } = getCurrentTimeDigits();
    if (inputCode === code) {
        // Đúng mật khẩu -> mở khoá
        setLockScreen(false);
    } else {
        lockError.textContent = '❌ Sai mật khẩu rồi!';
        lockPassword.value = '';    // xoá để nhập lại
        lockPassword.focus();
    }
}

// === Áp dụng trạng thái các nút theo lockEnabled ===
function updateButtonsByLockEnabled() {
    if (lockEnabled) {
        enableLockBtn.disabled = true;
        disableLockBtn.disabled = false;
        lockNowBtn.disabled = false;
    } else {
        enableLockBtn.disabled = false;
        disableLockBtn.disabled = true;
        lockNowBtn.disabled = true;
        // Nếu đang locked thì tắt locked luôn (vì đã tắt chức năng khoá)
        if (locked) setLockScreen(false);
    }
}

// === Khởi tạo giao diện lần đầu ===
function initUI() {
    updateTimeDisplay();
    // Nếu lockEnabled = true thì hiện lock screen, ngược lại main screen
    if (lockEnabled) {
        setLockScreen(true);
    } else {
        setLockScreen(false);
    }
    updateButtonsByLockEnabled();
}

// === Lưu trạng thái lockEnabled vào localStorage ===
function setLockEnabled(value) {
    lockEnabled = value;
    localStorage.setItem('lockEnabled', value);
    updateButtonsByLockEnabled();

    if (value && !locked) {
        // Nếu vừa bật chế độ khoá, KHÔNG tự động khoá ngay, chỉ khi quay lại tab
        // Nhưng để trải nghiệm tốt: nếu đang ở main, không khoá ngay.
        // Tuy nhiên khi refresh sẽ tự động khoá vì lockEnabled = true.
    } else if (!value && locked) {
        setLockScreen(false); // tắt khoá nếu đang hiện
    }
}

// === Sự kiện visibility change ===
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && lockEnabled && !locked) {
        // Khi quay lại app, nếu khoá được bật và chưa bị khoá thì hiện màn hình khoá
        setLockScreen(true);
    }
});

// === Bắt đầu tự động cập nhật thời gian mỗi giây ===
function startClock() {
    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
    updateTimeDisplay();
    timeUpdateInterval = setInterval(updateTimeDisplay, 1000);
}

// === Gán sự kiện cho các nút ===
unlockBtn.addEventListener('click', checkPassword);
lockPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
});

enableLockBtn.addEventListener('click', () => {
    // Giả lập "cấp quyền" (popup thông báo)
    alert('🌸 Cấp quyền thành công! Tính năng khoá đã bật.');
    setLockEnabled(true);
});

disableLockBtn.addEventListener('click', () => {
    setLockEnabled(false);
});

lockNowBtn.addEventListener('click', () => {
    if (lockEnabled) {
        setLockScreen(true);
    }
});

// === Xử lý khi tải trang (cũng là lần "mở app") ===
window.addEventListener('load', () => {
    startClock();
    initUI();

    // Sau khi load, nếu lockEnabled = true và chưa locked, thì hiện lock screen
    if (lockEnabled && !locked) {
        setLockScreen(true);
    }
});

// === Dọn dẹp interval khi không cần (tuỳ chọn) ===
window.addEventListener('beforeunload', () => {
    if (timeUpdateInterval) clearInterval(timeUpdateInterval);
});