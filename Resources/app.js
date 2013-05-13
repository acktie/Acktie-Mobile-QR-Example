// Example for the Acktie Mobile QR Code reader (for both iOS and Android)

var qrreader = undefined;
var qrCodeWindow = undefined;
var qrCodeView = undefined;

var self = Ti.UI.createWindow({
	orientationModes : [Ti.UI.PORTRAIT],
	backgroundColor : 'white',
	title : "Acktie Mobile QR",
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

var qrFromCameraButton = Titanium.UI.createButton({
	title : 'Scan QR with front camera',
	height : '40dp',
	width : '100%',
	top : '60dp'
});

qrFromCameraButton.addEventListener('click', function() {
	var options = {
		backgroundColor : 'black',
		width : '100%',
		height : '90%',
		top : 0,
		left : 0,
		useFrontCamera : true,
		success : success,
		cancel : cancel
	};

	scanQRFromCamera(options);
});

self.add(qrFromCameraButton);

/**
 * Read QR code from Camera feed continuously until user press the done button.
 */
var qrFromCameraContButton = Titanium.UI.createButton({
	title : 'Scan QR with back camera',
	height : '40dp',
	width : '100%',
	top : '110dp'
});

qrFromCameraContButton.addEventListener('click', function() {
	var options = {
		backgroundColor : 'black',
		width : '100%',
		height : '90%',
		top : 0,
		left : 0,
		success : success,
		cancel : cancel,
	};

	scanQRFromCamera(options);
});

self.add(qrFromCameraContButton);

function success(data) {
	if (data != undefined && data.data != undefined) {
		Titanium.Media.vibrate();
		alert('data: ' + data.data);
	}
};

function cancel() {
	alert("Cancelled");
};

// Only used with scanning from photo gallery
function error() {
	alert("error");
};

function scanQRFromCamera(options) {
	qrCodeWindow = Titanium.UI.createWindow({
		navBarHidden: true,
		exitOnClose : false,
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

	lightToggle.addEventListener('change', function(event) {
		if (event.value) {
			qrCodeView.turnLightOn();
		} else {
			qrCodeView.turnLightOff();
		}
	})

	qrCodeWindow.add(qrCodeView);
	qrCodeWindow.add(closeButton);

	if (Ti.Platform.osname !== 'ipad' && (options.useFrontCamera === undefined || (options.useFrontCamera != undefined && !options.useFrontCamera))) {
		qrCodeWindow.add(lightToggle);
	}

	// NOTE: Do not make the window Modal for android.  It screws stuff up.  Not sure why
	if (Ti.Platform.osname !== 'android') {
		qrCodeWindow.open({modal:true});
	}
	else
	{
		qrCodeWindow.open();
	}
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

if (Ti.Platform.osname === 'android') {
	self.open();
} else {
	var navGroup = Ti.UI.iPhone.createNavigationGroup({
		window : self
	});

	var main = Ti.UI.createWindow();
	main.add(navGroup);
	main.open();
}