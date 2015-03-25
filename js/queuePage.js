//---------------------------------
// Functions

// Load YouTube Frame API
(function(){ //Closure, to not leak to the scope
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/player_api"; /* Load Player API*/
    var before = document.getElementsByTagName("script")[0];
    before.parentNode.insertBefore(s, before);
})();

//Loads the Youtube player when it's ready
function onYouTubePlayerAPIReady() {
    queueObj.loadQueueValue = loadQueueValue;
    loadWrapper();
    console.log("Youtube API Done!");
    makeVideo();
}

//Plays video when the player is loaded
function onPlayerReady(event) {
    event.target.playVideo();
}

//Prints the current queue, for debugging
function printQueue(queue){
    console.log("Printing Queue \n");
    for(var i = 0; i < queue.length; i++){
        console.log(queue[i].url + "\n");
    }
}

//Helper function to make videos. Only runs after it's been called twice
function makeVideo(){
    if(halt){
      halt = false;
      return;
    }
    player = new YT.Player('player', {
        videoId: queueObj.queue[queueObj.cur_index].videoID,
        height: '100%',
        width: '100%',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }

    });

}

//Populates the html for the Queue on the page
function populateQueue(){
    printQueue(queueObj.queue);
    var Document = "";
    for(var x = queueObj.cur_index; x < queueObj.queue.length; x++){
        var queueClass = "thumbnail";
        console.log('Adding ' + x);
        Document = Document + 
        "<img class=\"" + queueClass +
        "\" src=\"https://img.youtube.com/vi/" + queueObj.queue[x].videoID + "/0.jpg\" /><br>";
    }

    document.getElementById("queue").innerHTML = Document;
}

//---------------------------------
// Function Variables

//Loads queue value
var loadQueueValue = function (callback){
  chrome.storage.sync.get("queueObj", callback);
};

//Syncs updated queue
var setQueueValue = function (obj, callback){
    chrome.storage.sync.set({"queueObj" : obj }, callback);
};

var loadWrapper = function (){
  queueObj.loadQueueValue(function(result){
  if(result["queueObj"] != undefined){
    queueObj = result["queueObj"];
    queueObj.loadQueueValue = loadQueueValue;
    if(TempContentWaiting){
        console.log("Pushing temp content");
        pushQueueContent(TempContent);
    }
    console.log("Queue loaded!");
    if(queueObj.queue == undefined){
      queueObj.queue = [];
      queueObj.cur_index = 0;
      console.log("Empty queue!");
    }
  }
});
}

var pushQueueContent = function(request){
    queueObj.queue.push(request);
    populateQueue();
    makeVideo();
    setQueueValue(queueObj, function(){ console.log("Queue saved.")});

}

//---------------------------------
// Listeners

//Listens for the queue to be sent over
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.newTab){
            //Temporary queue should be here
            //loadWrapper(); //This line needs to run to complete before the next line runs. A Promise should be used
            //pushQueueContent(request.queueContent);
            console.log("New tab message!");
            TempContentWaiting = true;
            TempContent = request.queueContent;
        }else{
            pushQueueContent(request.queueContent);
        }
});

//listener for clear
document.getElementById("clear").addEventListener("click", function(){

    chrome.storage.sync.remove("queueObj");
    queueObj = {queue: [], cur_index: 0};
    setQueueValue(queueObj, function() {console.log("Queue has been cleared.");})
    chrome.tabs.getCurrent(function(tab){
        chrome.tabs.remove(tab.id);
    });

});

//listener for skip
document.getElementById("skip").addEventListener("click", function(){

    //alert("Skip!");
    //load new video ID
    if (queueObj.cur_index+1 == queueObj.queue.length) {
        console.log("Last item in queue");
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.remove(tab.id);
        });
    } else {
        queueObj.cur_index++;
        populateQueue();
        player.videoId = queueObj.queue[queueObj.cur_index].videoID;
        player.loadVideoById(player.videoId, 0, "large");
        setQueueValue(queueObj, function(){ console.log("Queue saved.")});
    }
});

//---------------------------------
// Main
console.log("Temporary content holders being made");
var TempContentWaiting = false;
var TempContent;
console.log("Temporary content holders made");

var player;
var halt = true;
var queueObj = {queue: [], cur_index: 0};
queueObj.loadQueueValue = loadQueueValue;


//Runs when video state changes, handles videos ending
function onPlayerStateChange(event) {  
    console.log("playerStateChange = " + event.data);
    if(event.data === YT.PlayerState.ENDED) { 
        console.log("Video over, new video being loaded");
        //load new video ID
        if(queueObj.cur_index+1 == queueObj.queue.length)
        {
            console.log("Reached end of queue playback");
            queueObj.cur_index++;
            return;
        }
        queueObj.cur_index++;
        populateQueue();
        player.videoId = queueObj.queue[queueObj.cur_index].videoID;
        console.log(player.videoId);
        player.loadVideoById(player.videoId, 0, "large");
        setQueueValue(queueObj, function(){ console.log("Queue synced.")});
    }
}