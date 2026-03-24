// حاسبة العمر - منطق الحساب بدقة مع تحسينات
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ageForm');
    const resultDiv = document.getElementById('result');
    const yearsSpan = document.getElementById('years');
    const monthsSpan = document.getElementById('months');
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const themeToggle = document.getElementById('themeToggle');
    const calculateDaysBtn = document.getElementById('calculateDaysBtn');
    const calculateFutureBtn = document.getElementById('calculateFutureBtn');
    const shareBtn = document.getElementById('shareBtn');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');

    const dayField = document.getElementById('day');
    const monthField = document.getElementById('month');
    const yearField = document.getElementById('year');
    const futureYearsField = document.getElementById('futureYears');

    const savedResultKey = 'ageCalculatorSavedResult';
    const darkModeKey = 'ageCalculatorDarkMode';

    // تحميل الوضع المظلم من localStorage
    if (localStorage.getItem(darkModeKey) === 'true') {
        document.body.classList.add('dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem(darkModeKey, isDark);
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // تحقق فوري من الإدخالات
    dayField.addEventListener('input', validateDay);
    monthField.addEventListener('change', validateMonth);
    yearField.addEventListener('input', validateYear);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateAll()) {
            updateAgeResult();
        }
    });

    resetBtn.addEventListener('click', function() {
        dayField.value = '';
        monthField.value = '';
        yearField.value = '';
        futureYearsField.value = '';
        clearErrors();
        resultDiv.classList.add('hidden');
    });

    calculateDaysBtn.addEventListener('click', function() {
        if (validateAll()) {
            const birthDate = getBirthDate();
            if (!birthDate) return;
            const now = new Date();
            const totalDays = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));
            alert(`عمرك بالأيام: ${totalDays} يوم`);
        }
    });

    calculateFutureBtn.addEventListener('click', function() {
        const yearsToAdd = Number(futureYearsField.value);
        if (!validateAll()) return;

        if (!Number.isInteger(yearsToAdd) || yearsToAdd <= 0 || yearsToAdd > 200) {
            alert('أدخل عدد سنوات صحيح بين 1 و 200.');
            return;
        }

        const birthDate = getBirthDate();
        if (!birthDate) return;

        const futureDate = new Date(birthDate);
        futureDate.setFullYear(birthDate.getFullYear() + yearsToAdd);
        alert(`بعد ${yearsToAdd} سنة سيكون تاريخ ميلادك: ${futureDate.toLocaleDateString('ar-SA')}`);
    });

    shareBtn.addEventListener('click', function() {
        if (!validateAll() || resultDiv.classList.contains('hidden')) {
            alert('قم بحساب العمر أولا ثم شارك النتيجة.');
            return;
        }

        const age = getCurrentAge();
        if (!age) return;

        const text = `عمري هو: ${age.years} سنة ${age.months} شهر ${age.days} يوم ${age.hours} ساعة.`;
        if (navigator.share) {
            navigator.share({ title: 'حاسبة العمر', text: text }).catch(() => {
                navigator.clipboard.writeText(text).then(() => alert('تم نسخ النص إلى الحافظة')).catch(() => alert('تعذر المشاركة أو النسخ.'));
            });
        } else {
            navigator.clipboard.writeText(text).then(() => alert('تم نسخ النص إلى الحافظة')).catch(() => alert('تعذر النسخ.'));
        }
    });

    saveBtn.addEventListener('click', function() {
        if (!validateAll() || resultDiv.classList.contains('hidden')) {
            alert('قم بحساب العمر أولا ثم احفظ النتيجة.');
            return;
        }
        const age = getCurrentAge();
        if (!age) return;
        localStorage.setItem(savedResultKey, JSON.stringify(age));
        alert('تم حفظ النتيجة بنجاح.');
    });

    // تحميل نتيجة محفوظة إذا وجدت
    const savedAge = localStorage.getItem(savedResultKey);
    if (savedAge) {
        const age = JSON.parse(savedAge);
        displayAge(age);
        resultDiv.classList.remove('hidden');
    }

    function setError(elementId, message) {
        document.getElementById(elementId).textContent = message;
    }

    function clearErrors() {
        setError('dayError', '');
        setError('monthError', '');
        setError('yearError', '');
    }

    function validateDay() {
        const value = Number(dayField.value);
        if (!Number.isInteger(value) || value < 1 || value > 31) {
            setError('dayError', 'يرجى إدخال يوم صحيح (1-31).');
            return false;
        }
        setError('dayError', '');
        return true;
    }

    function validateMonth() {
        const value = Number(monthField.value);
        if (!Number.isInteger(value) || value < 1 || value > 12) {
            setError('monthError', 'اختر الشهر من القائمة.');
            return false;
        }
        setError('monthError', '');
        return true;
    }

    function validateYear() {
        const value = Number(yearField.value);
        const currentYear = new Date().getFullYear();
        if (!Number.isInteger(value) || value < 1900 || value > currentYear) {
            setError('yearError', `السنة يجب أن تكون بين 1900 و ${currentYear}.`);
            return false;
        }
        setError('yearError', '');
        return true;
    }

    function validateAll() {
        const validDay = validateDay();
        const validMonth = validateMonth();
        const validYear = validateYear();

        if (!validDay || !validMonth || !validYear) return false;

        const birthDate = getBirthDate();
        if (!birthDate) {
            alert('الرجاء إدخال تاريخ ميلاد صحيح.');
            return false;
        }

        const now = new Date();
        if (birthDate > now) {
            alert('لا يمكن أن يكون تاريخ الميلاد في المستقبل.');
            return false;
        }

        return true;
    }

    function getBirthDate() {
        const d = Number(dayField.value);
        const m = Number(monthField.value);
        const y = Number(yearField.value);
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
            return null;
        }
        return date;
    }

    function calculateAge(birthDate) {
        const now = new Date();
        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();
        let hours = now.getHours() - birthDate.getHours();

        if (hours < 0) {
            hours += 24;
            days -= 1;
        }

        if (days < 0) {
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            days += lastMonthDate;
            months -= 1;
        }

        if (months < 0) {
            months += 12;
            years -= 1;
        }

        return { years, months, days, hours };
    }

    function displayAge(age) {
        yearsSpan.textContent = age.years;
        monthsSpan.textContent = age.months;
        daysSpan.textContent = age.days;
        hoursSpan.textContent = age.hours;
        resultDiv.classList.remove('hidden');
    }

    function getCurrentAge() {
        const birthDate = getBirthDate();
        if (!birthDate) return null;
        return calculateAge(birthDate);
    }

    function updateAgeResult() {
        const birthDate = getBirthDate();
        if (!birthDate) {
            alert('تأكد من صحة تاريخ الميلاد');
            return;
        }

        const age = calculateAge(birthDate);
        displayAge(age);
        localStorage.setItem(savedResultKey, JSON.stringify(age));
    }
});
