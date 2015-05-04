//---------------------------------
// Functions
//---------------------------------

//Opens the queue tab and passes it the queueContent and related flags
function openQueueTab(queueContent, nextFlag){
	chrome.tabs.create({'url': chrome.extension.getURL("Queue.html")}, function(tab) {
  		queueTabId = tab.id;
  		var request = { queueContent: queueContent, newTab: true, addNext: nextFlag};

  		// Called when the tab is ready.
	    var onready = function() {
	        onready = function() {}; // Run once.
	        chrome.tabs.onUpdated.removeListener(listener);
	        // Now the tab is ready!
	        chrome.tabs.sendMessage(tab.id, request);
	    };

	    // Detect update
	    chrome.tabs.onUpdated.addListener(listener);

	    // Detect create (until crbug.com/411225 is fixed).
	    chrome.tabs.get(tab.id, function(tab) {
	        if (tab.status === 'complete') {
	            onready();
	        }
	    });

	    function listener(tabId, changeInfo) {
	        if (tabId === tab.id && changeInfo.status == 'complete') {
	            onready();
	        }
	    }
	});
}

//Ancient artifact found frozen in a glacier at the North Pole.
//Rumored to be alien technology. Direct contact with the artifact has caused some researchers to go insane.
//Parses the passed in URL and determines if it is from a supported domain and returns the relevant information
function parseURL(url) {
	var success = false;
	var media   = {};
	//literal regex magic
	if (url.match('http(s)://(www.)?youtube|youtu\.be')) { 
		//seriously i thought i was going to start crying blood
	    youtube_id = url.split(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/)[1];
	    media.type  = "youtube";
	    media.id    = youtube_id;
	    success = true;
	}
	else if (url.match('http(s)://(player.)?vimeo\.com')) {
	    vimeo_id = url.split("/").slice(-1)[0];
	    media.type  = "vimeo";
	    media.id    = vimeo_id;
	    success = true;
	}
	else if (url.match('http(s)://(player.)?soundcloud\.com')) {
	    soundcloud_id = url.split("\.com")[1];
	    media.type  = "soundcloud";
	    media.id    = soundcloud_id;
	    success = true;
	}
	if (success) { return media; }
	else { console.log("No valid media id detected"); }
	return false;
}

//Checks the link to see if it is currently supported by QRL. Returns true if yes and false if no.
function checkDomainSupport(link){
	//Magic parsing function figures it out
	var parser = parseURL(link);
	console.log("The video domain is: " + parser.type);
 
	if(parser.type === "youtube"){
		return true;
	}
	else if(parser.type === "soundcloud"){
		return true;
	}
	else if(parser.type==="vimeo"){
		return true;
	}
	else{
		return false;
	}
}

//---------------------------------
// Listeners
//---------------------------------

//Detects when the queue tab is closed to reset queueTabId
chrome.tabs.onRemoved.addListener(function(tabId){
	if (tabId==queueTabId) {
		queueTabId = null;
	}
});

//Listens for contextMenu button clicks
//Handles creation of new content to be sent to the queue and opening the queue tab if it is closed
chrome.contextMenus.onClicked.addListener(function(info){
	//Makes queueContent object with the clicked URL, the domain, the time it was added, and an id
	var d = new Date();
	var parsedMedia = parseURL(info.linkUrl);
	var queueContent = { domain: parsedMedia.type, url: info.linkUrl, timeAdded: d.getTime(), videoID: parsedMedia.id};

	//Check if the link that was clicked on is supported by QRL currently
	//If so, it wraps up a queueContent object and passes it to the queue tab
	//Will open a queue tab if no queue tab is already open
	var result = checkDomainSupport(queueContent.url);
	if(result){
		if(info.menuItemId == "last"){
			if(queueTabId == null){
				openQueueTab(queueContent, false);
			}else{
				chrome.tabs.sendMessage(queueTabId, { queueContent: queueContent, newTab: false, addNext: false });
			}
		}else if(info.menuItemId == "next"){
			if(queueTabId == null){
				openQueueTab(queueContent, true);
			}else{
				chrome.tabs.sendMessage(queueTabId, { queueContent: queueContent, newTab: false, addNext: true });
			}
		}
	}
});

//Browser action button listener
//Just opens the queue tab if it isn't open
chrome.browserAction.onClicked.addListener(function(){
	if (queueTabId==null)
		openQueueTab(null, false);
});

//---------------------------------
// Main
//---------------------------------

//Adds context items
var contexts = ["selection","link","editable","frame","video"];
var acceptedURLs = ["*://*.youtube.com/*",
					"*://www.youtube.com/*",
					"*://youtube.com/*",
					"*://youtu.be/",
					"*://*.soundcloud.com/*",
					"*://soundcloud.com/*",
					"*://snd.sc/*",
					"*://*.vimeo.com/*",
					"*://vimeo.com/*"];
var validContext = "Add to queue";

chrome.contextMenus.create({	"title": validContext, 
								"id": "last",
								"contexts": contexts});
chrome.contextMenus.create({	"title": "Play Next", 
 								"id": "next",
 								"contexts": contexts});

var queueTabId = null; //Keeps track of if the queue tab is open in chrome