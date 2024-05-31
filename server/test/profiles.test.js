// 'use strict';

// import { test } from 'babel-tap';
// import { updateMergeProfile } from '../api/pub/profile.model'

// const fullJSON = `
// {
//     "salt": "VIY+b722sgC4qbkkxLJMoUqPji2mi1pCQdAzM8hPfOA=",
//     "hash": "5F/gP+V+w8EiJpgfWtxZZtdqUZc7RQpw9Xew64vNyxk=",
//     "profileTimestamp": 1521716916869,
//     "profileName": "Emil Christiansen",
//     "profileEmail": "emil@visikon.com ",
//     "profileQuestions": {
//         "upq:question_1": "upq:question_1_answer_1",
//         "upq:question_2": "American Samoa"
//     },
//     "profileModuleScores": {
//         "infection-prevention_1487676001934": 11,
//         "post-abortion-care_1487676484604": 11,
//         "hypertension_1487677992452": 11,
//         "active-management-of-third-stage-labour_1487678773861": 11,
//         "prolonged-labour_1487678855904": 11,
//         "post-partum-hemorrhage_1487678905876": 11,
//         "manual-removal-of-placenta_1487678949720": 11,
//         "maternal-sepsis_1487679043550": 11,
//         "neonatal-resuscitation_1487679104279": 11,
//         "newborn-management_1487679126990": 11
//     },
//     "profileCertificate": {
//         "unlockTimestamp": 1507192012737,
//         "score": 100,
//         "name": "Emil",
//         "passed": true,
//         "claimed": true,
//         "certDate": 1521669350344,
//         "jobTitle": "dev",
//         "workPlace": "Visikon"
//     },
//     "_table": "appusers",
//     "id": "80eaf59d-fa77-72a3-53bb-d9b1f09fde0b"
// }`;

// const halfJSON = `
// {
//     "salt": "VIY+b722sgC4qbkkxLJMoUqPji2mi1pCQdAzM8hPfOA=",
//     "hash": "5F/gP+V+w8EiJpgfWtxZZtdqUZc7RQpw9Xew64vNyxk=",
//     "profileTimestamp": 1521716916869,
//     "profileName": "Emil Christiansen",
//     "profileEmail": "emil@visikon.com ",
//     "profileQuestions": {
//         "upq:question_1": "upq:question_1_answer_1",
//         "upq:question_2": "American Samoa"
//     },
//     "profileModuleScores": {
//         "infection-prevention_1487676001934": 11,
//         "post-abortion-care_1487676484604": 11,
//         "hypertension_1487677992452": 11,
//         "active-management-of-third-stage-labour_1487678773861": 11,
//         "prolonged-labour_1487678855904": 11,
//         "post-partum-hemorrhage_1487678905876": 11,
//         "manual-removal-of-placenta_1487678949720": 11,
//         "maternal-sepsis_1487679043550": 11,
//         "neonatal-resuscitation_1487679104279": 11,
//         "newborn-management_1487679126990": 11
//     },
//     "profileCertificate": {
//         "unlockTimestamp": 1507192012737,
//         "score": 100,
//         "name": "Emil",
//         "passed": true,
//         "claimed": true,
//         "certDate": 1521669350344,
//         "jobTitle": "dev",
//         "workPlace": "Visikon"
//     },
//     "_table": "appusers",
//     "id": "80eaf59d-fa77-72a3-53bb-d9b1f09fde0b"
// }`;

// const emptyJSON = `
// {
//     "salt": "VIY+b722sgC4qbkkxLJMoUqPji2mi1pCQdAzM8hPfOA=",
//     "hash": "5F/gP+V+w8EiJpgfWtxZZtdqUZc7RQpw9Xew64vNyxk=",
//     "profileTimestamp": 1521716916869,
//     "profileName": "Emil Christiansen",
//     "profileEmail": "emil@visikon.com ",
//     "profileQuestions": {},
//     "profileModuleScores": {},
//     "profileCertificate": {},
//     "_table": "appusers",
//     "id": "80eaf59d-fa77-72a3-53bb-d9b1f09fde0b"
// }`;

// test('updateMergeProfile(empty, full) should make empty == full', t => {
//   const emptyProfile = JSON.parse(emptyJSON);
//   const newInfo = JSON.parse(fullJSON);
//   // First they differ
//   t.notSame(emptyProfile, newInfo);
//   // We then update the empty profile with data from newInfo
//   updateMergeProfile(emptyProfile, newInfo);
//   // Afterwards the empty profile is no longer empty - but contains all from newInfo
//   t.same(emptyProfile, JSON.parse(fullJSON));
//   t.end();
// });


// test('updateMergeProfile(full, empty) should make empty == full - reverse of the above', t => {
//     const empty = JSON.parse(emptyJSON);
//     const full = JSON.parse(fullJSON);
//     // First they differ
//     t.notSame(full, empty);
//     updateMergeProfile(full, empty);
//     t.same(full, empty);
//     t.end();
//   });
