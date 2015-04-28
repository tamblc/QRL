//---------------------------------
// Functions
function ginit() {
    gapi.client.setApiKey("AIzaSyBwtrpyD5Bfxcohb6aDpwfhHK-040pEczc");
    gapi.client.load("youtube", "v3")
}
function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://apis.google.com/js/client.js";
  document.body.appendChild(script);
}
// Load YouTube Frame API
(function(){ //Closure, to not leak to the scope
    var s = document.createElement("script");
    s.src = "https://www.youtube.com/player_api"; /* Load Player API*/
    var before = document.getElementsByTagName("script")[0];
    before.parentNode.insertBefore(s, before);
})();

//Loads the Youtube player when it's ready
function onYouTubePlayerAPIReady() {
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
    populateQueue();
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
// Listeners

//Listens for the queue to be sent over
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(queueObj.queue === undefined){
            queueObj.write('queue', []);
            queueObj.write('cur_index', 0);
        }else if(request.queueContent === null){
            console.log("blank queue content");
            console.log(queueObj.queue.length);
            if(queueObj.queue.length == 0 || queueObj.cur_index == queueObj.queue.length){
                console.log("set blank");
                blank = true;
                return;
            }else{
                populateQueue();
                makeVideo();
                return;
            }
        }
        if(request.addNext){
            queueObj.queue.splice(queueObj.cur_index+1, 0, request.queueContent);
        }else{
            queueObj.queue.push(request.queueContent);
        }
        populateQueue();
        if(request.newTab || blank){
            blank = false;
            makeVideo();
        }
});

//listener for clear
document.getElementById("clear").addEventListener("click", function(){

    if (confirm("Are you sure you want to clear the queue? (This is permanent)")) {

    queueObj.write('queue', []);
    queueObj.write('cur_index', 0);
    console.log("Queue has been cleared.");
    chrome.tabs.getCurrent(function(tab){
        chrome.tabs.remove(tab.id);
    });
}

});

//listener for skip
document.getElementById("skip").addEventListener("click", function(){
    //load new video ID
    if (queueObj.cur_index+1 == queueObj.queue.length) {
        queueObj.write('cur_index', ++queueObj.cur_index);
        console.log("Last item in queue");
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.remove(tab.id);
    });
    } else {
        queueObj.write('cur_index', ++queueObj.cur_index);
        populateQueue();
        player.videoId = queueObj.queue[queueObj.cur_index].videoID;
        player.loadVideoById(player.videoId, 0, "large");
    }
});

//---------------------------------
// Main
var player;
var halt = true;
var blank;
var queueObj = Rhaboo.persistent('queueObj');
if(queueObj.cur_index === undefined){
    queueObj.write('cur_index', 0);
}

//loadScript();
//ginit();

//Runs when video state changes, handles videos ending
function onPlayerStateChange(event) {  
    console.log("playerStateChange = " + event.data);
    if(event.data === YT.PlayerState.ENDED) { 
        console.log("Video over, new video being loaded");
        //load new video ID
        if(queueObj.cur_index+1 == queueObj.queue.length)
        {
           console.log("Reached end of queue playback");
           queueObj.write('cur_index', ++queueObj.cur_index);
           return;
        }
        queueObj.write('cur_index', ++queueObj.cur_index);     

        populateQueue();
        console.log("Current videoId is: " + player.videoId + " (if undefined, the player object isn't accessible by onPlayerStateChange)");  
        player.videoId = queueObj.queue[queueObj.cur_index].videoID;
        console.log(player.videoId);
        console.log("Loading video by ID");
        player.loadVideoById(player.videoId, 0, "large");
    }
}