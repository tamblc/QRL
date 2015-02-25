function addToQueue(info, queueContent){
	//To be written
}

// function genericOnClick(info){ //This is the on-click code, everything important should be here
// 	//console.log("item " + info.menuItemId + " was clicked");
// 	//console.log("info: " + JSON.stringify(info));
// 	//console.log("tab: " + JSON.stringify(tab));

// 	//Uncomment to have click open new tab
// 	//chrome.tabs.create({ url: info.linkUrl, active: false});
// 	var d = new Date();
// 	var queueContent = { url: info.linkURL, timeAdded: d.getTime() };

// 	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);

// 	chrome.tabs.create({ url: queueContent.url, active: false});


// 	//alert("Sorry, we're still working on this feature. We'll fix it soon, we promise!");

// }


//This is the code that adds the context items
var contexts = ["link"];
for (var i = 0; i < contexts.length; i++){
	var context = contexts[i];
	var title = "Add to queue";
	var id = chrome.contextMenus.create({	"title": title, 
											"contexts":[context]});
	console.log("'" + context + "' item:" + id);
}


chrome.contextMenus.onClicked.addListener(function(info, tab){

	var d = new Date();
	var queueContent = { url: info.linkUrl, timeAdded: d.getTime() };

	console.log("New URL object was created with URL: " + queueContent.url + " at time " + queueContent.timeAdded);

	chrome.tabs.create({ url: queueContent.url, active: false});


});