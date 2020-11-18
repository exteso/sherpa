import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
import * as sherpaorder from './sherpa-order'; 
import * as cpborder from './cpb-order';

admin.initializeApp();


export const sendOrderPost = functions.https.onRequest(async (req:any, res:any) => {

  // Check for POST request
  if(req.method !== "POST"){
    const username = req.body.username;
    const password = req.body.password;
    const group = req.body.group;
    const orderWeek = req.body.orderWeek;

    const groupOrder:any = await sherpaorder.extractOrder(group, orderWeek);
    await cpborder.submitOrder(groupOrder, username, password);

    res.json({result: `Order with ID: ${groupOrder.id} submitted.`});
    return;
  }
    
  res.status(400).send('Please send a POST request');
  return; 
    
}); 

export const sendOrder = functions.https.onCall(async (data, context) => {

  // Authentication / user information is automatically added to the request.
  
  if (context.auth) {
    //const uid = context.auth.uid;
    const email = context.auth.token.email || null;

    // Data passed from the client.
    const username = data.username;
    const password = data.password;
    const group = data.group;
    const orderWeek = data.orderWeek;

    functions.logger.info(`User ${email} is sending order`);
  
    const groupOrder:any = await sherpaorder.extractOrder(group, orderWeek);
    await cpborder.submitOrder(groupOrder, username, password);

  } 
  
});


