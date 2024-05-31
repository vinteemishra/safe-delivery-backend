"use strict";

import { profileDbClient } from '../../lib/profiledb';
import { profileDbIndiaClient } from '../../lib/profiledbIndia';
const SHARE_CERT = "shareCert";

export async function getCertByUniqueId(uniqueId) {
  const global = await profileDbClient.queryDocs(SHARE_CERT, {
    query: "c.uniqueId = @uniqueIdParam",
    parameters: [{ name: "@uniqueIdParam", value: uniqueId }],
  });
  const indian = await profileDbIndiaClient.queryDocs(SHARE_CERT, {
    query: "c.uniqueId = @uniqueIdParam",
    parameters: [{ name: "@uniqueIdParam", value: uniqueId }],
  });

  return [ ...global, ...indian ];
}

// export function getCertByMemberId(memberId) {
//   return profileDbClient.queryDocs(SHARE_CERT, {
//     query: "c.memberId = @memberIdParam",
//     parameters: [{ name: "@memberIdParam", value: memberId }],
//   });
// }

export function upsert(shareInfo) {
  return profileDbClient.upsertDoc(SHARE_CERT, shareInfo);
}
