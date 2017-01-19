// content script runs on every page...and once again on each embedded iframe...
// we only use it to bootstrap the real player...

var request_host="localhost:3000"; // dev
var editorExtensionId = "ogneemgeahimaaefffhfkeeakkjajenb";

// var request_host="playitmyway.inet2.org"; // prod
// var editorExtensionId = "ionkpaepibbmmhcijkhmamakpeclkdml";

function injectJs(link) {
  var scr = document.createElement('script');
  scr.type = "text/javascript";
  scr.src = link;
  document.getElementsByTagName('head')[0].appendChild(scr)
}

already_loaded = false;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "please_start") {
            var url = currentUrlNotIframe();
            if (url.includes("netflix.com/") || url.includes("hulu.com/")) {
              alert("terms of use on this website disallow us injecting code, please ask on the mailing list for support for watching these edited if it has been created yet");
              return; 
            }
            if (findFirstVideoTagOrNull() != null) {
              console.log('got request to start from popup message...');
              injectEditedPlayerOnce();
            }
            else {
              if (!inIframe()) {
                alert("you requested to start edited playback, but we do not detect a video playing yet, possibly need to hit the play button first, then try again?");
              }
            }
         };
});

function findFirstVideoTagOrNull() {
   var all = document.getElementsByTagName("video");
    // look for first "real" playing vid as it were [byu.tv needs this, it has two, first is an add player, i.e. wrong one]
   for(var i = 0, len = all.length; i < len; i++) {
     if (all[i].currentTime > 0) {
       return all[i];
     } 
   }
   // don't *want* to work with iframes from the plugin side since they'll get their own edited playback copy
   // hopefully this is enough to prevent double loading (once windows.document, one iframe if they happen to be allowed :|
   return null;
}

function onReady(yourMethod) {
     if (document.readyState === 'complete') {
       setTimeout(yourMethod, 1); // schedule to run immediately
     }
     else {
       readyStateCheckInterval = setInterval(function() {
         if (document.readyState === 'complete') {
           clearInterval(readyStateCheckInterval);
           yourMethod();
        }
        }, 10);
     }
}

function injectEditedPlayerOnce() {
    console.log("injecting editor code...");
    chrome.runtime.sendMessage({text: "load", color: "#008000", details: "Trying to load edited playback..."}); // last thing they see for non big 3 :|
    if (already_loaded) {
        alert('edited player already loaded for this page...please use its UI. Try clicking "unedited" or the refresh button on your browser.');
    }
    else {
        already_loaded = true;
        injectJs(chrome.extension.getURL('edited_generic_player.js'));
        // appears background.js is the only thing that can adjust the icon, so could send it a message, but why these days...the script sends it an immediate message either way anyway
   }
}

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function autoStartOnBigThree() {
  var url = currentUrlNotIframe();
  if (url.includes("play.google.com") || url.includes("amazon.com") || url.includes("youtube.com")) {
    if (inIframe()) { 
      // avoid google iframes popup after it says YES and reset it back even though it is playing OK
      console.log("not setting to ... from an iframe");
    }
    else {
      chrome.runtime.sendMessage({text: "...", color: "#808080", details: "edited playback is enabled and waiting for a video to appear present, then will try to see if edits exist for it so can playback edited"}); 
    }
    // iframe wants to load it though, for google play
    console.log("big 3 polling for video tag...");
    var interval = setInterval(function(){
			var video_element = findFirstVideoTagOrNull();
			// check for paused so it doesn't prompt you before you're watching on amazon series, slightly annoying
      if (video_element != null && !video_element.src.endsWith(".mp4") && !video_element.paused) { // amazon.com main page used mp4's, avoid prompt edited :|				
				console.log("big 3 found video...");
        injectEditedPlayerOnce();
        clearInterval(interval);
      }
    }, 50);  // initial delay 50ms but not too bad :)
  }
  else if (url.includes("netflix.com/") || url.includes("hulu.com/")) {
    console.log("doing nothing netflix hulu :|");
    chrome.runtime.sendMessage({text: "dis", color: "#808080", details: "netflix/hulu the edited plugin player is disabled."});
  }
  else {
    // non big 3, just poll, if we find a video *and* filter do something about it...
    if (!inIframe()) {
      chrome.runtime.sendMessage({text: ".", color: "#808080", details: "edited playback does not auto start on this website because it is not google play/amazon, but will auto start if it finds a video for which we have edits"});
    } // don't send for iframes since they might override the "real" iframe as it were, which told it "none"
    var interval = setInterval(function() {
      var local_video_tag;
      if ((local_video_tag = findFirstVideoTagOrNull()) != null) {
        console.log("detected video element on this page, checking if we have edits..." + local_video_tag.src);
        loadIfCurrentHasOne(); 
        clearInterval(interval);
      }
    }, 1000); // hopefully doesn't burden unrelated web pages too much :)
  }
}

function currentUrlNotIframe() {
  return (window.location != window.parent.location) ? document.referrer : document.location.href;
}

function getStandardizedCurrentUrl() {
	// simplified should work here since it auto starts for the other ones that we know how to parse well...
  return currentUrlNotIframe().split('#')[0]; // https://www.youtube.com/watch?v=LXSj1y9kl2Y# -> https://www.youtube.com/watch?v=LXSj1y9kl2Y since we don't do hashes
}

function loadIfCurrentHasOne() {
  var url = currentUrlNotIframe();
  var direct_lookup = 'for_current_just_settings_json?url=' + encodeURIComponent(getStandardizedCurrentUrl()) + '&episode_number=0'; // simplified, no episode yet
  url = '//' + request_host + '/' + direct_lookup;
  getRequest(url, currentHasEdits, currentHasNone);
}

function currentHasEdits() {
  console.log("got extant non big 3 " + currentUrlNotIframe());
  injectEditedPlayerOnce();
}

function currentHasNone(status) {
	if (status == 0) {
    console.log("appears the cleanstream server is currently down, please alert us! Edits unable to load for now..."); // barely scared it could become too annoying :|
	}
	else {
    console.log("unable to find one on server for " + currentUrlNotIframe() + " so not auto loading it, doing nothing " + status);
	}
	// thought it was too invasive to inject the javascript for say facebook :|
  chrome.runtime.sendMessage({text: "none", color: "#808080", details: "We found a video playing, do not have edits for this video in our system yet, please click above to add it!"}); 
}

function getRequest (url, success, error) {  
  console.log("starting attempt download " + url);
  var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"); 
  xhr.open("GET", url); 
  xhr.onreadystatechange = function(){ 
    if ( xhr.readyState == 4 ) { 
      if ( xhr.status == 200 ) { 
        success(xhr.responseText); 
      } else { 
        error && error(xhr.status); 
        error = null;
      } 
    } 
  }; 
  xhr.onerror = function () { 
    error && error(xhr.status); 
    error = null;
  }; 
  xhr.send(); 
}

onReady(autoStartOnBigThree);
