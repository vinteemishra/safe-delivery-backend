// Import the required function from blobService.js
import { getBlockBlobToBuffer } from "./server/lib/blobstorage";

// Define the function to fetch and read content-bundle.json
const fetchContentBundle = async () => {
  try {
    const buffer = await getBlockBlobToBuffer("content-bundle.json");
    const contentBundle = JSON.parse(buffer.toString());
    console.log('Content of content-bundle.json:', contentBundle);
    return contentBundle;
  } catch (error) {
    console.error('Error fetching content-bundle.json:', error);
    throw error;
  }
};

// Call the function to fetch and log the content of content-bundle.json
fetchContentBundle();
