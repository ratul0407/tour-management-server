/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/appError";
import stream from "stream";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const publicId = `pdf/${fileName}-${Date.now()}`;
      const bufferStream = new stream.PassThrough();
      bufferStream.end();
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            public_id: publicId,
            folder: "pdf",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    throw new AppError(401, "Error uploading file", error.message);
  }
};
export const deleteImgFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId);
      console.log(`File ${publicId} is deleted from cloudinary`);
    }
  } catch (error: any) {
    throw new AppError(401, "Cloudinary image deletion failed", error.message);
  }
};

export const cloudinaryUpload = cloudinary;
