const brain = require('brain.js');
const moment = require('moment');
const websocket = require('ws');
const scale = require('./utils/normalize');
const rawData = require('./Datasets/json/Boom 1000 Index_M15.json');
const constants = require('./utils/constants');
const writejson = require('./utils/writejson');

const {apiToken, timeframes, symbols, app_id} = constants;

var ws = new websocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

const lowestPrice = scale.lowest(rawData, 'high');
const highestPrice = scale.highest(rawData, 'high');

const cleanData = rawData.map(item => scale.down(item, lowestPrice, highestPrice));

const numOfCandles = 4; 
const trainingData = [];
for (let i=0; i<cleanData.length; i+=numOfCandles) {
     trainingData.push(cleanData.slice(i, i+numOfCandles));
}


const networkOptions = {
  inputSize: 4,
  hiddenLayers: [8, 8],
  outputSize: 4,
  errorThresh: 0.001,
}

const network = new brain.recurrent.LSTMTimeStep(networkOptions);

const start = moment();
const stats = network.train(trainingData);
const end = moment();

console.log("Training duration =>", end.diff(start, 'minutes'), ' minutes');
console.log('Learning stats => ', stats);

const candles = [];
let candlesLength = 0;
let forecastInput = []; //must be [[],[],[],[]]

ws.onopen = (evt) => {
    ws.send(JSON.stringify({
        "ticks_history": symbols.boom_1000,
        "adjust_start_time": 1,
        "end": "latest",
        "start": 1,
        "style": "candles",
        "granularity": timeframes.M15,
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
       candlesLength = candles.length;
   };

   if(candles.length === candlesLength + 4){
    candlesLength = candles.length;
    let temp = candles.slice(-4).map(item => scale.down(item, lowestPrice, highestPrice));
    const rawForecast = network.forecast([temp], 12);
    const cleanForecast = rawForecast.map(item => scale.up(item, lowestPrice, highestPrice));
    let actualDate = moment().format('DD_MM_YYYY__hh_mm_ss');
    console.log("Boom 1000 Index_M15 Forecast at ",actualDate, " => %o", cleanForecast);
    let toWrite = {
      input: candles.slice(-4),
      output: cleanForecast,
      date: actualDate,
    };
    writejson(toWrite,'logs/'+actualDate+'.json');
   }
};