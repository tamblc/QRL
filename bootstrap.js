function printQueue(queue){

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

var queue = [];

//Listens for contextMenu button clicks
chrome.contextMenus.onClicked.addListener(function(info, tab){

	//Makes queueContent object with the clicked URL + the time it was added
	var d = new Date();
	var queueContent = { url: info.linkUrl, timeAdded: d.getTime() };

	//Get the link from the queueContent object and pass it into the parseID method.
	//parseID returns the video id in the youtube link and stores it in 'videoID'
	//videoID becomes a property of queueContent underneath queueContent.videoID
	var videoID = parseID(queueContent.url);
	queueContent.videoID = videoID;

	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);
	console.log("Video domain for URL object is: " + queueContent.videoID);

	//Uncomment to create tab with queue'd URL
	//chrome.tabs.create({ url: queueContent.url, active: false});

	queue.push(queueContent);

	console.log("Printint Queue \n")
	printQueue(queue);

	alert("Sorry, we're still working on this feature. We'll fix it soon, we promise!");
});

