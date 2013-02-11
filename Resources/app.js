// Example for the Acktie Mobile QR Code reader (for both iOS and Android)

var qrreader = undefined;
var qrCodeWindow = undefined;
var qrCodeView = undefined;

var self = Ti.UI.createWindow({
	backgroundColor : 'white',
	title: "Acktie Mobile QR",
});

// Depending on the platform, load the appropriate qr module
if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
	qrreader = require('com.acktie.mobile.ios.qr');
} else if (Ti.Platform.osname === 'android') {
	qrreader = require('com.acktie.mobile.android.qr');
}

/**
 * Read QR from a Photo Album
 * NOTE: Android does not currently support reading from the Image Gallery
 */
var qrFromAlbumButton = Titanium.UI.createButton({
	title : 'QR Code from Album',
	height : '40dp',
	width : '100%',
	top : '10dp'
});

qrFromAlbumButton.addEventListener('click', function() {
	if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
		qrreader.scanQRFromAlbum({
			view : qrFromAlbumButton, //Only for the iPad
			success : success,
			cancel : cancel,
			error : error,
		});
	} else if (Ti.Platform.osname === 'android') {
		alert("Scanning from Image Gallery is not support on Android");
	}
});

self.add(qrFromAlbumButton);

// Add Scan button from right nav bar on iPad
if (Ti.Platform.osname === 'ipad') {
	var navButton = Titanium.UI.createButton({
		title : 'Scan from Album'
	});
	self.rightNavButton = navButton;

	navButton.addEventListener('click', function() {
		qrreader.scanQRFromAlbum({
			navBarButton : navButton, //Only for the iPad
			success : success,
			cancel : cancel,
			error : error,
		});
	});
}

/**
 * Read QR code from the Camera feed.  Once the QR code is read it will
 * stop scanning.
 */
var qrFromCameraButton = Titanium.UI.createButton({
	title : 'QR Code from Camera (Sampling)',
	height : '40dp',
	width : '100%',
	top : '60dp'
});
qrFromCameraButton.addEventListener('click', function() {
	var options = {
		// ** Android QR Reader properties (ignored by iOS)
		backgroundColor : 'black',
		width : '100%',
		height : '90%',
		top : 0,
		left : 0,
		// **

		// ** Used by both iOS and Android
		useFrontCamera: true,
		overlay : {
			color : "blue",
			layout : "center",
			alpha : .75
		},
		success : success,
		cancel : cancel,
		error : error,
	};

	if (Ti.Platform.name == "android") {
		scanQRFromCamera(options);
	} else {
		qrreader.scanQRFromCamera(options);
	}
});

self.add(qrFromCameraButton);

/**
 * Read QR code from Camera feed continuously until user press the done button.
 */
var qrFromCameraContButton = Titanium.UI.createButton({
	title : 'From Camera (Sampling Continuous)',
	height : '40dp',
	width : '100%',
	top : '110dp'
});
qrFromCameraContButton.addEventListener('click', function() {
	var options = {
		// ** Android QR Reader properties (ignored by iOS)
		backgroundColor : 'black',
		width : '100%',
		height : '90%',
		top : 0,
		left : 0,
		// **

		// ** Used by iOS (allowZoom/userControlLight ignored on Android)
		userControlLight : true,
		allowZoom : false,

		// ** Used by both iOS and Android
		overlay : {
			imageName : 'exampleBranding.png',
		},
		continuous : true,
		success : success,
		cancel : cancel,
		error : error,
	};

	if (Ti.Platform.name == "android") {
		scanQRFromCamera(options);
	} else {
		qrreader.scanQRFromCamera(options);
	}
});

self.add(qrFromCameraContButton);

/**
 * Scan QR code from Camera feed only after user presses Scan button.
 * Once the module successfully detects the QR code the camera will
 * stop.
 */
var qrFromManualCameraButton = Titanium.UI.createButton({
	title : 'QR Code from Camera (Manual Capture)',
	height : '40dp',
	width : '100%',
	top : '160dp'
});
qrFromManualCameraButton.addEventListener('click', function() {
	var options = {
		// ** Android QR Reader properties (ignored by iOS)
		backgroundColor : 'black',
		width : '100%',
		height : '90%',
		top : 0,
		left : 0,
		scanQRFromImageCapture : true,
		overlay : {
			color : "purple",
			layout : "center",
			alpha : .75
		},
		// **

		// ** Used by both iOS and Android
		useFrontCamera: true,
		scanButtonName : 'Scan Code!',
		success : success,
		cancel : cancel,
		error : error,
	};

	if (Ti.Platform.name == "android") {
		scanQRFromImageCapture(options);
	} else {
		qrreader.scanQRFromImageCapture(options);
	}
});

self.add(qrFromManualCameraButton);

/**
 * Scan QR code from Camera feed only after user presses Scan button.
 * With the module in continuous mode the user will need to press Done/Close to
 * exit the QR scanning mode.
 */
var qrFromManualContCameraButton = Titanium.UI.createButton({
	title : 'Camera from Manual Capture (Continuous)',
	height : '40dp',
	width : '100%',
	top : '210dp'
});
qrFromManualContCameraButton.addEventListener('click', function() {
	var options = {
		// ** Android QR Reader properties (ignored by iOS)
		backgroundColor : 'black',
		width : '100%',
		height : '90%',
		top : 0,
		left : 0,
		scanQRFromImageCapture : true,
		overlay : {
			color : "red",
			layout : "center",
		},
		// **

		// ** Used by iOS (allowZoom/userControlLight ignored on Android)
		continuous : true,
		userControlLight : true,
		// **

		// ** Used by both iOS and Android
		scanButtonName : 'Keep Scanning!',
		success : success,
		cancel : cancel,
		error : error,
	};

	if (Ti.Platform.name == "android") {
		scanQRFromImageCapture(options);
	} else {
		qrreader.scanQRFromImageCapture(options);
	}
});

self.add(qrFromManualContCameraButton);

function success(data) {
	if (data != undefined && data.data != undefined) {
		Titanium.Media.vibrate();
		alert('data: ' + data.data);
	}
};

function cancel() {
	alert("Cancelled");
};

function error() {
	alert("error");
};

/*
 * Function that mimics the iPhone QR Code reader behavior in Android Apps
 */
function scanQRFromCamera(options) {
	qrCodeWindow = Titanium.UI.createWindow({
		backgroundColor : 'black',
		width : '100%',
		height : '100%',
	});
	qrCodeView = qrreader.createQRCodeView(options);

	var closeButton = Titanium.UI.createButton({
		title : "close",
		bottom : 0,
		left : 0
	});
	var lightToggle = Ti.UI.createSwitch({
		value : false,
		bottom : 0,
		right : 0
	});

	closeButton.addEventListener('click', function() {
		qrCodeView.stop();
		qrCodeWindow.close();
	});

	lightToggle.addEventListener('change', function() {
		qrCodeView.toggleLight();
	})

	qrCodeWindow.add(qrCodeView);
	qrCodeWindow.add(closeButton);

	if (options.userControlLight != undefined && options.userControlLight) {
		qrCodeWindow.add(lightToggle);
	}

	// NOTE: Do not make the window Modal.  It screws stuff up.  Not sure why
	qrCodeWindow.open();
}

/*
 * Function that mimics the iPhone QR Code reader behavior in Android Apps
 */
function scanQRFromImageCapture(options) {

	qrCodeWindow = Titanium.UI.createWindow({
		backgroundColor : 'black',
		width : '100%',
		height : '100%',
	});
	qrCodeView = qrreader.createQRCodeView(options);

	var closeButton = Titanium.UI.createButton({
		title : "close",
		bottom : 0,
		left : 0
	});

	var scanQRCode = Titanium.UI.createButton({
		title : options.scanButtonName,
		bottom : 0,
		left : '50%'
	});

	var lightToggle = Ti.UI.createSwitch({
		value : false,
		bottom : 0,
		right : 0
	});

	closeButton.addEventListener('click', function() {
		qrCodeView.stop();
		qrCodeWindow.close();
	});

	scanQRCode.addEventListener('click', function() {
		qrCodeView.scanQR();
	});

	lightToggle.addEventListener('change', function() {
		qrCodeView.toggleLight();
	})

	qrCodeWindow.add(qrCodeView);
	qrCodeWindow.add(scanQRCode);
	qrCodeWindow.add(closeButton);

	if (options.userControlLight != undefined && options.userControlLight) {
		qrCodeWindow.add(lightToggle);
	}

	// NOTE: Do not make the window Modal.  It screws stuff up.  Not sure why
	qrCodeWindow.open();
}

if (Ti.Platform.osname === 'android') {
	var activity = Ti.Android.currentActivity;
	activity.addEventListener('pause', function(e) {
		Ti.API.info('Inside pause');
		if (qrCodeView != undefined) {
			qrCodeView.stop();
		}

		if (qrCodeWindow != undefined) {
			qrCodeWindow.close();
		}
	});
}

if(Ti.Platform.osname === 'android')
{
	self.open();
}
else
{
	var navGroup = Ti.UI.iPhone.createNavigationGroup({
		window:self
	});

	var main = Ti.UI.createWindow();
	main.add(navGroup);
	main.open();
}