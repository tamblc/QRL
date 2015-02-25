function addToQueue(info, queueContent){
	//To be written
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

//Listens for contextMenu button clicks
chrome.contextMenus.onClicked.addListener(function(info, tab){

	//Makes queueContent object with the clicked URL + the time it was added
	var d = new Date();
	var queueContent = { url: info.linkUrl, timeAdded: d.getTime() };

	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);

	chrome.tabs.create({ url: queueContent.url, active: false});


});