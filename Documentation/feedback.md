# Documentation

## FEEDBACKS STORED IN DATABASE

- Database: {
    "ageBracket": "18 - 25",
    "contentToBeIncluded": "Shoulder dystocia",
    "myLearningReview": "Too easy",
    "pronoun": "He/Him",
    "rating": 4,
    "review": "Find",
    "usageReason": "Self-studying to get professional development credit",
    "usefulModules": "COVID-19, Infection Prevention",
    "_table": "feedback",
    "id": "8aa801e8-d5be-8c1f-79db-2e166a30ec8c",
}

## PUBLIC API Endpoints

### POST FEEDBACK

- POST URL: /api/public/feedback

- Sample Body: {

"pronoun": "He/Him",
"ageBracket": "Under 18",
"usageReason": "Self-studying at home to retain knowledge",
"rating": 5,
"review": "AWESOME",
"myLearningReview": "Easy",
"contentToBeIncluded": "Breastfeeding",
"usefulModules": "COVID-19"
}

Function:

- insert

### GET FEEDBACK

- GET URL: /api/public/feedback

Function:

- list