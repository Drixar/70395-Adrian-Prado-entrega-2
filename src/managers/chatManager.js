import fs from 'fs';
import { v4 as uuid } from 'uuid';
import __dirname from '../utils.js';

export class ChatManager {
  constructor() {
    this.messages = [];
    this.path = __dirname + '/managers/data/messages.json';
  }

  getMessages() {
    try{
    const file = fs.readFileSync(this.path, 'utf-8')
    const fileParse = JSON.parse(file);
    const messages = fileParse || [];
    return messages;
  }
  catch(err) {
    return [];
  }}

  addMessage(message) {
    const messages = this.getMessages();
    const { user, text, date } = message;
    const newMessage = {
      id: uuid(),
      user,
      text,
      date,
    };
    messages.push(newMessage);

    fs.writeFile(this.path, JSON.stringify(messages), (err) => {
      if (err) console.log(err);
      else {
        console.log("File written successfully\n");
      }});
      return messages;
  }
}
