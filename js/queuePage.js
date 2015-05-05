//---------------------------------
// Functions
//---------------------------------

// Load YouTube Frame API & SoundCloud API & Google API & Vimeo API
(function(){ //Closure, to not leak to the scope
    var ytapi = document.createElement("script");
    var scapi = document.createElement("script");
    var ggapi = document.createElement("script");
    var vimeoapi = document.createElement("script");
    ggapi.src = "https://apis.google.com/js/client.js?onload=ginit";    /* Load GG API*/
    ytapi.src = "https://www.youtube.com/player_api";                   /* Load YT API*/
    scapi.src = "https://connect.soundcloud.com/sdk.js";                /* Load SC API*/
    vimeoapi.src = "https://player.vimeo.com/video/VIDEO_ID?api=1"; 
    var before = document.getElementsByTagName("script")[0];
    before.parentNode.insertBefore(ytapi, before);
    before.parentNode.insertBefore(scapi, before);
    before.parentNode.insertBefore(ggapi, before);
    before.parentNode.insertBefore(vimeoapi, before);

})();

//Sets the google API key and loads the youtube data API v3
function ginit() {
    gapi.client.setApiKey("AIzaSyBwtrpyD5Bfxcohb6aDpwfhHK-040pEczc");
    gapi.client.load("youtube", "v3");
    scinit();
}

//Initializes the soundcloud API
function scinit() {
    SC.initialize({client_id: "ec98e7fd2d4b6d79f0c30808836e1b87"});  

}

function vimeoinit(){
    //###################################
    //TODO: Initial setup of Vimeo API
    //##### to allow for dynamic embeds
    //###################################
}

//function to get soundcloud track number
/*function getTrackID(trackUrl)
    $.get('http://api.soundcloud.com/resolve.json?url=' + trackUrl + '&client_id=YOUR_CLIENT_ID', 
        function (result) {
            console.log(result);
            return result;
        }
);*/

//Loads the Youtube player when it's ready
function onYouTubePlayerAPIReady() {
    //makeVideo();
}

//Plays video when the player is loaded, unless the first item is of a different type
function onPlayerReady(event) {
    if(queueObj.queue[queueObj.cur_index].domain === "soundcloud") {
        //handleSoundcloud(queueObj.cur_index);
    }else if(queueObj.queue[queueObj.cur_index].domain === "vimeo") {
        //handleVimeo(queueObj.cur_index);
    }else if(queueObj.queue[queueObj.cur_index].domain === "youtube") {
        event.target.playVideo();
    }
}

//Prints the current queue, for debugging
function printQueue(queue){
    console.log("Printing Queue \n");
    for(var i = 0; i < queue.length; i++){
        console.log(queue[i].url + "\n");
    }
}

//Displays the soundcloud player and plays the song at the indicated index
function handleSoundcloud(){
    hidePlayers();

    console.log(queueObj.queue[queueObj.cur_index].videoID);
    embedSoundcloud(queueObj.queue[queueObj.cur_index].videoID);
    document.getElementById("soundcloudPlayer").style.display = "inline";
}

//Displays the youtube player and plays the video at the indicated index
function handleYoutube(index){
    if(index > 0 && queueObj.queue[index-1].domain !== "youtube"){
        hidePlayers();
        var ytPlayer = document.getElementById("youtubePlayer");
        ytPlayer.style.display = "";
    }
    youtubePlayer.videoId = queueObj.queue[index].videoID;
    youtubePlayer.loadVideoById(youtubePlayer.videoId, 0, "large");
}

//Displays the vimeo player and plays the video at the passed in index
function handleVimeo(index){
    alert("Sorry, we're working on playing Vimeo content!");
    skipTo(index+1);
}

//Skips the queue to the passed in index and handles playing the content
function skipTo(index){
    if(queueObj.queue[index].domain === "youtube"){
        queueObj.write('cur_index', index);
        youtubePlayer.videoId = queueObj.queue[index].videoID;
        youtubePlayer.loadVideoById(youtubePlayer.videoId, 0, "large");
        populateQueue();
    }else if(queueObj.queue[index].domain === "soundcloud"){
        handleSoundcloud(index);
    }else if(queueObj.queue[index].domain === "vimeo"){
        handleVimeo(index);
    }
}

//Remove an item from the queue at the passed in index
//Will skip to the next item if passed in the index of the currently playing item
function remove(index){
    if(index >= queueObj.length){
        console.log("ERR: remove("+index+") - index out of bounds");
        return;
    }
    if(index == queueObj.cur_index){
        skipTo(index+1);
        queueObj.queue.splice(index, 1);
    }else{
        queueObj.queue.splice(index, 1);
        populateQueue();    
    }
}

//Helper function that hides all the content players from view
function hidePlayers(){
    var ytPlayer = document.getElementById("youtubePlayer");
    var scPlayer = document.getElementById("soundcloudPlayer");
    var vmPlayer = document.getElementById("vimeoPlayer");

    ytPlayer.style.display = "None";
    scPlayer.style.display = "None";
    vmPlayer.style.display = "None";
}

//Helper function to make videos. Only runs after it's been called twice
function makeVideo(){
    var ytPlayer = document.getElementById("youtubePlayer");
    ytPlayer.style.display = "";

    populateQueue();
    if(!blank){
        youtubePlayer = new YT.Player('youtubePlayer', {
            videoId: queueObj.queue[queueObj.cur_index].videoID,
            height: '100%',
            width: '100%',
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
                //'onError': genericVideoSkip
            }
        });    
    }
    if(queueObj.queue[queueObj.cur_index].domain == "soundcloud"){
        handleSoundcloud();
    }
}

//Populates the HTML for the queue on the page
function populateQueue(){
    printQueue(queueObj.queue);
    var Document = "";
    for(var x = queueObj.cur_index; x < queueObj.queue.length; x++){
        var queueClass = "thumbnail";
        if(queueObj.queue[x].domain === "youtube"){
            console.log('Adding ' + x);
            Document = Document + 
            "<img id=\"" + x + "\" class=\"" +
            queueClass + "\" ondblclick=\"remove("+x+")\" src=\"https://i.ytimg.com/vi/" + queueObj.queue[x].videoID + "/mqdefault.jpg\" /><br>";
        }else if(queueObj.queue[x].domain === "soundcloud"){
                        Document = Document + 
            "<img id=\"" + x + "\" class=\"" +
            queueClass + "\" ondblclick=\"remove("+x+")\" src=\"https://soundofceres.files.wordpress.com/2014/08/soundcloud-4-512.gif\" \"width=320px\"/><br>";
        }else if(queueObj.queue[x].domain === "vimeo"){
            //TODO: Get thumbnails for vimeo content
        }
    }
    document.getElementById("queue").innerHTML = Document;
}

function embedSoundcloud(track){
    var Document = "";
    Document = Document + "<iframe width=\"100%\" height=\"100%\" scrolling=\"no\" frameborder=\"no\" src=\"https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com"+track+"&amp;auto_play=true&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true\"></iframe>";
    document.getElementById("soundcloudPlayer").innerHTML = Document;
}



function genericVideoSkip(){
    if (queueObj.cur_index+1 == queueObj.queue.length) {
        queueObj.write('cur_index', ++queueObj.cur_index);
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.remove(tab.id);
    });
    } else {
        queueObj.write('cur_index', ++queueObj.cur_index);
        populateQueue();
        if(queueObj.queue[queueObj.cur_index].domain === "soundcloud") {
            handleSoundcloud(queueObj.cur_index);
        }else if(queueObj.queue[queueObj.cur_index].domain === "vimeo") {
            handleVimeo(queueObj.cur_index);
        }else if(queueObj.queue[queueObj.cur_index].domain === "youtube") {
            handleYoutube(queueObj.cur_index);
        }
    }
}

//Handler for state changes in the youtube player
//Will autoplay the next item in the queue if the video has ended
function onPlayerStateChange(event) {  
    console.log("playerStateChange = " + event.data);
    if(event.data === YT.PlayerState.ENDED) { 
        //If last item in the queue, don't do anything
        if(queueObj.cur_index+1 == queueObj.queue.length)
        {
           queueObj.write('cur_index', ++queueObj.cur_index);
           return;
        }

        //Increment cur_index for queue and populate the preview
        queueObj.write('cur_index', ++queueObj.cur_index);     
        populateQueue();

        //Handle playing the next item in the queue
        if(queueObj.queue[queueObj.cur_index].domain === "soundcloud") {
            handleSoundcloud(queueObj.cur_index);
        }else if(queueObj.queue[queueObj.cur_index].domain === "vimeo") {
            handleVimeo(queueObj.cur_index);
        }else if(queueObj.queue[queueObj.cur_index].domain === "youtube"){
            youtubePlayer.videoId = queueObj.queue[queueObj.cur_index].videoID;
            youtubePlayer.loadVideoById(youtubePlayer.videoId, 0, "large");
        }
    }
}

//---------------------------------
// Listeners
//---------------------------------

//Listener for messages sent by the bootstrap script
//Messages will be triggered by a user adding something to the queue
chrome.runtime.onMessage.addListener(
    //Request contains queueContent, newTab flag, addNext flag, and the blank flag
    //This function takes the queueContent and pushes it to the specified spot unless it is blank
    //Also sets up the display on initial page setup
    function(request, sender, sendResponse) {
        if(queueObj.queue === undefined){
            queueObj.write('queue', []);
            queueObj.write('cur_index', 0);
        }else if(request.queueContent === null){
            if(queueObj.queue.length == 0 || queueObj.cur_index == queueObj.queue.length){
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

//Listener for clear button
//Permanently clears all content from the queue
document.getElementById("clear").addEventListener("click", function(){
    if (confirm("Are you sure you want to clear the queue? (This is permanent)")) {
    queueObj.write('queue', []);
    queueObj.write('cur_index', 0);
    chrome.tabs.getCurrent(function(tab){
        chrome.tabs.remove(tab.id);
    });}
});

//Listener for skip button
//Skips the current playing item and plays the next item in the queue
//If the current item is the last item in the queue, this closes the page
document.getElementById("skip").addEventListener("click", function(){
    genericVideoSkip();
});

//---------------------------------
// Main
//---------------------------------

//Declarations for content players
var youtubePlayer;


hidePlayers();
//Declarations of flags
var halt = true;
var blank;

//Fetch queueObj from persistent storage
var queueObj = Rhaboo.persistent('queueObj');
if(queueObj.cur_index === undefined){
    queueObj.write('cur_index', 0);
}