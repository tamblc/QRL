//---------------------------------
// Functions

//The function to create the queue tab
function openQueueTab(queueContent){
	chrome.tabs.create({'url': chrome.extension.getURL("Queue.html")}, function(tab) {
  		console.log("attempted opening tab");
  		queueTabId = tab.id;
  		console.log("queueTabId is: " + queueTabId);
  		var request = { queueContent: queueContent, newTab: true};
  		chrome.tabs.sendMessage(queueTabId, request);
	});
}

function parseURL(url) {
	var success = false;
	var media   = {};
	if (url.match('http(s)://(www.)?youtube|youtu\.be')) {
	    if (url.match('embed')) { youtube_id = url.split(/embed\//)[1].split('"')[0]; }
	    else { youtube_id = url.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0]; }
	    media.type  = "youtube";
	    media.id    = youtube_id;
	    success = true;
	}
	else if (url.match('http(s)://(player.)?vimeo\.com')) {
	    vimeo_id = url.split(/video\/|http:\/\/vimeo\.com\//)[1].split(/[?&]/)[0];
	    media.type  = "vimeo";
	    media.id    = vimeo_id;
	    success = true;
	}
	else if (url.match('http(s)://player\.soundcloud\.com')) {
	    soundcloud_url = unescape(url.split(/value="/)[1].split(/["]/)[0]);
	    soundcloud_id = soundcloud_url.split(/tracks\//)[1].split(/[&"]/)[0];
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
		alert("We're sorry, we can only handle content from Youtube.com right now. Soundcloud support coming soon!");
		return false;
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
		console.log("Object supported, adding to queue");
		if(queueTabId == null){
			openQueueTab(queueContent);
		}else{
			chrome.tabs.sendMessage(queueTabId, { queueContent: queueContent, newTab: false });
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
								"contexts": contexts,
								"documentUrlPatterns": acceptedURLs});

var queueTabId = null; //Keeps track of if the queue tab is open in chrome
