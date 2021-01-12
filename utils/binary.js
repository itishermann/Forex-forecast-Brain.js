const websocket = require('ws');
const constants = require('./constants');

const {apiToken, timeframes, symbols, app_id} = constants;

var ws = new websocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

const candles = [];

ws.onopen = (evt) => {
    ws.send(JSON.stringify({
        "ticks_history": symbols.boom_1000,
        "adjust_start_time": 1,
        "end": "latest",
        "start": 1,
        "style": "candles",
        "granularity": timeframes.M1,
        "subscribe": 1
      }));
};

ws.onmessage = (msg) => {
   var data = JSON.parse(msg.data);
   if(data.msg_type === "ohlc"){
        const { open, close, high, low, open_time } = data.ohlc;
        if (open_time === candles[candles.length - 1].open_time){
            candles[candles.length - 1] = { open, close, high, low, open_time };
        } else {
            candles.push({ open, close, high, low, open_time });
        }
   };

   if(data.msg_type === "candles"){
        candles.push(...data.candles);
    };

   console.log('Candle size => ', candles.length);
};

