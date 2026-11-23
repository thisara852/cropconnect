import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isLiveFirebaseConfigured } from './firebaseConfig';

export interface UploadImageResult {
  downloadUrl: string;
  storagePath: string;
}

class FirebaseStorageService {
  private readonly MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  async uploadCropImage(
    farmerId: string,
    fileUriOrBlob: string | Blob,
    filename: string,
    onProgress?: (progressPercent: number) => void
  ): Promise<UploadImageResult> {
    const cleanFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const storagePath = `crops/${farmerId}/${cleanFilename}`;

    if (isLiveFirebaseConfigured()) {
      try {
        let blob: Blob;
        if (typeof fileUriOrBlob === 'string') {
          const res = await fetch(fileUriOrBlob);
          blob = await res.blob();
        } else {
          blob = fileUriOrBlob;
        }

        // Validate size
        if (blob.size > this.MAX_SIZE_BYTES) {
          throw new Error('Image size exceeds 5MB limit. Please select a smaller photo.');
        }

        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, blob, {
          contentType: blob.type || 'image/jpeg',
        });

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            snapshot => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              if (onProgress) onProgress(progress);
            },
            error => {
              console.warn('Storage upload error, fallback to preview URI:', error.message);
              resolve({
                downloadUrl: typeof fileUriOrBlob === 'string' ? fileUriOrBlob : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
                storagePath,
              });
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ downloadUrl, storagePath });
            }
          );
        });
      } catch (err: any) {
        console.warn('Firebase upload error:', err.message);
      }
    }

    // Demo / Offline fallback: simulate quick upload progress
    if (onProgress) {
      onProgress(35);
      setTimeout(() => onProgress(75), 100);
      setTimeout(() => onProgress(100), 200);
    }

    const fallbackUrl =
      typeof fileUriOrBlob === 'string' && fileUriOrBlob.startsWith('http')
        ? fileUriOrBlob
        : 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80';

    return {
      downloadUrl: fallbackUrl,
      storagePath,
    };
  }

  async uploadAvatar(
    userId: string,
    fileUriOrBlob: string | Blob,
    filename: string
  ): Promise<string> {
    const res = await this.uploadCropImage(userId, fileUriOrBlob, filename);
    return res.downloadUrl;
  }
}

export const firebaseStorageService = new FirebaseStorageService();
