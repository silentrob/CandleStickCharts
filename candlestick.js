/*
 * CandleStickCharts 0.0.1 - Plugin for Raphaël
 *
 * Copyright (c) 2011 Rob Ellis
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */

/**
 * @width   : width of the svg image in px (no units)
 * @height  : hight og the svg image in px (no units)
 * @valuesy : chart data array of objects with keys [{ open:x, close:x, high:x, low:x },...]
 * @opts    : various options mostly outlined in the top of this method.
 *  
 */

Raphael.fn.candlechart = function (width, height, valuesy, opts) {
  
  var opts = opts || {};
  // Buffer by adding a 1/8th top and bottom of range
  opts.topBuffer =  opts.topBuffer || 8;
  opts.bottomBuffer =  opts.bottomBuffer || 8;
  
  // Bar color
  opts.fillColorNegative = opts.fillColorNegative || "black";
  opts.fillColorPositive = opts.fillColorPositive || "white";
  
  // How often we draw the bars between series.
  opts.vertBarStep = opts.vertBarStep || 5;
  opts.vertBarColor = opts.vertBarColor || "#efefef";  

  // The Space between candle's
  opts.candlePadding = opts.candlePadding || 7;
  
  // How frequeny we write out the price;
  opts.vertTics = opts.vertTics || 2;
  
  // Show Price Axis
  opts.showAmount = (opts.showAmount == undefined) ? true : opts.showAmount;
  
  var paper = this;
  var min, max, series;
  var rightEdge = width;
  
  
  var candle = function(X, candleWidth, open, close, high, low) {
    var topY1 = (open > close) ? close : open;
    var halfWidth = candleWidth / 2;
    var adjustedX = X - halfWidth;
    var wick = paper.set();
    var body = paper.set();    
    wick.push(
      paper.rect(X,high,1,Math.abs(low - high))
    );

    body.push(
      paper.rect(adjustedX, topY1, candleWidth, Math.abs(close - open))
    );
     
    if (open < close) {    
      body.attr({fill: opts.fillColorNegative});   
    } else {
      body.attr({fill: opts.fillColorPositive});   
    }
   
    body.push(wick); 
  }
   
  // Fetch the min / max value from the dataset
  max = valuesy[0].high;
  min = valuesy[0].low;
  
  for(var i = 0; i < valuesy.length;i++) {
    max = (valuesy[i].high > max) ? valuesy[i].high : max;      
    min = (valuesy[i].low < min) ? valuesy[i].low : min;
  }
  
  var dt = max - min;
  max = max + dt/opts.topBuffer;
  min = min - dt/opts.bottomBuffer;
  
  // number of verticle steps
  var steps = Math.floor((max-min)/ opts.vertTics);
  
  // Draw right edge
  if (opts.showAmount) {
    var axis = paper.set();
    rightEdge = width - 40;
    axis.push(paper.path("M"+ rightEdge + " 0 L"+ rightEdge + " " +  height).attr({"stroke":"#efefef"}));    

    // Draw the right edge amounts
    for (var i = 0; i < steps;i++) {
      var vspace = (height / steps); 
      var dt = (max - min) / steps;
      var text = min + (dt * i);
      paper.text(rightEdge + 20, height - (vspace * i), text.toFixed(2));
    }
    // manually draw the top value
    paper.text(rightEdge + 20,  0 , max.toFixed(2));

  }
  
  
  // Figure out the x spacing
  var xSpace = (rightEdge / valuesy.length)
  var initX = 0;
  var xPercent = height / (max - min);
  
  for(var i = 0; i < valuesy.length;i++) {
    var open,close,high,low;
    
    // This is the space between the candles 
    var candleWidth = (xSpace) - opts.candlePadding;
    
    // Draw in verticle lines between each segment, this should problem be one in 5.    
    if (i % opts.vertBarStep == 0) {
      paper.path("M"+ initX + " 0 L"+ initX + " " +  height).attr({"stroke": opts.vertBarColor});
    }
      
    initX += xSpace;

    // This is the mid way between the segment where the candle should be drawn.
    var midX = initX - (xSpace/2);
    
    open  = (height - (valuesy[i].open - min) * xPercent);
    close = (height - (valuesy[i].close - min) * xPercent);
    high  = (height - (valuesy[i].high - min) * xPercent);
    low   = (height - (valuesy[i].low - min) * xPercent);            
    candle(midX, candleWidth, open, close, high, low);
  }
}
