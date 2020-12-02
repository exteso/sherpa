import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
import * as sherpaorder from './sherpa-order'; 
import * as cpborder from './cpb-order';
import axios from 'axios';
import { JSDOM } from 'jsdom';

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

function encodeForm(obj: any) {
  return Object.keys(obj).reduce((p, c) => p + `&${encodeURIComponent(c)}=${encodeURIComponent(obj[c])}`, '')
}

function extractText(productRow: Element, ord: number) {
  let t = productRow.querySelector('td.col_ord_' + ord);
  return (t ? (t.textContent || "") : "").trim()
}

function extractInfoFromTables(tables: NodeListOf<Element>) {
  let info = [];
  for (let table of tables) {
    const productRows = table.querySelectorAll("tr.odd,tr.even");
    let res = [];
    for (let productRow of productRows) {
      if (productRow != null) {
        res.push({
          category: extractText(productRow, 2),
          provenience: extractText(productRow, 3),
          certification: extractText(productRow, 4),
          unit: extractText(productRow, 5),
          product: extractText(productRow, 7),
          price: extractText(productRow, 8),
          hiddenInputName: (productRow.querySelector('td.col_ord_6 input[type=hidden]') as HTMLInputElement).name,
          hiddenInputValue: (productRow.querySelector('td.col_ord_6 input[type=hidden]') as HTMLInputElement).value,
          inputQuantityName: (productRow.querySelector('td.col_ord_6 input[type=text]') as HTMLInputElement).name
        });
      }
    }
    info.push(res);
  }
  return info;
}

// for testing: http://localhost:5001/sherpa-30d3a/us-central1/prepareOrder?username=USERNAME&password=PASSWORD&orderId=settimana_48_r2

export const prepareOrder = functions.https.onRequest(async (req, res) => {


  /*res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,HEAD,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');*/

  /*if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }*/

  let username = req.query['username'];
  let password = req.query['password'];
  let orderId = req.query['orderId'];


  if (req.method === 'POST') {
    username = req.body.data.username;
    password = req.body.data.password;
    orderId = req.body.data.orderId;
  }

  // first do a get to fetch the jsession
  const loginPage = await axios.get('http://conprobio.ch/conprobio/login.action');
  const setCookieValue = loginPage.headers['set-cookie'][0];
  //extract cookie value
  const jsessionId = setCookieValue.match(/^JSESSIONID=(.*);/)[1]
  //

  // do login
  await axios.post('http://conprobio.ch/conprobio/login.action', 
    encodeForm({'username': username, 'password': password, 'action:login': 'Invia'}),
    { headers: {'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'JSESSIONID='+jsessionId}
  });
  //


  // fetch order page 
  const orderPage = await axios.get('http://conprobio.ch/conprobio/editOrderUser.action?order='+orderId,
    {headers: {'Cookie': 'JSESSIONID='+jsessionId}}
  );
  const parsedPage = new JSDOM(orderPage.data);
  const tables = parsedPage.window.document.querySelectorAll("#editOrderUser table.t_list");
  let info = extractInfoFromTables(tables);
  //

  res.status(200).contentType('application/json').send({data: {info: info, session: jsessionId}});
  return;
});
