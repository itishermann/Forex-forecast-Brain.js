
// Raw = [{"date":"2019.07.12","hour":"08:15","open":10300.3,"high":10300.3,"low":10296.8,"close":10296.8,"tick_volume":162}, ....]
// scale down (value - lowest) / (highest - lowest)
// scale up lowest + (value * (highest - lowest))

const lowest = (arr, key) => {
  let lowest = arr[0][key];
  for (let i = 1; i<arr.length; i++){
    if(arr[i][key]<lowest){
      lowest = arr[i][key];
    }
  }
  return lowest;
}

const highest = (arr, key) => {
  let highest = arr[0][key];
  for (let i = 1; i<arr.length; i++){
    if(arr[i][key]>highest){
      highest = arr[i][key];
    }
  }
  return highest;
}

const down = (candle, lowestPrice, highestPrice) => {
  const {open, close, high, low} = candle;
  return {
    open: (open - lowestPrice) / (highestPrice - lowestPrice),
    high: (high - lowestPrice) / (highestPrice - lowestPrice),
    low: (low - lowestPrice) / (highestPrice - lowestPrice),
    close: (close - lowestPrice) / (highestPrice - lowestPrice),
  }
}

const up = (candle, lowestPrice, highestPrice) => {
  const {open, close, high, low} = candle;
  return {
    open: lowestPrice + (open * (highestPrice - lowestPrice)),
    high: lowestPrice + (high * (highestPrice - lowestPrice)),
    low: lowestPrice + (low * (highestPrice - lowestPrice)),
    close: lowestPrice + (close * (highestPrice - lowestPrice)),
  }
}

module.exports = {up, down, highest, lowest}