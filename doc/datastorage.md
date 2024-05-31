This document describes the document structure used for persistence

Screens
-------
Table: Screens

A document for each lang

Each document contains:

```
{
  LastUpdated: "2016/12/1 12:12" // Latest timestamp of all screens 
  LastUpdatedBy: "someuser" // userid of latest Screen update
  Screens: [
    {
      key: "ok",
      text: "Ok",
      LastUpdated: "2016/12/1 12:12"  
      LastUpdatedBy: "someuser"
    },
    {
    }
  ]
  
  
   {
      id: ...
      key: "ok",
      text: "Ok",
      LastUpdated: "2016/12/1 12:12"  
      LastUpdatedBy: "someuser"
      },

}
```

RichText documents
==================
About sections, action cards and procedures all contain a number of RichText document
comprised of one or more sections of some predefined type.

```
{
  id: ''
  LastUpdated: "2016/12/1 12:12" // Latest timestamp of all sections 
  LastUpdatedBy: "someuser" // userid of latest section
  cards: [
    {
    id: ''
    type: // oneOf: header, paragraph, important, list, image, divider
    content:
    adapted:
    translated: 
    }
  ]
 
}
```


About
=====
Table: About

A document for each lang

Each document a number of RichText subdocuments:

```
{
  LastUpdated: "2016/12/1 12:12" // Latest timestamp of all screens 
  LastUpdatedBy: "someuser" // userid of latest Screen update
  Page: {...},
  Introduction: {},
  Developers: {},
  ThankYou: {},
  Copyright: {}
}
```

Assets
------
Assets such as images and videos are stored in version sets, where a version set
specifies a certain geographical region (typically skin color)

Assets are stored in the following structure:

```
/assets/<versionSet>/videos
                    /images
```

The ```default``` versionSet serves as master. Any asset found in the default
version set is required to also be found in the other version sets.
