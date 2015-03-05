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
});

//Objects for the queuePage
var player;
var queueObj;

//Syncs updated queue
var setQueueValue = function (obj, callback){
    chrome.storage.sync.set({"queueObj" : obj }, callback);
};

//Loads the Youtube player when it's ready
function onYouTubePlayerAPIReady() {
    setTimeout(function(){
    player = new YT.Player('player', {
        videoId: queueObj.queue[queueObj.cur_index].videoID,
        height: '64%',
        width: '100%',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });}, 500);
}
//Plays video automatically
function onPlayerReady(event) {
    event.target.playVideo();
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
            return;
        }
        queueObj.cur_index++;
        player.videoId = queueObj.queue[queueObj.cur_index].videoID;
        player.loadVideoById(player.videoId, 0, "large");
        setQueueValue(queueObj, function(){ console.log("Queue synced.")});
    }
}