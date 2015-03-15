//---------------------------------
// Functions


//The function to create the queue tab
function openQueueTab(queueContent){
	chrome.tabs.create({'url': chrome.extension.getURL("Queue.html")}, function(tab) {
  		console.log("attempted opening tab");
  		queueTabId = tab.id;
  		console.log("queueTabId is: " + queueTabId);
  		chrome.tabs.sendMessage(queueTabId, queueContent);
	});
}


//Prints the current queue, for debugging
function printQueue(queue){
	console.log("Printint Queue \n");
	for(var i = 0; i < queue.length; i++){
		console.log(queue[i].url + "\n");
	}
}

//Helper function to parse the video id out of a youtube link
function parseID(link){
	//Split the youtube link on the watch text
	var results = link.split("/watch?v=");
	//Grab the video id and store it in 'id'
	var id = results[1];
	//Returns the video id
	return id;
}

function parseURL(url) {
	//Create new doc element with dummy name 'a'
	var parser = document.createElement('a'), searchObject = {}, queries, split, i;
	//Convert query string to object
	parser.href = url;
	//RegEx magic
	queries = parser.search.replace(/^\?/, '').split('&');
	for( i = 0; i < queries.length; i++ ) {
		split = queries[i].split('=');
		searchObject[split[0]] = split[1];
	}
	//Fk goog
	parser.hostname = parser.hostname.replace("www.","");
	return {
		//Object accessible return values
		"host": parser.host,
		"hostname": parser.hostname,
		"pathname": parser.pathname,
		"search": parser.search,
		"searchObject": searchObject,
	};
}

//Checks the link to see if it is currently supported by QRL. Returns true if yes and false if no.
function checkDomainSupport(link){
	//Let the browser do some parsing
	var parser = parseURL(link);
	console.log("The video domain is: " + parser.hostname);
 
	if(parser.hostname === "youtube.com"){
		return true;
	}
	else if(parser.hostname === "soundcloud.com"){
		alert("We're sorry, we can only handle content from Youtube.com right now. Soundcloud support coming soon!");
		return false;
	}
	else{
		alert("We're sorry, we can only handle content from Youtube.com right now.");
		return false;
	}
}

//---------------------------------
// Listeners

//Listens for if queue tab is closed to reset queueTabOpen and queueTabId
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	console.log("tab closed with id: " + tabId)
	if (tabId==queueTabId) {
		queueTabId = null;
		console.log("Queue tab has been removed.")
	}
});

//Listens for contextMenu button clicks
chrome.contextMenus.onClicked.addListener(function(info, tab){

	//Makes queueContent object with the clicked URL, the time it was added, and a videoID
	var d = new Date();
	var videoID = parseID(info.linkUrl);
	var queueContent = { url: info.linkUrl, ticlearmeAdded: d.getTime(), videoID: videoID };

	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);
	console.log("Video ID for URL object is: " + queueContent.videoID);

	//Check if the link that was clicked on is supported by QRL currently. If so, it adds it to the queue and then syncs it to the browser.
	var result = checkDomainSupport(queueContent.url);
	if(result){
		console.log("Object supported, adding to queue");
		if(queueTabId == null){
			openQueueTab(queueContent);
		}else{
			chrome.tabs.sendMessage(queueTabId, queueContent);
		}
	}

});

//---------------------------------
// Main

//Adds context items
var contexts = ["selection", "link", "video"];
var acceptedURLs = ["*://*.youtube.com/*",
					"*://youtube.com/*",
					"*://*.soundcloud.com/*",
					"*://soundcloud.com/*"];
var title = "Add to queue";
chrome.contextMenus.create({	"title": title, 
								"contexts": contexts,
								"documentUrlPatterns": acceptedURLs});
var queueTabId = null; //Keeps track of if the queue tab is open in chrome
