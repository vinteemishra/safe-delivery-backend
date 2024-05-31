# Project Plan: Module Data Categorization and Retrieval

## Objectives
- Organize modules into categories based on their topics or themes.
- Retrieve module data according to the specified category from `content-bundle.json`.
- Ensure efficient access and handling of module data for each category.

## Process Overview

### 1. Read the `content-bundle.json` File
- Load the JSON file into the Node.js application.
- Parse the JSON content to work with it programmatically.

### 2. Extract Categories
- Identify and list all categories from the JSON structure.
- Each category should have a unique key, description, and a list of associated modules.

### 3. Map Modules to Categories
- For each category, list the modules and their associated data.
- Ensure that each module contains necessary data such as images, videos, action cards, procedures, and drugs.

### 4. Retrieve Specific Module Data
- Access the module data for a specific category as needed.
- Implement functionality to fetch and display module data based on category selection.

## Detailed Steps

### Fetch Categories
- Connect to the Database.
- Establish a connection to the Azure Cosmos DB.
- Execute a query to fetch all module categories.

### Iterate Through Categories
- Loop through the categories retrieved from the database.
- For each category, extract the category ID and name.

### Fetch Associated Data for Each Category

#### Fetch Modules
- Retrieve the modules associated with each category.

#### Fetch Related Data for Each Module
- **Images**: Retrieve all images associated with the module and store image URLs and metadata.
- **Videos**: Retrieve all videos associated with the module and store video URLs and metadata.
- **Action Cards**: Retrieve all action cards related to the module and aggregate data and descriptions.
- **Procedures**: Retrieve all procedures linked to the module and aggregate detailed descriptions and steps.
- **Drugs**: Retrieve all drug information related to the module and aggregate drug descriptions and uses.

### Aggregate Data
- Organize all the fetched data (images, videos, action cards, procedures, drugs) for each module in the current category.
- Ensure the data is structured correctly, ready to be converted into JSON format.

### Create JSON and ZIP Files
- Convert the aggregated data for each category into a JSON file.
- Ensure the JSON file includes all necessary details.
- Create a ZIP file that includes the JSON file and all associated media files (images and videos).

### Upload Files to Azure Blob Storage
- Upload the JSON and ZIP files to Azure Blob Storage for efficient distribution and download.

## Visual Representation

```

+------------------------+
|    Azure Cosmos DB     |
+------------------------+
            |
            v
+------------------------+
| Read content-bundle.json|
+------------------------+
            |
            v
+------------------------+
|  Create HTTP Request   |
+------------------------+
            |
            v
+------------------------+
|   Send GET Request to  |
|          URL           |
+------------------------+
            |
            v
+------------------------+
|   Receive Response     |
+------------------------+
            |
            v
+------------------------+
|Concatenate Data Chunks |
+------------------------+
            |
            v
+------------------------+
|    End of Response?    |
+------------------------+
            |                
            |Yes             
            v                
+------------------------+   
|  Parse JSON Data       |   
+------------------------+   
            |                
            v                
+------------------------+   
| Extract Data Fields    |   
+------------------------+   
            |                
            v                
+------------------------+  
| Extract Categories and |
|      Modules           |
+------------------------+
            |
            v
+------------------------+
| Fetch Modules by       |
|   Category Key         |
+------------------------+
            |
            v
+------------------------+
| Output Module Data for |
|      Category          |
+------------------------+
```

```
   A[Azure Cosmos DB] --> B[Read content-bundle.json]
    B --> C[Create HTTP Request]
    C --> D[Send GET Request to URL]
    D --> E[Receive Response]
    E --> F[Concatenate Data Chunks]
    F --> G[End of Response?]
    G -->|Yes| H[Parse JSON Data]
    G -->|No| E
    H --> I[Extract Categories and Modules]
    I --> J[Fetch Modules by Category Key]
    J --> K[Output Module Data for Category]
```


# Fetch Content Bundle Documentation

## Overview

The `fetchContentBundle` function is responsible for fetching the content bundle JSON file from blob storage. This function uses the `http` module to make an HTTP GET request to the URL where the content bundle is stored and returns the parsed JSON data or we can use built-in fs module to read the JSON file.

## Function Signature

```javascript
const fetchContentBundle = async (url) => {
  // function implementation
};

