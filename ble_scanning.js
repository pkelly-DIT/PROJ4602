var noble = require('noble');
var shell = require ('shelljs');

var buttonStateService;
var buttonStateCharacteristic;
var alexaActive = 0;

noble.on('stateChange', stateChangeEventHandler); 

function stateChangeEventHandler(state) {
  if (state === 'poweredOn') {
    console.log("SUCCESS: Bluetooth scanning started!");  
    noble.startScanning();
  } else {
    console.log("ERROR: Bluetooth scanning failed to start!");  
    noble.stopScanning();
  }
}

noble.on('discover', discoverDeviceEventHandler); 
console.log("-----");

function discoverDeviceEventHandler(peripheral) {
	console.log('Device Name: ' + peripheral.advertisement.localName);
	console.log("| Device UUID: " + peripheral.uuid);

    if (peripheral.uuid == ""){ 
        peripheralGlobal = peripheral;  
		console.log(peripheral.uuid);
		peripheral.connect(connectCallback);
	}; //end if 
}

function connectCallback(error) {
	if (error) {
		console.log("ERROR: Connecting to peripheral failed!");
	} else {		
		console.log('SUCCESS: Connected to peripheral!')
		console.log(peripheralGlobal.advertisement.localName + " | " + peripheralGlobal.uuid);
		peripheralGlobal.discoverServices([], discoverServicesCallback);
	}
}

function discoverServicesCallback(error, services) { 
	if (error) {
		console.log("ERROR: Discovering peripheral's services failed!");
	} else {
		console.log("SUCCESS: Discovered peripheral's services!");
		console.log("Discovered the following services:");			
		for (var i in services) {
			console.log('  ' + i + ' Service UUID: ' + services[i].uuid);
		}
        //pick one service to interrogate
		buttonStateService = services[2];
		buttonStateService.discoverCharacteristics(null, discoverCharsCallback); 
	}
}

function discoverCharsCallback(error, characteristics) { 
	if (error) {
		console.log("ERROR: Discovering service characteristics failed!");
	} else {
		console.log("SUCCESS: Discovered service's characteristics!");
		console.log('Discovered the following characteristics:');
		for (var i in characteristics) {
			console.log('  ' + i + ' Characteristic UUID: ' + characteristics[i].uuid);
        }
		buttonStateCharacteristic = characteristics[0];

		readData();
	}
}

function readData(){
	buttonStateCharacteristic.read(readDataCallback); 
}

function readDataCallback(error, data) { 
	if (error) {
		console.log("ERROR: Reading characteristic's data!");
	} else {	
		console.log("SUCCESS: Read characteristic's data!");
		if (data.toString('hex') == '0100'){
			console.log("Button state active: " + data.toString('hex'));
			alexaActive = 1;
			activateAlexa();
		} else if (data.toString('hex') == '0000'){
			console.log("Waiting for button state change...");
		}
		setTimeout(readData, 5000);
	}
}

function activateAlexa(){
	console.log('***************************');
	console.log('*** ALEXA IS NOW ACTIVE ***');
	console.log('***************************');
	
	shell.exec('./alexa');
	
}

function disconnectCallback(error){ 
	if (error) {
		console.log("ERROR: Disconnecting from device failed!");
	} else {
		console.log("SUCCESS: Disconnected from device!");
	}
}
