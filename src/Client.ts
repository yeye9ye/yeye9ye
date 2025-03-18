import { generateClient } from "aws-amplify/api";
import { Schema } from "../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
let client: ReturnType<typeof generateClient<Schema>> | null=null;
export function initClient(){
    if(!client){
        client=generateClient<Schema>();
        console.log("client initialized");
    }
}
export function getClient(){
    if(!client){
        console.log("client is not initialized when try to get it, so init now...");
        Amplify.configure(outputs);
        initClient();
    }
    return client;
}
