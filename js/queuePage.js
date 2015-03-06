// Load YouTube Frame API
(function(){ //Closure, to not leak to the scope
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/player_api"; /* Load Player API*/
    var before = document.getElementsByTagName("script")[0];
    before.parentNode.insertBefore(s, before);
})();

//Listens for the queue to be sent over
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        queueObj = request;
        populateQueue();
});

//Objects for the queuePage


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
    console.log("Queue loaded!");
    if(queueObj.queue == undefined){
      queueObj.queue = [];
      queueObj.cur_index = 0;
      console.log("Empty queue!");
    }
  }
  populateQueue();
  makeVideo();
});
}

var player;
var halt = true;
var queueObj = {queue: [], cur_index: 0};
queueObj.loadQueueValue = loadQueueValue;

//Loads the Youtube player when it's ready
function onYouTubePlayerAPIReady() {
    queueObj.loadQueueValue = loadQueueValue;
    loadWrapper();
    console.log("Youtube API Done!");
    makeVideo();
}
//Plays video automatically
function onPlayerReady(event) {
    event.target.playVideo();
}

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

function populateQueue(){
    var Document = "";
    for(var x = queueObj.cur_index; x < queueObj.queue.length; x++){
        console.log('Adding ' + x);
        Document = Document + queueObj.queue[x].url + "<br>";
    }

    document.getElementById("queue").innerHTML = Document;
}

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
        player.loadVideoById(player.videoId, 0, "large");
        setQueueValue(queueObj, function(){ console.log("Queue synced.")});
    }
}