// @description Easier way to implement the YouTube JavaScript API
// @author      Rob W
// @global      getFrameID(id) Quick way to find the iframe object which corresponds to the given ID.
// @global      YT_ready(Function:function [, Boolean:qeue_at_start])
// @global      onYouTubePlayerAPIReady()  - Used to trigger the qeued functions
// @website     http://stackoverflow.com/a/7988536/938089?listening-for-youtube-event-in-javascript-or-jquery

function getFrameID(id){
    var elem = document.getElementById(id);
    if (elem) {
        if(/^iframe$/i.test(elem.tagName)) return id; //Frame, OK
        // else: Look for frame
        var elems = elem.getElementsByTagName("iframe");
        if (!elems.length) return null; //No iframe found, FAILURE
        for (var i=0; i<elems.length; i++) {
           if (/^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com(\/|$)/i.test(elems[i].src)) break;
        }
        elem = elems[i]; //The only, or the best iFrame
        if (elem.id) return elem.id; //Existing ID, return it
        // else: Create a new ID
        do { //Keep postfixing `-frame` until the ID is unique
            id += "-frame";
        } while (document.getElementById(id));
        elem.id = id;
        return id;
    }
    // If no element, return null.
    return null;
}

// Define YT_ready function.
var YT_ready = (function(){
    var onReady_funcs = [], api_isReady = false;
    /* @param func function     Function to execute on ready
     * @param func Boolean      If true, all qeued functions are executed
     * @param b_before Boolean  If true, the func will added to the first
                                 position in the queue*/
    return function(func, b_before){
        if (func === true) {
            api_isReady = true;
            for (var i=0; i<onReady_funcs.length; i++){
                // Removes the first func from the array, and execute func
                onReady_funcs.shift()();
            }
        }
        else if(typeof func == "function") {
            if (api_isReady) func();
            else onReady_funcs[b_before?"unshift":"push"](func); 
        }
    }
})();
// This function will be called when the API is fully loaded
//function onYouTubePlayerAPIReady() {YT_ready(true);}

// Load YouTube Frame API
(function(){ //Closure, to not leak to the scope
  var s = document.createElement("script");
  s.src = "https://www.youtube.com/player_api"; /* Load Player API*/
  var before = document.getElementsByTagName("script")[0];
  before.parentNode.insertBefore(s, before);
})();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    queueObj = request;
    console.log("Queue sync'd");
  });


var player;

var queueObj;

var setQueueValue = function (obj, callback){
  chrome.storage.sync.set({"queueObj" : obj }, callback);
};

function onYouTubePlayerAPIReady() {
  player = new YT.Player('player', {
    videoId: queueObj.queue[queueObj.cur_index].videoID,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}
//Plays video automatically
function onPlayerReady(event) {
    event.target.playVideo();
}
//Runs when video is over
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