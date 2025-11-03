export function toPersianDigits(str: string | number): string {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.toString().replace(/\d/g, (digit) => persian[parseInt(digit)]);
}

export function toEnglishDigits(str: string): string {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = str;
  persian.forEach((p, i) => {
    result = result.replace(new RegExp(p, 'g'), english[i]);
  });
  
  return result;
}

export function formatPersianNumber(num: number | undefined): string {
  if (num === undefined || num === null) return toPersianDigits('۰');
  return toPersianDigits(num.toLocaleString('fa-IR'));
}

export function formatPersianPrice(price: number | undefined): string {
  if (price === undefined || price === null) return `${toPersianDigits('۰')} تومان`;
  return `${formatPersianNumber(price)} تومان`;
}

export function formatPersianDate(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatPersianDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'نامشخص';
  
  try {
    const validDate = date instanceof Date ? date : new Date(date);
    
    if (isNaN(validDate.getTime())) {
      return 'نامشخص';
    }
    
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(validDate);
  } catch (error) {
    return 'نامشخص';
  }
}

export function getPersianRelativeTime(date: Date | undefined | null): string {
  if (!date) return 'نامشخص';
  
  const now = new Date();
  const targetDate = date instanceof Date ? date : new Date(date);
  
  if (isNaN(targetDate.getTime())) return 'نامشخص';
  
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'همین الان';
  } else if (diffInMinutes < 60) {
    return `${toPersianDigits(diffInMinutes)} دقیقه پیش`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${toPersianDigits(hours)} ساعت پیش`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${toPersianDigits(days)} روز پیش`;
  }
}

export function truncatePersianText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatFileSize(bytes: number): string {
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  if (bytes === 0) return `${toPersianDigits(0)} بایت`;
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(1);
  
  return `${toPersianDigits(size)} ${sizes[i]}`;
}


 
export function toPersianChars(text: string): string {
  const charMap: { [key: string]: string } = {
    'ي': 'ی',
    'ك': 'ک',
    'ء': 'ٔ',
    'ئ': 'ی',
    'ة': 'ه',
    'َ': '',
    'ً': '',
    'ُ': '',
    'ٌ': '',
    'ِ': '',
    'ٍ': '',
    'ْ': '',
    'ّ': '',
  };
  
  let result = text;
  Object.keys(charMap).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), charMap[key]);
  });
  
  return result;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')  
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
