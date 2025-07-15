import { ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a data URL string to Firebase Storage.
 * @param dataUrl The base64 data URL to upload.
 * @param path The path in Firebase Storage where the file should be saved.
 * @returns The public download URL of the uploaded file.
 */
export async function uploadImage(dataUrl: string, path: string): Promise<string> {
  // Add a timestamp to the path to ensure uniqueness for each upload
  const uniquePath = `${path}-${Date.now()}`;
  const imageRef = storageRef(storage, uniquePath);

  try {
    // The 'url' is a data URL (e.g., 'data:image/jpeg;base64,...')
    const uploadResult = await uploadString(imageRef, dataUrl, 'data_url', {
        contentType: dataUrl.match(/data:(.*);/)?.[1]
    });
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image.");
  }
}
