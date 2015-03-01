function printQueue(queue){

	console.log("Printint Queue \n");
	for(var i = 0; i < queue.length; i++){
		console.log(queue[i].url + "\n");
	}
}

//Helper function to parse the video id out of a youtube link
function parseID(link)
{
	//Split the youtube link on the watch text
	var results = link.split("/watch?v=");
	//Grab the video id and store it in 'id'
	var id = results[1];
	//Returns the video id
	return id;
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
	console.log("Video domain for URL object is: " + queueContent.videoID);

	//Uncomment to create tab with queue'd URL
	//chrome.tabs.create({ url: queueContent.url, active: false});

	queue.push(queueContent);

	printQueue(queue);

	chrome.storage.sync.get({'queue': queue}, function(){ console.log("Queue sync'd")});

	alert("Sorry, we're still working on this feature. We'll fix it soon, we promise!");
});

