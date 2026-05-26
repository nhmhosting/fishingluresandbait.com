export default async function convertToWebP(file, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/webp') {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const webpFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };

    img.src = URL.createObjectURL(file);
  });
}
