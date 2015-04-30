//---------------------------------
// Functions
//The function to create the queue tab
function openQueueTab(queueContent, nextFlag){
	chrome.tabs.create({'url': chrome.extension.getURL("Queue.html")}, function(tab) {
  		console.log("attempted opening tab");
  		queueTabId = tab.id;
  		console.log("queueTabId is: " + queueTabId);
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

function parseURL(url) {
	var success = false;
	var media   = {};
	//literal regex magic
	if (url.match('http(s)://(www.)?youtube|youtu\.be')) {
	    if (url.match('embed')) { youtube_id = url.split(/embed\//)[1].split('"')[0]; }
	    else { youtube_id = url.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0]; }
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
	//Let the browser do some parsing
	var parser = parseURL(link);
	console.log("The video domain is: " + parser.type);
 
	if(parser.type === "youtube"){
		return true;
	}
	else if(parser.type === "soundcloud"){
		return true;
	}
	else if(parser.type==="vimeo"){
		alert("We're sorry, we can only handle content from Youtube.com right now. Vimeo support coming soon!");
		return false;
	}
	else{
		alert("Youtube is currently the only supported content domain")
		return false;
	}
}

//---------------------------------
// Listeners

//Listens for if queue tab is closed to reset queueTabOpen and queueTabId
chrome.tabs.onRemoved.addListener(function(tabId){
	console.log("tab closed with id: " + tabId)
	if (tabId==queueTabId) {
		queueTabId = null;
		console.log("Queue tab has been removed.")
	}
});

//Listens for contextMenu button clicks
chrome.contextMenus.onClicked.addListener(function(info){

	//Makes queueContent object with the clicked URL, the time it was added, and an id
	var d = new Date();
	var id = parseURL(info.linkUrl).id;
	var queueContent = { url: info.linkUrl, timeAdded: d.getTime(), videoID: id };

	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);
	console.log("Video ID for URL object is: " + queueContent.videoID);

	//Check if the link that was clicked on is supported by QRL currently. If so, it adds it to the queue and then syncs it to the browser.
	var result = checkDomainSupport(queueContent.url);
	if(result){
		if(info.menuItemId == "last"){
			console.log("Object supported, adding to back of queue");
			if(queueTabId == null){
				openQueueTab(queueContent, false);
			}else{
				chrome.tabs.sendMessage(queueTabId, { queueContent: queueContent, newTab: false, addNext: false });
			}
		}else if(info.menuItemId == "next"){
			console.log("Object supported, inserting to front of queue");
			if(queueTabId == null){
				openQueueTab(queueContent, true);
			}else{
				chrome.tabs.sendMessage(queueTabId, { queueContent: queueContent, newTab: false, addNext: true });
			}
		}
	}
	

});


chrome.browserAction.onClicked.addListener(function(){
	if (queueTabId==null)
		openQueueTab(null);
});

//---------------------------------
// Main

//Adds context items
var contexts = ["selection", "link", "video"];
var acceptedURLs = ["*://*.youtube.com/*",
					"*://youtube.com/*",
					"*://*.soundcloud.com/*",
					"*://soundcloud.com/*",
					"*://*.vimeo.com/*",
					"*://vimeo.com/*"];
var validContext = "Add to queue";

chrome.contextMenus.create({	"title": validContext, 
								"id": "last",
								"contexts": contexts,
								"documentUrlPatterns": acceptedURLs});
chrome.contextMenus.create({	"title": "Play Next", 
								"id": "next",
								"contexts": contexts,
								"documentUrlPatterns": acceptedURLs});

var queueTabId = null; //Keeps track of if the queue tab is open in chrome
