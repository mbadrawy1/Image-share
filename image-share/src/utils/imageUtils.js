import { API_URL, IMAGE_BASE_URL } from "../config/urls";

// صورة SVG بديلة للصور المفقودة
export const NO_IMAGE_SVG = "/favicon.png";

/**
 * يحل مسارًا نسبيًا مع عنوان URL للواجهة البرمجية
 * @param {string} path - مسار نسبي يبدأ بـ '/'
 * @returns {string} - عنوان URL كامل
 */
export const resolveRelativePath = (path) => {
  if (!path) return null;
  
  // إذا كان المسار يحتوي بالفعل على API_URL، قم بإرجاعه كما هو
  if (path.startsWith('http')) return path;
  
  // تأكد من أن المسار يبدأ بشرطة مائلة
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  try {
    // معالجة تحليل URL بأمان (قد يفشل إذا كان API_URL غير صحيح)
    const apiUrlBase = new URL(API_URL).pathname;
    const cleanPath = normalizedPath.startsWith(apiUrlBase) 
      ? normalizedPath.substring(apiUrlBase.length) 
      : normalizedPath;
    
    return `${API_URL}${cleanPath}`;
  } catch (err) {
    console.error("Error parsing URL:", err);
    // العودة إلى الدمج البسيط كخطة بديلة
    return `${API_URL}${normalizedPath}`;
  }
};

/**
 * يستخرج اسم الملف من تنسيقات كائنات الصور المختلفة
 * @param {Object|string} img - كائن الصورة أو سلسلة نصية
 * @returns {string|null} - اسم الملف المستخرج أو قيمة فارغة
 */
export const extractImageFilename = (img) => {
  if (!img) return null;

  // معالجة حالة السلسلة النصية
  if (typeof img === "string") {
    // إزالة أي مسار سابق
    return img.split("/").pop();
  }

  // معالجة حالة الكائن
  const possibleProperties = [
    "filename",
    "img_uri",
    "imageUrl",
    "uri",
    "path",
    "name",
  ];

  for (const prop of possibleProperties) {
    if (img[prop]) {
      const value = img[prop];
      if (typeof value === "string") {
        const filename = value.split("/").pop();
        console.log(`Found filename '${filename}' in ${prop} property`);
        return filename;
      }
    }
  }

  // استخدام المعرف كملاذ أخير
  if (img._id) {
    console.log(`Using _id as filename: ${img._id}`);
    return img._id;
  }
  if (img.id) {
    console.log(`Using id as filename: ${img.id}`);
    return img.id;
  }

  console.warn("Could not extract filename from image object:", img);
  return null;
};

/**
 * ينشئ مصفوفة من عناوين URL المحتملة للصور للتجربة
 * @param {Object|string} img - كائن الصورة أو سلسلة نصية
 * @returns {Array} - مصفوفة من عناوين URL للتجربة بالترتيب
 */
export const generateImageUrlCandidates = (img) => {
  if (!img) {
    console.log("No image data provided, using placeholder");
    return [NO_IMAGE_SVG];
  }

  // للسلاسل النصية المباشرة، حاول تحويلها
  if (typeof img === "string") {
    console.log(`Generating candidates for string: ${img}`);
    return [
      // أولاً جرب المسار المباشر
      img.startsWith('http') ? img : null,
      
      // ثم حاول التحويل مع API_URL
      resolveRelativePath(img),
      
      // جرب الدمج المباشر
      `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`,
      
      // جرب IMAGE_BASE_URL مع اسم الملف
      `${IMAGE_BASE_URL}/${img.split("/").pop()}`,
      
      // جرب مسارات مختلفة
      `${API_URL}/public/images/${img.split("/").pop()}`,
      `${API_URL}/public/uploads/${img.split("/").pop()}`,
      
      // الملاذ الأخير
      NO_IMAGE_SVG
    ].filter(Boolean);
  }

  const filename = extractImageFilename(img);
  
  // مهم: استخدم img_uri مباشرة إذا كان متاحًا - هذه هي الطريقة التي يخزن بها الخادم المسارات
  if (img.img_uri) {
    console.log(`Using img_uri: ${img.img_uri}`);
    const imgUri = img.img_uri;
    return [
      // جرب img_uri المباشر أولاً - هذا هو الأكثر احتمالاً للعمل
      imgUri.startsWith('http') ? imgUri : null,
      resolveRelativePath(imgUri),
      `${API_URL}${imgUri.startsWith('/') ? '' : '/'}${imgUri}`,
      
      // ثم اللجوء إلى المسارات المبنية
      `${API_URL}/images/${filename}`,
      `${API_URL}/uploads/${filename}`,
      `${IMAGE_BASE_URL}/${filename}`,
      
      // جرب مسارات الخادم المباشرة بدون API_URL
      `/images/${filename}`,
      `/uploads/${filename}`,
      
      // جرب مع مجلد public
      `${API_URL}/public/images/${filename}`,
      `${API_URL}/public/uploads/${filename}`,
      
      // الملاذ الأخير
      NO_IMAGE_SVG
    ].filter(Boolean);
  }
  
  if (!filename) {
    console.warn("Could not extract filename, using placeholder");
    return [NO_IMAGE_SVG];
  }
  
  console.log(`Generating URL candidates for filename: ${filename}`);
  
  // إنشاء عناوين URL محتملة متعددة للتجربة
  const candidates = [
    // عناوين URL المباشرة إذا كانت موجودة في الكائن
    img.imageUrl,
    img.uri,
    img.url,
    
    // تنويعات API_URL
    `${API_URL}/images/${filename}`,
    `${API_URL}/uploads/${filename}`,
    
    // تنويعات IMAGE_BASE_URL
    `${IMAGE_BASE_URL}/${filename}`,
    
    // المسارات النسبية
    `/images/${filename}`,
    `/uploads/${filename}`,
    
    // جرب مع مجلد public
    `${API_URL}/public/images/${filename}`,
    `${API_URL}/public/uploads/${filename}`,
    
    // الملاذ الأخير
    NO_IMAGE_SVG
  ];
  
  // تصفية الإدخالات غير المعرفة/الفارغة والإرجاع
  return candidates.filter(Boolean);
};

/**
 * يحصل على عنوان URL للصورة الأكثر احتمالاً مع تصحيح الأخطاء في وحدة التحكم
 * @param {Object|string} img - كائن الصورة أو سلسلة نصية
 * @returns {string} - أفضل عنوان URL للتجربة أولاً
 */
export const getImageUrl = (img) => {
  const candidates = generateImageUrlCandidates(img);
  console.log("URL candidates:", candidates);
  return candidates[0] || NO_IMAGE_SVG;
};

/**
 * ينشئ صورة مع عناوين URL بديلة
 * @param {Object} props - خصائص المكون
 * @returns {JSX.Element} - عنصر الصورة مع معالجة الأخطاء
 */
export const createImageWithFallbacks = (props) => {
  const { img, alt = "Image", className, style, onClick, onLoad } = props;

  // الحصول على جميع عناوين URL المحتملة للتجربة
  const urlCandidates = generateImageUrlCandidates(img);

  // معالجة الخطأ من خلال تجربة عنوان URL التالي
  const handleError = (e) => {
    const currentSrc = e.target.src;
    const currentIndex = urlCandidates.indexOf(currentSrc);

    // إذا كان لدينا المزيد من عناوين URL للتجربة
    if (currentIndex >= 0 && currentIndex < urlCandidates.length - 1) {
      const nextSrc = urlCandidates[currentIndex + 1];
      console.log(
        `Image load failed for ${currentSrc}, trying next: ${nextSrc}`
      );
      e.target.src = nextSrc;
    } else {
      // استخدام الصورة البديلة كملاذ أخير
      console.log(`All image URLs failed, using placeholder`);
      e.target.src = NO_IMAGE_SVG;
      e.target.onerror = null; // منع المزيد من الأخطاء
    }
  };

  return {
    src: urlCandidates[0] || NO_IMAGE_SVG,
    alt,
    className,
    style,
    onClick,
    onLoad,
    onError: handleError,
  };
};
