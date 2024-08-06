# Documentation of Module Categories

## Introduction

This documentation explains the various JavaScript functions used to fetch and process content bundles and module categories from a remote server, and create ZIP files of images and videos. The key functionalities include fetching content, filtering modules by category, and downloading media files to create ZIP archives.

## Functions :

contentURL1

This function generates a content URL based on the provided path and whether the content is in draft mode. If draft is true, the base path is set to localcontent; otherwise, it's set to release.
```
const contentURL1 = (path, draft) => {
  const basePath = draft ? 'localcontent' : 'release';
  return `${basePath}/${path}`;
}
```

### fetchContentBundle

This function fetches a content bundle in JSON format from a remote server. It constructs the full URL using the contentURL1 function and the base URL. The content is fetched using an HTTP GET request, and the function returns a promise that resolves to the parsed JSON data or rejects with an error if the fetch or parsing fails.

### fetchModuleCategory

This function fetches module categories in JSON format from a remote server. It constructs the full URL using the contentURL1 function and the base URL. The categories are fetched using an HTTP GET request, and the function returns a promise that resolves to the parsed JSON data or rejects with an error if the fetch or parsing fails.

### filterModulesByCategory

This async function filters modules by a given category ID. It fetches module categories and content bundles, then filters the modules based on the specified category ID. The function enriches each module with details about action cards, drugs, procedures, key learning points, and videos. It returns an object containing the category and the filtered modules.

### downloadImage

This function downloads an image from a specified URL with retry logic. It attempts to download the image up to a specified number of retries, with exponential backoff between attempts. The function returns a promise that resolves to the image data as a buffer or rejects with an error if the download fails.

## createImageZip

This function creates a ZIP file containing images referenced in a content file. It reads the content file, extracts image paths, downloads the images, and adds them to a ZIP archive. The function returns a promise that resolves when the ZIP file is created or rejects with an error if any step fails.

## Validate URL

Use isValidUrl to ensure the URL is valid before attempting to download.It returns true if the URL is valid, otherwise false.

## Download Video

Use downloadVideo to download the video data from the URL.

## Extract Video Path

Use extractVideoPath to get the correct video path from various types of links.

## Create ZIP File

Use createVideoZip to bundle multiple videos into a ZIP file.

## Overview

This module provides functionalities to download videos from given URLs and bundle them into a ZIP file. It includes functions to validate URLs, download videos with retry logic, and create a ZIP file containing the downloaded videos.
