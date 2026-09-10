import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface StoredFileInfo {
  filePath: string;
  uri?: string;
  sizeBytes: number;
  storedLocally: boolean;
}

const PHOTOS_DIR = 'survey_photos';

export const storageService = {
  /**
   * Saves captured photo locally to disk before offline sync
   */
  async savePhotoLocally(base64Data: string, filename?: string): Promise<StoredFileInfo> {
    const safeName = filename || `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const targetPath = `${PHOTOS_DIR}/${safeName}`;

    if (Capacitor.isNativePlatform()) {
      try {
        // Strip data:image/...;base64, header if present
        const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

        await Filesystem.writeFile({
          path: targetPath,
          data: cleanBase64,
          directory: Directory.Data,
          recursive: true,
        });

        const uriResult = await Filesystem.getUri({
          path: targetPath,
          directory: Directory.Data,
        });

        const approxBytes = Math.round((cleanBase64.length * 3) / 4);

        return {
          filePath: targetPath,
          uri: uriResult.uri,
          sizeBytes: approxBytes,
          storedLocally: true,
        };
      } catch (err) {
        console.warn('[StorageService] Native Filesystem write failed, using memory fallback:', err);
      }
    }

    // Web fallback: return base64 info
    return {
      filePath: targetPath,
      sizeBytes: Math.round((base64Data.length * 3) / 4),
      storedLocally: false,
    };
  },

  /**
   * Reads photo from local device disk
   */
  async readPhotoLocally(filePath: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        const readFileResult = await Filesystem.readFile({
          path: filePath,
          directory: Directory.Data,
        });

        if (typeof readFileResult.data === 'string') {
          return readFileResult.data.startsWith('data:')
            ? readFileResult.data
            : `data:image/jpeg;base64,${readFileResult.data}`;
        }
      } catch (err) {
        console.warn('[StorageService] Failed to read file from disk:', err);
      }
    }
    return null;
  },

  /**
   * Deletes a temporary photo file after successful cloud sync
   */
  async deletePhotoLocally(filePath: string): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.deleteFile({
          path: filePath,
          directory: Directory.Data,
        });
        return true;
      } catch (err) {
        console.warn('[StorageService] Could not delete local file:', err);
        return false;
      }
    }
    return true;
  },
};
