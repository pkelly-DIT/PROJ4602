var noble = require('noble');

noble.on('stateChange', stateChangeEventHandler); //when a stateChange event occurs call the event handler callback function, discoverDeviceEventHandler

/**
 * State change event handler callback function.
 * @param {*} state State object.
 */
function stateChangeEventHandler(state) {
    // If is 'poweredOn'
    if (state === 'poweredOn') {
        console.log("Bluetooth scanning started..."); 
        noble.startScanning();   // Start Bluetooth scanning 
    } else {
        console.log("Bluetooth scanning stopped...");  
        noble.stopScanning();	// Stop Bluetooth scanning
    }
}

//	Discover event occurs
//	Callback function:	discoverDeviceEventHandler
noble.on('discover', discoverDeviceEventHandler);
console.log("Discovering devices...");

/**
 * Discovers nearby Bluetooth devices.
 * @param {*} peripheral Bluetooth peripheral object.
 */
function discoverDeviceEventHandler(peripheral) {
	console.log('Device: ' + peripheral.advertisement.localName);
	
	console.log(" | UUID: " + peripheral.uuid);
	
	// If discovered device uuid matches Eve
	// cfe20a1e1a2a == EUFY BLE scales
    if (peripheral.uuid == "cfe20a1e1a2a"){
        peripheralGlobal = peripheral; 
		console.log('Connecting to ' + peripheral.uuid);
		peripheral.connect(connectCallback);
	};
}

/**
 * Connect callback function.
 * @param {*} error Error object.
 */
function connectCallback(error) {
	if (error) {
		console.log("ERROR: Cannot connect to device.");
	} else {		
		console.log('SUCCESS: Connected to peripheral: ' + peripheralGlobal.uuid  + "   " + peripheralGlobal.advertisement.localName);
		peripheralGlobal.discoverServices([], discoverServicesCallback);
	}
}


/**
 * Discover services callback function.
 * @param {*} error Error object.
 * @param {*} services Bluetooth services object.
 */
function discoverServicesCallback(error, services) {
	if (error) {
		console.log("ERROR: Cannot discover services.");
	} else {
		console.log("SUCCESS: Services discovered.");			
		for (var i in services) {
			console.log('  ' + i + ' uuid: ' + services[i].uuid);
		}
        //pick one service to interrogate
        // EUFY 4 = battery level
		var deviceInformationService = services[4];
		deviceInformationService.discoverCharacteristics(null, discoverCharsCallback); //call the discoverCharacteristics function and when it returns the callback function discoverCharsCallback will be executed
	}
}

/**
 * Discover characteristics callback function.
 * @param {*} error Error object.
 * @param {*} characteristics Bluetooth service characteristics object.
 */
function discoverCharsCallback(error, characteristics) { //this will be executed when the discoverCharacteristics request returns
	if (error) {
		console.log("ERROR: Cannot discover characteristics.");
	} else {
		console.log('SUCCESS: Discovered the following characteristics.');
		for (var i in characteristics) {
			console.log('  ' + i + ' UUID: ' + characteristics[i].uuid);
        }
        // Pick one characteristic to read the value of 
        var sensorLevelData = characteristics[0];
        sensorLevelData.read(readDataCallback); //call the read function and when it returns the callback function readDataCallback will be executedcallback function writeDataCallback will be executed
		} //end for loop
}

/**
 * Read characteristic data callback function.
 * @param {*} error Error object.
 * @param {*} data Characteristic data value.
 */
function readDataCallback(error, data) { //this will be executed when the read request returns
	if (error) {
		console.log("ERROR: Cannot read data.");
	} else {	
		console.log("Sensor reading is : " + data.toString('hex'));
		peripheralGlobal.disconnect(disconnectCallback);
	}
}

/**
 * Disconnect callback function.
 * @param {*} error Error object.
 */
function disconnectCallback(error){
	if (error) {
		console.log("ERROR: Cannot disconnect from device.");
	} else {
		console.log("Disconnecting and stopping scanning");
	}
}
