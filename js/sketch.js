let player1Time = 600; // Player 1's starting time in seconds (5 minutes)
let player2Time = 600; // Player 2's starting time in seconds (5 minutes)
let activePlayer = 1; // Player 1 starts first
let isRunning = false; // Clock is initially stopped
let intervalId; // ID of the setInterval() function
// Declare a "SerialPort" object
let serial;
let latestData = "waiting for data";  // you'll use this to write incoming data to the canvas

function setup() {
createCanvas(windowWidth, windowHeight-10);
  textAlign(CENTER, CENTER);
  textSize(32);
  
  // Create start button
  // Create start button
startButton = createButton('Start');
startButton.position(windowWidth/3.5, height - 100);
startButton.mousePressed(startClock);
startButton.style('background-color', '#4CAF50'); // set background color
startButton.style('border', 'none'); // remove border
startButton.style('color', 'white'); // set text color
startButton.style('padding', '15px 32px'); // set padding
startButton.style('text-align', 'center'); // center text
startButton.style('text-decoration', 'none'); // remove underline
startButton.style('display', 'inline-block'); // make button inline

// Create stop button
stopButton = createButton('Stop');
stopButton.position(windowWidth/2.2, height - 100);
stopButton.mousePressed(isRunning = false);
stopButton.style('background-color', '#f44336');
stopButton.style('border', 'none');
stopButton.style('color', 'white');
stopButton.style('padding', '15px 32px');
stopButton.style('text-align', 'center');
stopButton.style('text-decoration', 'none');
stopButton.style('display', 'inline-block');

// Create reset button
resetButton = createButton('Reset');
resetButton.position(windowWidth/1.59, height - 100);
resetButton.mousePressed(resetClock);
resetButton.style('background-color', '#008CBA');
resetButton.style('border', 'none');
resetButton.style('color', 'white');
resetButton.style('padding', '15px 32px');
resetButton.style('text-align', 'center');
resetButton.style('text-decoration', 'none');
resetButton.style('display', 'inline-block');

  
  
  //// the data part form arduino
  
  // Instantiate our SerialPort object
  serial = new p5.SerialPort();

  // Get a list the ports available
  // You should have a callback defined to see the results
  serial.list();

  // Assuming our Arduino is connected, let's open the connection to it
  // Change this to the name of your arduino's serial port
  serial.open("COM11");

  // Here are the callbacks that you can register
  // When we connect to the underlying server
  serial.on('connected', serverConnected);

  // When we get a list of serial ports that are available
  serial.on('list', gotList);
  // OR
  //serial.onList(gotList);

  // When we some data from the serial port
  serial.on('data', gotData);
  // OR
  //serial.onData(gotData);

  // When or if we get an error
  serial.on('error', gotError);
  // OR
  //serial.onError(gotError);

  // When our serial port is opened and ready for read/write
  serial.on('open', gotOpen);
  // OR
  //serial.onOpen(gotOpen);

  serial.on('close', gotClose);

  // Callback to get the raw data, as it comes in for handling yourself
  //serial.on('rawdata', gotRawData);
  // OR
  //serial.onRawData(gotRawData);
}

function draw() {
  background(255, 255, 255);
  fill(0);
  
  textSize(12);
  text("Sensor Data: " + latestData, windowWidth/2, windowHeight-600);
  
  let rect1x = windowWidth/3.5;
  let rect2x = windowWidth/2;
  let recty = height/2.5;
  let rectwidth = 300;
  let rectheight = 180;
  
  fill(255,255,255,191);
  rect(rect1x, recty,rectwidth,rectheight);
  fill(0);
  textSize(40);
  // Draw player 1's time
  text(formatTime(player1Time), rect1x + rectwidth / 2, recty + rectheight / 2);
  
  
  fill(0,0,0,191);
  rect(rect2x,recty,rectwidth,rectheight);
  fill(255);
  textSize(40);
  // Draw player 2's time
  text(formatTime(player2Time), rect2x + rectwidth / 2, recty + rectheight / 2);
  
  // Switch active player if time is up
  if (activePlayer == 1 && player1Time <= 0) {
    activePlayer = 2;
  } else if (activePlayer == 2 && player2Time <= 0) {
    activePlayer = 1;
  }
  
  // Decrement active player's time if clock is running
  if (isRunning) {
    clearInterval(intervalId);
    intervalId = setInterval(decrementTime, 1000 + millis() % 1000);
  }
}

function formatTime(time) {
  // Format time in seconds as mm:ss
  let minutes = floor(time / 60);
  let seconds = time % 60;
  return nf(minutes, 2) + ':' + nf(seconds, 2);
}

function startClock() {
  isRunning = true;
  intervalId = setInterval(decrementTime, 1000 + millis() % 1000);
}

function stopClock() {
  isRunning = false;
  clearInterval(intervalId);
}

function resetClock() {
  player1Time = 600;
  player2Time = 600;
  activePlayer = 1;
  isRunning = false;
  clearInterval(intervalId);
}

function decrementTime() {
  if (activePlayer == 1) {
    player1Time--;
  } else if (activePlayer == 2) {
    player2Time--;
  }
}

function keyPressed() {
  // Switch active player on space bar press
  if (key === ' ') {
    activePlayer = activePlayer == 1 ? 2 : 1;
  }
}


// We are connected and ready to go
function serverConnected() {
  print("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
  print("List of Serial Ports:");
  // theList is an array of their names
  for (let i = 0; i < thelist.length; i++) {
    // Display in the console
    print(i + " " + thelist[i]);
  }
}

// Connected to our serial device
function gotOpen() {
  print("Serial Port is Open");
}

function gotClose(){
    print("Serial Port is Closed");
    latestData = "Serial Port is Closed";
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
  print(theerror);
}

// There is data available to work with from the serial port
function gotData() {
  let currentString = serial.readLine();  // read the incoming string
  trim(currentString);                    // remove any trailing whitespace
  if (!currentString) return;             // if the string is empty, do no more
  console.log(currentString);             // print the string
  latestData = currentString;            // save it for the draw method
}

// We got raw from the serial port
function gotRawData(thedata) {
  print("gotRawData" + thedata);
}

// Methods available
// serial.read() returns a single byte of data (first in the buffer)
// serial.readChar() returns a single char 'A', 'a'
// serial.readBytes() returns all of the data available as an array of bytes
// serial.readBytesUntil('\n') returns all of the data available until a '\n' (line break) is encountered
// serial.readString() retunrs all of the data available as a string
// serial.readStringUntil('\n') returns all of the data available as a string until a specific string is encountered
// serial.readLine() calls readStringUntil with "\r\n" typical linebreak carriage return combination
// serial.last() returns the last byte of data from the buffer
// serial.lastChar() returns the last byte of data from the buffer as a char
// serial.clear() clears the underlying serial buffer
// serial.available() returns the number of bytes available in the buffer
// serial.write(somevar) writes out the value of somevar to the serial device

// function draw() {
//   background(255,255,255);
//   fill(0,0,0);
//   text(latestData, 10, 10);
//   // Polling method
//   /*
//   if (serial.available() > 0) {
//   let data = serial.read();
//   ellipse(50,50,data,data);
// }
// */
// }
