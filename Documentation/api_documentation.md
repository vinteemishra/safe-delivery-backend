# API Documentation

## API Endpoints

### Admin

#### GET – Getting certificates.

Path Paramater - certId (Certificate ID)

Function:

- lookupCertId (admin/index.js)

##### HTTP Codes:-

- 400 : Missing params
- 404 : Not Found

### Screens

#### GET – Getting all screens with a language input.

Query Parameter - langId (Language ID), showAll

Function:

- index (screens/index.js)
- index (screens/screens.controller.js)
- list (screens/screens.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
{
    "key": "about",
    "content": "Abouta",
    "_table": "screens",
    "LastUpdatedBy": "jeppe@somewhere",
    "LastUpdated": 1549360098799,
    "adapted": "Abouta",
    "translated": "Abouta"
}
```

#### PUT – Updating screens with a user input.

Function:

- put (screen/index.js)
- put (screens/screens.controller.js)
- update (screens/screens.model.js)

##### HTTP Codes:-

- 200 : Success

### Languages

#### GET – Getting the list of all the languages.

Function:

- index (languages/index.js)
- list (languages / languages.controller.js)
- list (languages / languages.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
 {
    "description": "English",
    "assetVersion": "africa",
    "LastUpdatedBy": "jeppe@somewhere",
    "LastUpdated": 1606199219171,
    "_table": "languages",
    "learningPlatform": true,
    "countryCode": "WHO",
    "latitude": 0,
    "longitude": 0,
    "id": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "indicateMasterDifferences": true,
    "lastPublished": 1606199033471,
    "version": 76,
    "draftLastPublished": 1605614068729,
    "draftVersion": 71
    }
```

#### POST – Adding language

Function:

- post (languages/index.js)
- post (languages / languages.controller.js)
- upsert (languages / languages.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET – Getting the list of all the languages with a specified ID parameter

Path Parameter - ID (Language ID)

Function:

- get (languages/index.js)
- get (languages / languages.controller.js)
- find (languages / languages.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
 {
    "description": "English",
    "assetVersion": "africa",
    "LastUpdatedBy": "jeppe@somewhere",
    "LastUpdated": 1606199219171,
    "_table": "languages",
    "learningPlatform": true,
    "countryCode": "WHO",
    "latitude": 0,
    "longitude": 0,
    "id": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "indicateMasterDifferences": true,
    "lastPublished": 1606199033471,
    "version": 76,
    "draftLastPublished": 1605614068729,
    "draftVersion": 71,
    "_rid": "oh4iAM5iWACbBQAAAAAAAA==",
    "_self": "dbs/oh4iAA==/colls/oh4iAM5iWAA=/docs/oh4iAM5iWACbBQAAAAAAAA==/",
    "_etag": "\"53002084-0000-0c00-0000-5fbca7b30000\"",
    "_attachments": "attachments/",
    "_ts": 1606199219
}
```

#### DELETE – removing a language ID

Path Parameter - ID (Language ID)

Function:

- del (languages/index.js)
- del (languages / languages.controller.js)
- remove (languages / languages.model.js)

##### HTTP Codes:-

- 200 : Success

#### POST – Publishing a draft

Path Parameter - ID (Language ID)

Function:

- publish (languages/index.js)
- publish (languages / languages.controller.js)
- publisher (languages / languages.model.js)

##### HTTP Codes:-

- 403 : No Admin or developer rights
- 200 : Success

#### POST – Unpublishing a draft

Path Parameter - ID (Language ID)

Function:

- unpublish (languages/index.js)
- unpublish (languages / languages.controller.js)
- unpublisher (languages / languages.model.js)

##### HTTP Codes:-

- 403 : No Admin or developer rights
- 200 : Success

### About

#### GET – Getting information about a particular language and section.

Path parameter - section
Query parameter - langId (Language ID)

Function:

- index (about/index.js)
- index (about/about.controller.js)
- list (about/about.model.js)

##### HTTP Codes:-

- 200 : Success

#### PUT (section param) – Updating the information about a particular language and section.

Path parameter - section

Function:

- put (about/index.js)
- put (about/about.controller.js)
- update (about/about.model.js)

##### HTTP Codes:-

- 200 : Success

### APKs

#### GET LIST – Getting the list of APKs of a particular language.

Query parameter - langId (Language ID)

Function:

- list (apks/index.js)
- list (apks/apks.controller.js)
- listApks (apks/apks.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET STATUS – Checking the status of APKs

Function:

- status (apk/index.js)
- status (apk/apk.controller.js)
- getstatus (apk/apk.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
{
    "status":"READY"
}
```

#### GET genAPK - Generating an APK with a language ID and a draft.

Query parameter - langId (Language ID),draft

Function:

- genApk(apk/index.js)
- genApk (apk/apk.controller.js)
- generateApk (apk/apk.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET DOWNLOAD – Download an attachment with a language ID and filename

Query parameter - langId (Language ID),filename

Function:
download(apk/index.js)
download (apk/apk.controller.js)
downloadApk (apk/apk.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET LATEST

Query parameter - langId (Language ID)

Function:

- downloadLatest(apk/index.js)
- downloadLatest (apk/apk.controller.js)
- downloadLatestApk (apk/apk.model.js)

##### HTTP Codes:-

- 200 : Success

### Assets

#### GET IMAGES – Getting the images assets

Query parameter - version

Function:

- imagesIndex(assets/index.js)
- imagesIndex (assets/assets.controller.js)
- listImages (assets/assets.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET VIDEOS – Getting the videos assets

Function:

- videosIndex(assets/index.js)
- videosIndex (assets/assets.controller.js)
- listvideos (assets/assets.model.js)

##### HTTP Codes:-

- 200 : Success

### Modules

#### GET – Getting the list of modules with a specified language ID.

Query parameter - langId (Language ID)

Function:

- index(modules/index.js)
- index (modules/modules.controller.js)
- list (modules/modules.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
{
    "actionCards": [],
    "procedures": [
        "mixing-alcohol-based-handrub_1487245431108",
        "mixing-chlorine-solution_1487245480781"],
    "videos": [
        "/english WHO/Infection prevention/intro",
        "/english WHO/Infection prevention/hand_hygiene",
        "/english WHO/Infection prevention/procedure_for_handwash",
        "/english WHO/Infection prevention/procedure_for_handrub",
        "/english WHO/Infection prevention/personal_protective_equipment",
        "/english WHO/Infection prevention/cleaning_decontamination",
        "/english WHO/Infection prevention/storage",
        "/english WHO/Infection prevention/housekeeping",
        "/english WHO/Infection prevention/hiv_hepatitis_b_prevention"
        ]
}
```

#### PUT – Updating the modules.

Function:

- put(modules/index.js)
- put (modules/modules.controller.js)
- update (modules/modules.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET – Getting the list of modules with a specified module key

Path parameter - modulekey (Module ID)
Query parameter - langId (Language ID)

Function:

- get(modules/index.js)
- get (modules/modules.controller.js)
- find (modules/modules.model.js)

##### HTTP Codes:-

- 200 : Success

#### POST – Inserting modules.

Function:

- post (modules/index.js)
- post (modules/modules.controller.js)
- insert (modules/modules.model.js)

##### HTTP Codes:-

- 200 : Success

#### DELETE – Deleting modules.

Path parameter - modulekey (Module ID)

Function:

- del (modules/index.js),
- del (modules/modules.controller.js)
- remove (modules/modules.model.js)

##### HTTP Codes:-

- 200 : Success

### Procedures

#### GET – Listing procedures with a specified language ID.

Query parameter : langId (Language ID), showAll

Function:

- index(procedures/index.js)
- index (procedures/procedures.controller.js)
- proceduresModel (procedures/procedures.model.js)
- RichDocumentModel.list (lib/richdocumentmodel.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[
{
    "chapters": [
    {
        "key": "usage_1487245873343",
        "langId": "",
        "cards": [{
            "id": 1,
            "content": {
            "entityMap": {},
            "blocks": [{
                "key": "819ec",
                "text": "Using alcohol-based handrub is indicated when hands are visibly clean.",
                "type": "unstyled",
                "depth": 0,
                "inlineStyleRanges": [],
                "entityRanges": [],
                "data": {}
                }]
                }
         }]

    }
}
]
```

#### PUT – updating procedures.

Function:

- put (procedures/index.js)
- put (procedures/procedures.controller.js)
- proceduresModel (procedures/procedures.model.js)
- RichDocumentModel.update (lib/richdocumentmodel.js)

##### HTTP Codes:-

- 200 : Success

#### GET – listing procedure with a specified procedure key.

Path parameter : procedureKey (procedure ID)
Query parameter : langId (Language ID)

Function:

- get (procedures/index.js)
- get (procedures/procedures.controller.js)
- proceduresModel (procedures/procedures.model.js)
- RichDocumentModel.find (lib/richdocumentmodel.js)

##### HTTP Codes:-

- 200 : Success

#### Post – Inserting procedures.

Function:

- post (procedures/index.js)
- post (procedures/procedures.controller.js)
- proceduresModel (procedures/procedures.model.js)
- RichDocumentModel.insert (lib/richdocumentmodel.js)

##### HTTP Codes:-

- 200 : Success

#### Delete - Removing procedures with a specified procedure key.

Path parameter : procedureKey (procedure ID)

Function:

- del (procedures/index.js)
- del (procedures/procedures.controller.js)
- proceduresModel (procedures/procedures.model.js)
- RichDocumentModel.remove (lib/richdocumentmodel.js)

##### HTTP Codes:-

- 200 : Success

### Action cards

#### GET – Getting the list of all action cards with a specified language ID.

Query parameter : langId (Language ID), showAll

Function:

- index (action-cards/index.js)
- index (action-cards/action-cards.controller.js)
- actionCardsModel (action-cards/action-cards.model.js)
- RichDocumentModel.insert (lib/richdocumentmodel.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[
    {
    "chapters": [{
    "key": "pediatric-drugs_1486735985488",
    "langId": "",
    "cards": [{
        "id": 1,
        "content": {
        "entityMap": {},
        "blocks": [{
            "key": "630cb",
            "text": "Drug dose of common drugs for newborns below one month of age.",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [],
            "entityRanges": [],
            "data": {}
                }]
                }
            }]
            }]
    }
]
```

#### PUT – Updating the actions card model.

Function:

- put (action-cards/index.js)
- put (action-cards/action-cards.controller.js)
- actionCardsModel (action-cards/action-cards.model.js)
- RichDocumentModel.update (lib/richdocumentmodel.js)

##### HTTP Codes:-

- 200 : Success

#### GET (cardkey param) – Getting the list of action cards with a specified language ID and card key.

Path parameter : cardKey (card ID)
Query parameter : langId (Language ID)

Function:

- get (action-cards/index.js)
- get (action-cards/action-cards.controller.js)
- actionCardsModel (action-cards/action-cards.model.js)
- RichDocumentModel.find (lib/richdocumentmodel.js)

##### HTTP Codes:-

- 200 : Success

#### POST – Inserting docs in the action cards model.

Function:

- post (action-cards/index.js),
- post (action-cards/action-cards.controller.js),
- actionCardsModel (action-cards/action-cards.model.js)
- RichDocumentModel.insert (lib/richdocumentmodel.js)

##### HTTP Codes:-

- 200 : Success

#### DELETE – Deleting action cards with a specified card key

Path parameter : cardKey (card ID)

Function:

- del (action-cards/index.js)
- del (action-cards/action-cards.controller.js)
- actionCardsModel (action-cards/action-cards.model.js)
- RichDocumentModel.remove (lib/richdocumentmodel.js)

##### HTTP Codes:-

- 200 : Success

### Drugs

#### GET – Getting the list of all drugs with a specified language ID.

Query parameter : langId (Language ID), showAll

Function:

- index (drugs/index.js)
- index (drugs/drugs.controller.js)
- list (drugs/drugs.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "key": "adrenaline_1486111274533",
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "cards": [{
        "id": 1,
        "content": {
        "entityMap": {},
        "blocks": [{
            "key": "60th0",
            "text": "Indication and Usage",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [],
            "entityRanges": [],
            "data": {}
            }]
            },
            "type": "header",
            "adapted": {
            "entityMap": {},
            "blocks": [{
                "key": "60th0",
                "text": "Indication and Usage",
                "type": "unstyled",
                "depth": 0,
                "inlineStyleRanges": [],
                "entityRanges": [],
                "data": {}
                }]
                },
        "translated": {
            "entityMap": {},
            "blocks": [{
                "key": "60th0",
                "text": "Indication and Usage",
                "type": "unstyled",
                "depth": 0,
                "inlineStyleRanges": [],
                "entityRanges": [],
                "data": {}
                }]
                }
            }
]
```

#### PUT – Updating the drugs information.

Function:

- put (drugs/index.js)
- put (drugs/drugs.controller.js)
- update (drugs/drugs.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET – Getting the drugs information with a specified language ID and drug key.

Path parameter : drugKey (drug ID)
Query parameter : langId (Language ID)

Function:

- get (drugs/index.js)
- get (drugs/drugs.controller.js)
- find (drugs/drugs.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "key": "adrenaline_1486111274533",
    "langId": "",
    "cards": [{
        "id": 1,
        "content": {
        "entityMap": {},
        "blocks": [{
            "key": "60th0",
            "text": "Indication and Usage",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [],
            "entityRanges": [],
            "data": {}
            }]
        },
                "type": "header"
    }
        ]
}]
```

#### POST – Inserting drugs inforamtion.

Function:

- post (drugs/index.js)
- post (drugs/drugs.controller.js)
- insert (drugs/drugs.model.js)

##### HTTP Codes:-

- 200 : Success

#### DELETE – Deleting drugs inforamtion with a specified drug key.

Path parameter : drugKey (drug ID)

Function:

- del (drugs/drugs.js)
- del (drugs/drugs.controller.js)
- remove (drugs/drugs.model.js)

##### HTTP Codes:-

- 200 : Success

### Notifications

#### GET – Getting all notifications.

Query parameter : langId (Language ID), showAll

Function:

- index (notifications/index.js)
- index (notifications/notifications.controller.js)
- list (notifications/notifications.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[
    {
    "key": "test-notification_1543571133357",
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "content": {
        "shortDescription": "Test notification",
        "longDescription": "This is done for testing purposes"
        },
        "adapted": {
            "shortDescription": "Test notification",
            "longDescription": "This is done for testing purposes"
            },
        "translated": {
            "shortDescription": "Test notification",
            "longDescription": "This is done for testing purposes"
        },
        "link": "action-card:emergency-referral---newborn-management_1527675027578",
        "LastUpdatedBy": "jeppe@somewhere",
        "LastUpdated": 1549542662292,
        "_table": "notifications"
    }
]
```

#### PUT – Updating the notifications.

Function:

- put (notifications/index.js)
- put (notifications/notifications.controller.js)
- update (notifications/notifications.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET – Getting the notifications with a specified language ID and notification key.

Path parameter : notificationkey (notification ID)
Query parameter : langId (Language ID)

Function:

- get (notifications/index.js)
- get (notifications/notifications.controller.js)
- find (notifications/notifications.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[
    {
    "key": "ghjghj_1550565973011",
    "langId": "",
    "content": {
        "shortDescription": "ghjghj",
        "longDescription": ""
        },
        "adapted": {
        "shortDescription": "ghjghj",
        "longDescription": ""
        },
        "translated": {
        "shortDescription": "ghjghj",
        "longDescription": ""
        },
    "LastUpdatedBy": "jeppe@somewhere",
    "LastUpdated": 1550565973016,
    "_table": "notifications",
    "id": "5ba95ee1-7fe6-8bc7-98d9-c789ccb468b9"
    }
]
```

#### POST – Inserting notifications.

Function:

- post (notifications/index.js)
- post (notifications/notifications.controller.js)
- insert (notifications/notifications.model.js)

##### HTTP Codes:-

- 200 : Success

#### DELETE – Deleting notifications with a specified notification key.

Path parameter : notificationkey (notification ID)

Function:

- del (notifications/notifications.js)
- del (notifications/notifications.controller.js)
- remove (notifications/notifications.model.js)

##### HTTP Codes:-

- 200 : Success

### Auth

- **200 : Success (Sample Response)**

```
{
    "userId": "jeppe@somewhere",
    "role": "admin"
}
```

### Key Learning Points

#### GET – Getting all key learning points.

Query parameter : langId (Language ID), showAll

Function:

- index (key-learning-points/index.js)
- index (key-learning-points/key-learning-points.controller.js)
- keyLearningPointsMode.list (key-learning-points/key-learning-points.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "key": "prevent-infections_1497356424386",
    "questions": [{
        "answers": [{
        "correct": false,
        "value": {
        "content": "Only myself",
        "translated": "Only myself",
        "adapted": "Only myself" }
        }]
    }
}]
```

#### PUT – Updating the key learning points.

Function:

- put (key-learning-points/index.js)
- put (key-learning-points/key-learning-points.controller.js)
- keyLearningPointsMode.list (key-learning-points/key-learning-points.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET – Getting the key learning points with a specified language ID and key learning parameter key.

Path parameter : klpKey (key learning parameter ID)
Query parameter : langId (Language ID)

Function:

- get (key-learning-points/index.js)
- get (key-learning-points/key-learning-points.controller.js)
- keyLearningPointsMode.find (key-learning-points/key-learning-points.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "key": "prevent-infections_1497356424386",
    "questions": [{
    "answers": [{
        "correct": false,
        "value": {
            "content": "Only myself",
            "translated": "Only myself",
            "adapted": "Only myself" }
            }]
    }]
}]
```

#### POST – Inserting key learning points.

Function:

- post (key-learning-points/index.js)
- post (key-learning-points/key-learning-points.controller.js)
- keyLearningPointsModel.insert (key-learning-points/key-learning-points.model.js)

##### HTTP Codes:-

- 200 : Success

#### DELETE – Deleting key learning points with a specified key learning parameter key.

Path parameter : klpKey (key learning parameter ID)

Function:

- del (key-learning-points/index.js)
- del (key-learning-points/key-learning-points.controller.js)
- keyLearningPointsModel.remove (key-learning-points/key-learning-points.model.js)

##### HTTP Codes:-

- 200 : Success

### Cases

#### GET – Getting all cases.

Query parameter - langId (Language ID)

Function:

- index (cases/index.js)
- index (cases/cases.controller.js)
- casesModel.list (cases/cases.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "key": "prevent-infections_1497356424386",
    "questions": [{
    "answers": [{
        "correct": false,
        "value": {
            "content": "Only myself",
            "translated": "Only myself",
            "adapted": "Only myself" }
            }]
    }]
}]
```

#### PUT – Updating the cases.

Function:

- put (cases/index.js)
- put (cases/cases.controller.js)
- casesModel.update (cases/cases.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET (caseKey pram) – Getting the cases with a specified language ID and case key.

Path parameter : caseKey (case ID)
Query parameter : langId (Language ID)

Function:

- get (cases/index.js)
- get (cases/cases.controller.js)
- cases.find (cases/cases.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "key": "case-1_1504530230752",
    "questions": [{
        "answers": [{
        "value": {
            "content": "There is no effective way to prevent PPH.",
            "translated": "There is no effective way to prevent PPH.",
            "adapted": "There is no effective way to prevent PPH."
                },
            "correct": false,
            "result": "deadly"
                }]
    }]
}]
```

#### POST – Inserting new cases.

Function:

- post (cases/index.js)
- post (cases/cases.controller.js)
- cases.insert (cases/cases.model.js)

##### HTTP Codes:-

- 200 : Success

#### DELETE – Deleting the cases with a specified case key.

Path parameter : caseKey (case ID)

Function:

- del (cases/index.js)
- del (cases/cases.controller.js)
- cases.remove (cases/cases.model.js)

##### HTTP Codes:-

- 200 : Success

### Certificates

#### GET – Getting all certificates.

Query parameter - langId (Language ID)

Function:

- index (certificates/index.js)
- index (certificates/certificates.controller.js)
- list (certificates/certificates.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "cases": [
        "case-1_1504530230752",
        "case-2_1504530652286",
        "case-3_1504532791316",
        "case-4_1504532954750",
        "case-5_1504533151306",
        "case-6_1504534071626",
        "case-7_1504535041184",
        "case-8-_1504536319020",
        "case-9_1504536920101",
        "case-10_1504538224301" ],
        "deadly": 1,
        "passRate": 70,
        "key": "certificate-2017_1503996242450",
        "description": "Certificate 2017",
        "name": "Certificate 2017",
        "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
        "LastUpdatedBy": "lauren@maternity.dk",
        "LastUpdated": 1525769882048,
        "_table": "certificates",
        "next_id": 24,
        "cards": [{
            "id": 1,
            "content": {
            "entityMap": {},
            "blocks": [{
                "key": "ar33k",
                "text": "Certificate Exam",
                "type": "unstyled",
                "depth": 0,
                "inlineStyleRanges": [],
                "entityRanges": [],
                "data": {}
                }]
                },
            "type": "header",
            "adapted": {
            "entityMap": {},
            "blocks": [{
                "key": "ar33k",
                "text": "Certificate Exam",
                "type": "unstyled",
                "depth": 0,
                "inlineStyleRanges": [],
                "entityRanges": [],
                "data": {}
                }]
            },
            "translated": {
            "entityMap": {},
            "blocks": [{
                "key": "ar33k",
                "text": "Certificate Exam",
                "type": "unstyled",
                "depth": 0,
                "inlineStyleRanges": [],
                "entityRanges": [],
                "data": {}
            }]
        }
}]
```

#### PUT – Updating certificates.

Function:

- put (certificates/index.js)
- put (certificates/certificates.controller.js)
- update (certificates/certificates.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET – Getting the certificates with a specified language ID and certificate key.

Path parameter : certKey (certificate ID)
Query parameter : langId (Language ID)

Function:

- get (certificates/index.js)
- get (certificates/certificates.controller.js)
- find (certificates/certificates.model.js)

##### HTTP Codes:-

- 200 : Success

#### POST – Inserting new certificates.

Function:

- post (certificates/index.js)
- post (certificates/certificates.controller.js)
- insert (certificates/certificates.model.js)

##### HTTP Codes:-

- 200 : Success

#### DELETE – Deleting the cases with a specified certKey key.

Path parameter : certKey (certificate ID)

Function:

- del (certificates/index.js)
- del (certificates/certificates.controller.js)
- remove (certificates/certificates.model.js)

##### HTTP Codes:-

- 200 : Success

### On boarding

#### GET – Getting all on-boarding.

Query parameter - langId (Language ID)

Function:

- index (onboarding/index.js)
- index (onboarding/onboarding.controller.js)
- list (onboarding/onboarding.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "LastUpdatedBy": "jeppe@somewhere",
    "key": "onboarding-question---number-1_1550824470215",
    "_table": "onboarding",
    "LastUpdated": 1551086226506,
    "description": {
        "content": "Onboarding Question - Number 1" },
    "question": {
        "content": "Is this device a shared phone/tablet?",
        "adapted": "Is this device a shared phone/tablet?",
        "translated": "Is this device a shared phone/tablet?"
        },
    "answers": [{
        "content": "Yes, it is a shared device",
        "adapted": "Yes, it is a shared device",
        "translated": "Yes, it is a shared device"
        },
        {
        "content": "No, I'm the only user",
        "adapted": "No, I'm the only user",
        "translated": "No, I'm the only user"
        }],
    "id": "fb8e2b36-b6a3-76f8-eb78-00423653f3d8"
    },
    {
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "LastUpdatedBy": "jeppe@somewhere",
    "key": "onborading-question---number-2_1551085657656",
    "_table": "onboarding",
    "LastUpdated": 1551086231313,
    "description": {
        "content": "Onborading Question - Number 2"
        },
    "question": {
        "content": "Approximately how many users share this device?",
        "adapted": "Approximately how many users share this device?",
        "translated": "Approximately how many users share this device?"
        },
    "answers": [{
        "content": "2 - 5 users",
        "adapted": "2 - 5 users",
        "translated": "2 - 5 users"
        },
        {
        "content": "5 - 10 users",
        "adapted": "5 - 10 users",
        "translated": "5 - 10 users"
        },
        {
        "content": "10+ users",
        "adapted": "10+ users",
        "translated": "10+ users"
        }],
    "id": "2b7b0c26-7ce7-8abb-47fc-c737cb641b48"
}]
```

#### PUT – Updating on-boarding.

Function:

- put (onboarding/index.js)
- put (onboarding/onboarding.controller.js)
- update (onboarding/onboarding.model.js)

##### HTTP Codes:-

- 200 : Success

#### GET – Getting the on-boarding with a specified language ID and onboarding key.

Path parameter - onbKey (On-boarding ID)
Query parameter - langId (Language ID)

Function:

- get (onboarding/index.js)
- get (onboarding/onboarding.controller.js)
- find (onboarding/onboarding.model.js)

##### HTTP Codes:-

- **200 : Success (Sample Response)**

```
[{
    "langId": "e3116616-a17f-4884-a7f8-3993f098e5d0",
    "LastUpdatedBy": "jeppe@somewhere",
    "key": "onboarding-question---number-1_1550824470215",
    "_table": "onboarding",
    "LastUpdated": 1551086226506,
    "description": {
        "content": "Onboarding Question - Number 1"
        },
    "question": {
        "content": "Is this device a shared phone/tablet?",
        "adapted": "Is this device a shared phone/tablet?",
        "translated": "Is this device a shared phone/tablet?"
        },
    "answers": [{
        "content": "Yes, it is a shared device",
        "adapted": "Yes, it is a shared device",
        "translated": "Yes, it is a shared device" },
        {
        "content": "No, I'm the only user",
        "adapted": "No, I'm the only user",
        "translated": "No, I'm the only user"
        }],
    "id": "fb8e2b36-b6a3-76f8-eb78-00423653f3d8"
}]
```

#### POST – Inserting the on-boarding.

Function:

- post (onboarding/index.js)
- post (onboarding/onboarding.controller.js)
- insert (onboarding/onboarding.model.js)

##### HTTP Codes:-

- 200 : Success

#### DELETE – Deleting the on-boarding with a specified onboarding key.

##### HTTP Codes:-

- 200 : Success

Function:

- del (onboarding/index.js)
- del (onboarding/onboarding.controller.js)
- remove (onboarding/onboarding.model.js)

##### HTTP Codes:-

- 200 : Success
