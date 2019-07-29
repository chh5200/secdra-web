import SockJS from 'sockjs-client';
import Stomp from "stompjs"
import Vue from 'vue';
import Cookies from "js-cookie";

const isServer = Vue.prototype.$isServer;

export default {
  socket: null,
  client: null,
  connect() {
    return new Promise((resolve, reject) => {
        if (isServer) {
          reject("service")
        } else {
          //是否初始化了
          if (!this.client) {
            if (this.socket) {
              this.socket.close();
              this.socket = null;
            }
            this.socket = new SockJS(process.env.baseUrl + "/webSocket");
            this.client = Stomp.over(this.socket);
            // this.client.debug = false
          }
          //是否连接中
          if (!this.client.connected) {
            console.log(this.client);
            this.client.connect({token: Cookies.get('token') || ""}, () => {
              window.$client = this.client;
              resolve(this.client)
            },(e)=>{
              console.log(e);
            });
          }
          else {
            resolve(this.client)
          }
        }
      }
    )
  },
  unsubscribeAll() {
    for (let sub in this.client.subscriptions) {
      if (this.client.subscriptions.hasOwnProperty(sub)) {
        this.client.unsubscribe(sub);
      }
    }
  },
  send(eventName, params, header = {}) {
    this.client.send(eventName, header, JSON.stringify(params))
  },
  async disconnect(header = {}) {
    return new Promise((resolve, reject) => {
      this.client.disconnect(function () {
      }, header);
      resolve();
    })
  }
}