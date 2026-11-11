import { s3 } from "../config/r2";
import {
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
  S3,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getGetSignedUrl = async (key) => {
  const getUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ 
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key
    }),
    { expiresIn: 3600 },
  );

  return getUrl;
}

export const getPutSignedUrl = async (creatorId, type, format) => {
  const extension = format.toLowerCase().replace(/^\./, "");

  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    m4a: "audio/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    webm: "audio/webm",
  };

  const contentType = mimeTypes[extension];

  if (!contentType || !contentType.startsWith(`${type}/`)) {
    throw new Error(`Unsupported file format: ${type}/${extension}`);
  }

  const key = `users/${creatorId}/${type}/${crypto.randomUUID()}.${extension}`;

  const putUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 3600 }
  );

  return { key, putUrl, contentType };
};