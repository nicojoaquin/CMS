import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Define a more specific type for the File
interface FormidableFile {
  filepath: string;
  newFilename: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser to use formidable
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Parse the incoming form using formidable
    const form = formidable({ multiples: false });

    const formData = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Get the file from the parsed form
    const fileField = formData.files.file;

    // Make sure we have a file and it's not an array
    if (!fileField) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Handle both array and single file cases
    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    // Cast to our FormidableFile type to access the properties we need
    const typedFile = file as unknown as FormidableFile;

    if (!typedFile.filepath) {
      return res.status(400).json({ message: "Invalid file upload" });
    }

    // Read the file from disk
    const fileData = fs.readFileSync(typedFile.filepath);

    // Convert file to base64 data URI for Cloudinary
    const dataURI = `data:${typedFile.mimetype};base64,${fileData.toString(
      "base64"
    )}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "uploads", // Store in 'uploads' folder on Cloudinary
    });

    // Return the Cloudinary result
    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return res.status(500).json({
      message: "Error uploading image",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
