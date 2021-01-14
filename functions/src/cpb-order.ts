import * as functions from 'firebase-functions';
import axios, { AxiosRequestConfig } from 'axios';


export async function submitOrder(order: any, username: string, password: string): Promise<any> {

  // login
  callCPBApi("http://conprobio.ch/conprobio/login.action", username, password);
  // parsing
  // prepare form values
  // submit del form
}

async function callCPBApi(url: string, username: string, password: string): Promise<any> {

  let response = {};

  const options: AxiosRequestConfig =  
              {
                headers: { 
                  'content-type': 'application/x-www-form-urlencoded' },
              };

  const data = {username, password};
  await axios.post(url, data, options)
      .then((body:any) => response = body.data)
      .catch ((err:any) => { 
        functions.logger.error(err);
        response = { "err": err.toString() }; });
  
  return response;
}