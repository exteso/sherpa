import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Fede!");
});

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
export const addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into Cloud Firestore using the Firebase Admin SDK.
    const writeResult = await admin.firestore().collection('testmessages').add({original: original});
    // Send back a message that we've succesfully written the message

    const messages: any = await admin.firestore().collection('testmessages').get();
    res.json({result: `Message with ID: ${writeResult.id} #${messages.original} added.`});
  });


export const sendOrder = functions.https.onRequest(async (req, res) => {
    const group = req.query.group;
    const orderWeek = req.query.orderWeek;
    const order:any = await extractOrder(group, orderWeek);
    res.json({result: `Order with ID: ${order.id} found.`});
  }); 

const extractOrder = async (groupName: any, orderWeek: any) => {
  functions.logger.info("calling with parameters", {groupName, orderWeek});
  const groupRef = await admin.firestore().collection('/orders/').doc(orderWeek);
  const group: any = await groupRef.get().then((doc) => doc.data());
  if (group.id){
    functions.logger.info("GRUPPO CARICATO", {group, structuredData: true});
  }else{
    functions.logger.info("GRUPPO non trovato", {structuredData: true});
   
  }
  return group;

}


/*
  * Simple callable function that adds two numbers.
  */
 export const simpleCallable = functions.https.onCall((data, ctx) => {
   // This function implements addition (a + b = c)
   const sum = data.a + data.b;
   return {
     c: sum,
   };
 });
 
 /**
  * Firestore-triggered function which uppercases a string field of a document.
  */
 export const firestoreUppercase = functions.firestore
   .document("/testlowercase/{doc}")
   .onCreate(async (doc, ctx) => {
     const docId = doc.id;
 
     const docData = doc.data();
     const lowercase = docData.text;
 
     const firestore = admin.firestore();
     await firestore.collection("uppercase").doc(docId).set({
       text: lowercase.toUpperCase(),
     });
   });