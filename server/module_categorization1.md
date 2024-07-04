# Project Plan: Categorization and Content Bundling

## Objectives
- Organize modules into categories based on their topics or themes.
- Create `content-bundle.json` files for each category, containing module data and resources.
- Package the `content-bundle.json` files into ZIP archives for efficient distribution and download.

## Block Diagram
```plaintext
+---------------------------------------+
|              Start                    |
+---------------------------------------+
                  |
                  v
+---------------------------------------+
|         Fetch Categories              |
+---------------------------------------+
                  |
                  v
+---------------------------------------+
|     Iterate Through Categories        |
+---------------------------------------+
                  |
                  v
+---------------------------------------+
|   Fetch Modules for Category          |
+---------------------------------------+
                  |
                  v
+---------------------------------------+
|           Aggregate Data              |
+---------------------------------------+
                  |
                  v
+---------------------------------------+
|      Create JSON and ZIP Files        |
+---------------------------------------+
                  |
                  v
+---------------------------------------+
|      Make ZIP Files Available         |
+---------------------------------------+
                  |
                  v
+---------------------------------------+
|               End                     |
+---------------------------------------+
```
## Existing Container with Module Category and assets/module_categories.json are shown below:


<img src=".\image-2.png" alt="Example Image1" style="width:800px;"/>


<img src=".\image-3.png" alt="Example Image2" style="width:800px;"/>


```
{
	"version": 6,
	"date": "2024-05-22T08:48:43.003Z",
	"categories": [
		{
			"key": "test_1695928195411",
			"description": "Test",
			"icon": "/icon/actioncard/emergency_referral",
			"LastUpdated": 1715589836294,
			"_table": "module-categories",
			"id": "b08c23ad-1e01-2d12-102b-ad6706e7358a",
			"modules": [
				"active-management-of-third-stage-labour_1487678773861",
				"normal-labour-and-birth_1592462784361",
				"hypertension_1487677992452",
				"infection-prevention_1487676001934",
				"post-abortion-care_1487676484604"
			]
		},
		{
			"key": "test-module11_1696570699824",
			"description": "Test Module11",
			"icon": "/icon/actioncard/Progestin_only_pills",
			"LastUpdated": 1716269326826,
			"_table": "module-categories",
			"id": "a899f78d-e0cb-8c3f-303c-e9ad60080c92",
			"modules": [
				"post-abortion-care_1487676484604",
				"infection-prevention_1487676001934"
			]
		},
		{
			"key": "test2_1713418796057",
			"description": "test2",
			"icon": "/icon/actioncard/newborn_management_pediatric_drugs_and_fluids",
			"LastUpdated": 1715590031875,
			"_table": "module-categories",
			"id": "aceabefb-9e12-5844-2df1-fba20f0bccc1",
			"modules": [
				"hypertension_1487677992452",
				"normal-labour-and-birth_1592462784361",
				"active-management-of-third-stage-labour_1487678773861"
			]
		}
	]
}
```

## Process Overview

## Fetch Categories

Connect to the Database
Establish a connection to the Azure Cosmos DB.
Retrieve Categories
Execute a query to fetch all module categories.


## Iterate Through Categories

Loop Through Categories
For each category retrieved from the database:
Extract the category ID and name.


## Fetch Associated Data for Each Category

### Fetch Modules

For each category, retrieve the modules associated with it.

Fetch Related Data for Each Module

#### Images

Retrieve all images associated with the module.
Store image URLs and metadata.

#### Videos

Retrieve all videos associated with the module.
Store video URLs and metadata.

#### Action Cards

Retrieve all action cards related to the module.
Aggregate data and descriptions.

#### Procedures

Retrieve all procedures linked to the module.
Aggregate detailed descriptions and steps.

#### Drugs

Retrieve all drug information related to the module.
Aggregate drug descriptions and uses.

### Aggregate Data

#### Collect Data

Organize all the fetched data (images, videos, action cards, procedures, drugs) for each module in the current category.

Ensure the data is structured correctly, ready to be converted into JSON format.

### Create JSON and ZIP Files

Convert the aggregated data for each category into a JSON file.

Ensure the JSON file includes all necessary details.

Create a ZIP file that includes the JSON file and all associated media files (images and videos).

Upload Files to Azure Blob Storage


### Conclusion

This document outlines the detailed process of fetching module data, aggregating it, and creating downloadable JSON and ZIP files for each category. 

### High level Representation of Flow:

            +----------------------------------+
            |           Azure Cosmos DB        |
            +----------------------------------+
                        |     |     |
                   +----+     |     +----+
                   |          |          |
            +------v----+  +-v------+  +--v--------+
            |   Module  |  | Category|  |   Other   |
            |   Data    |  |   Data  |  |   Data    |
            +-----------+  +---------+  +-----------+
                        \    |    /   
                         \   |   /
                          \  |  /
                           \ | /
                            \|
                      +------------+
                      |    Logic   |
                      |  Processor |
                      +------------+
                             |
                             |
                      +------+------+
                      |  Output    |
                      |  Storage   |
                      +------------+




## Low Level Implementation Overview:


```
    A[Understand the Code Structure] --> B[Set Up Environment];
    B --> C[Implement `list` Function];
    C --> D[Implement `createBlockBlobFromText` Function];
    D --> E[Implement `publisher` Function];
    E --> F[Implement `publishLang` Function];
    F --> G[Integrate with `publish` Function];
    G --> H[Test and Debug];
    H --> I[Documentation];
    I --> J[Deployment];

```

### References:

Azure Cosmos DB

Azure Blob Storage

Data Aggregation Techniques


## Questions:

1. should i need to make any changes in azure cosmos db?
2. should category.json created on click of same publish button with content-bundle.json?
3. Accessing module data

## Detailed Task List

### contentURL
Objective: Generate the full content URL based on a draft flag.

Determine Base Path: Identify the base path using the draft flag.

Construct URL: Combine the base path with the necessary components to form the full content URL.

Return URL: Return the constructed content URL.

### fetchContentBundle

Objective: Retrieve and parse the content bundle JSON.

Construct URL: Build the URL for the content bundle.

Fetch JSON: Send a request to fetch the content bundle JSON from the server.

Parse Response: Parse the JSON response.

Error Handling: Manage errors that occur during fetching or parsing.

### fetchModuleCategory

Objective: Retrieve and parse the module categories JSON.

Construct URL: Build the URL for the module categories JSON.

Fetch JSON: Send a request to fetch the module categories JSON from the server.

Parse Response: Parse the JSON response.

Error Handling: Manage errors that occur during fetching or parsing.

### filterModulesByCategory

Objective: Filter modules by category and enrich them with additional details.

Fetch Categories: Use fetchModuleCategory to get the module categories.

Find Category: Identify the specified category using categoryId.

Fetch Content Bundle: Use fetchContentBundle to get the content bundle.

Filter Modules: Filter the modules based on the identified category.

Attach Details: Enrich each module with additional details (action cards, drugs, procedures, key learning points, videos).

Error Handling: Manage errors that occur during fetching or processing.

### downloadImage

Objective: Download an image from a specified URL with error handling.

Download Image: Initiate the download from the provided URL.

Retry Mechanism: Implement retries if the download fails or times out.

Error Handling: Manage download errors effectively.

### createImageZip

Objective: Create a ZIP file containing downloaded images.

Read Content JSON: Parse the content JSON file to extract image URLs.

Collect Image URLs: Gather all image URLs from the parsed content.

Download Images: Download the images from the collected URLs.

Create ZIP: Compile the downloaded images into a ZIP file.

Error Handling: Manage errors that occur during image downloading and ZIP creation.

### downloadVideo

Objective: Download a video from a specified URL with error handling.

Download Video: Initiate the download from the provided URL.

Retry Mechanism: Implement retries if the download fails or times out.

Error Handling: Manage download errors effectively.

### createVideoZip

Read and parse the content JSON file.

Collect video URLs from the content.

Download videos.

Create a ZIP file containing the downloaded videos.

Handle errors in downloading videos and creating the ZIP file.