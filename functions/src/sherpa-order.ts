import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { HttpsError } from 'firebase-functions/lib/providers/https';

export const extractOrder = async function (groupName: any, orderWeek: any) {
  functions.logger.info("calling with parameters", {groupName, orderWeek});
  const groupRef = await admin.firestore().collection('/orders/').doc(orderWeek);
  const group: any = await groupRef.get().then((doc:any) => doc.data());
  if (group.id){
    functions.logger.info("GRUPPO CARICATO "+ group.id,{ structuredData: true});
  }else{
    functions.logger.info("GRUPPO "+groupName+" non trovato", {structuredData: true});
    throw new HttpsError("not-found", "Group order not found");
  }
  return group;

}
