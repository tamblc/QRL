function printQueue(queue){

	for(var i = 0; i < queue.length; i++){
		console.log(queue[i].url + "\n");
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

var queue = [];

//Listens for contextMenu button clicks
chrome.contextMenus.onClicked.addListener(function(info, tab){

	//Makes queueContent object with the clicked URL + the time it was added
	var d = new Date();
	var queueContent = { url: info.linkUrl, timeAdded: d.getTime() };

	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);

	//Uncomment to create tab with queue'd URL
	//chrome.tabs.create({ url: queueContent.url, active: false});

	queue.push(queueContent);

	console.log("Printint Queue \n")
	printQueue(queue);

	alert("Sorry, we're still working on this feature. We'll fix it soon, we promise!");
});

