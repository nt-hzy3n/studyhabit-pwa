import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CapturedImage {
  dataUrl: string; // Base64 data URL ready to store or display
  mimeType: string;
  sizeBytes: number;
}

export const cameraService = {
  /**
   * Captures photo using Capacitor Camera API if native, or triggers camera input
   */
  async capturePhoto(): Promise<CapturedImage> {
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Camera')) {
      try {
        const image = await Camera.getPhoto({
          quality: 75,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          width: 1024,
          height: 1024,
        });

        if (image.dataUrl) {
          return {
            dataUrl: image.dataUrl,
            mimeType: `image/${image.format || 'jpeg'}`,
            sizeBytes: Math.round((image.dataUrl.length * 3) / 4),
          };
        }
      } catch (err: any) {
        // If user cancelled, rethrow or fallback
        if (err.message?.includes('cancelled')) {
          throw new Error('Camera capture cancelled by user');
        }
        console.warn('Native camera failed, falling back to web file input', err);
      }
    }

    // Web fallback: trigger hidden file input with capture="environment"
    return this.captureFromFileInput();
  },

  /**
   * Triggers a web file picker with camera capture capability
   */
  captureFromFileInput(): Promise<CapturedImage> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.setAttribute('capture', 'environment');

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          reject(new Error('No image selected'));
          return;
        }

        try {
          const compressedDataUrl = await this.compressImageFile(file, 1024, 0.75);
          resolve({
            dataUrl: compressedDataUrl,
            mimeType: 'image/jpeg',
            sizeBytes: Math.round((compressedDataUrl.length * 3) / 4),
          });
        } catch (err) {
          reject(err);
        }
      };

      input.oncancel = () => {
        reject(new Error('Image selection cancelled'));
      };

      input.click();
    });
  },

  /**
   * Resizes and compresses an image File using an offscreen canvas
   */
  compressImageFile(file: File, maxDimension = 1024, quality = 0.75): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas 2D context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },
};
