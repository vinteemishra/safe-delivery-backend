File structure
==============


All content is stored in the S3 bucket ```content.sda.maternity.dk```

To upload the sample conten, ensure there's a valid "maternity" AWS profile and use: 
```
aws s3 sync . s3://content.sda.maternity.dk --profile maternity
``` 

The object structure is as follows:

```
index.json
   /bundles
     /en/42
       bundle.json
       infection-prevention.json
       ...   
   /assets
     /black
       /videos
         xyz.mp4
       /images
         abc.png
```


index.json
----------
```
{
  "version": 1,
  "locales": [
    {
      "lang": "en",
      "description": "Global English",
      "version": 34
    },
    {
      "lang": "fr",
      "description": "French",
      "version": 42
    }
  ]
}

```

bundle.json
-----------

```
{
  "lang": "en",
  "version": 42,
  "screen": {
    "ok": "Ok",
    "cancel": "Cancel",
    "next": "Next"
  },
  "about": "<h1>Some header<h1>lorem ipsum  ",

  "videos": {
    "vid1": {
      "icon": "icon1",
      "description": "Hand Hygiene",
      "src": "/assets/black/videos/xyz.mp4"
    },
    "vid2": {
      "icon": "pic2",
      "description": "Hand Hygiene",
      "src": "/assets/black/videos/xyz.mp4"
    }
  },
  "images": {
    "icon1": {
      "src": "/assets/black/images/abc.png",
    },
    "pic2": {
      "src": "/assets/black/images/abc.png",
    }
  },
  "themes": ["infection-prevention"]
}

```

\<theme>.json
----------
```
    {
      icon: "pic2",
      description: "Infection Prevention",
      videos: ["vid1", "vid2"],
      actioncards: [
        {
        description: "Emergency management",
        content: "
        <h1>stuff</<h1>
        "
        },
        ...
      ]
      procedures: 
    }

```

