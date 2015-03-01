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
	//Let the browser do the work
	parser.href = url;
	//Convert query string to object
	queries = parser.search.replace(/^\?/, '').split('&');
	//RegEx magic
	for( i = 0; i < queries.length; i++ ) {
		split = queries[i].split('=');
		searchObject[split[0]] = split[1];
	}
	//Fk goog
	parser.hostname.replace("www.","");
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
		alert("We're sorry, the queue hasn't been implemented yet. This video has been saved to your queue, and you will be able to watch it soon!");
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


//Adds context items
var contexts = ["link"];
for (var i = 0; i < contexts.length; i++){
	var context = contexts[i];
	var title = "Add to queue";
	var id = chrome.contextMenus.create({	"title": title, 
											"contexts":[context]});
	console.log("'" + context + "' item:" + id);
}

var queue;
chrome.storage.sync.get('queue', function (result) {
	if(result.length > 0){
		queue = result;
	}else{
		queue = [];
	}
});

//Listens for contextMenu button clicks
chrome.contextMenus.onClicked.addListener(function(info, tab){

	//Makes queueContent object with the clicked URL, the time it was added, and a videoID
	var d = new Date();
	var videoID = parseID(info.linkUrl);
	var queueContent = { url: info.linkUrl, timeAdded: d.getTime(), videoID: videoID };

	//Get the link from the queueContent object and pass it into the parseID method.

	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);
	console.log("Video ID for URL object is: " + queueContent.videoID);

	//Uncomment to create tab with queue'd URL
	//chrome.tabs.create({ url: queueContent.url, active: false});

	//Check if the link that was clicked on is supported by QRL currently. If so, it adds it to the queue.
	var result = checkDomainSupport(queueContent.url);
	if(result){
		queue.push(queueContent);
		console.log("Object supported, adding to queue");
	}
	

	printQueue(queue);

	chrome.storage.sync.get({'queue': queue}, function(){ console.log("Queue sync'd")});

});

