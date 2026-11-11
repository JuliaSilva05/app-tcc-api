import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
	region: "auto", // Required by AWS SDK, not used by R2
	// Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		// Provide your R2 Access Key ID and Secret Access Key
		accessKeyId: process.env.R2_ACCESS_KEY_ID,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
	},
	requestChecksumCalculation: 'WHEN_REQUIRED',
  	responseChecksumValidation: 'WHEN_REQUIRED',
});

export { s3 };

// // Upload a file
// await s3.send(
// 	new PutObjectCommand({
// 		Bucket: process.env.R2_BUCKET_NAME,
// 		Key: "myfile.txt",
// 		Body: "Hello, R2!",
// 	}),
// );
// console.log("Uploaded myfile.txt");

// // Download a file
// const response = await s3.send(
// 	new GetObjectCommand({
// 		Bucket: process.env.R2_BUCKET_NAME,
// 		Key: "myfile.txt",
// 	}),
// );
// const content = await response.Body.transformToString();
// console.log("Downloaded:", content);

// // List objects
// const list = await s3.send(
// 	new ListObjectsV2Command({
// 		Bucket: process.env.R2_BUCKET_NAME,
// 	}),
// );
// console.log(
// 	"Objects:",
// 	list.Contents.map((obj) => obj.Key),
// );