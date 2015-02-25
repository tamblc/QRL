function printQueue(queue){
	console.log("Printint Queue \n")
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

	//Makes queueContent object with the clicked URL + the time it was added
	var d = new Date();
	var queueContent = { url: info.linkUrl, timeAdded: d.getTime() };

	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);

	//Uncomment to create tab with queue'd URL
	//chrome.tabs.create({ url: queueContent.url, active: false});

	queue.push(queueContent);

	printQueue(queue);
	chrome.storage.sync.set({'queue': queue}, function() { console.log('Queue saved'); });

	//alert("Sorry, we're still working on this feature. We'll fix it soon, we promise!");
});



