// (c) 2016 Roger Pack released under LGPL
// for non chrome browser: copy and paste all of this text (including this line) into the "developer tools javascript console" ">" prompt, and hit enter:
// if you have the chrome plugin, it automatically should do all this for you, you should not need to do anything here...just install the plugin.


// var editorExtensionId = "ogneemgeahimaaefffhfkeeakkjajenb";  var request_host="localhost:3000"; // dev
var editorExtensionId = "ionkpaepibbmmhcijkhmamakpeclkdml"; var request_host="playitmyway.inet2.org";  // prod

if (typeof clean_stream_timer !== 'undefined') {
  alert("play it my way: already loaded...not loading it again...please use the on screen links for it"); // hope we never get here :|
  throw "dont know how to load it twice"; // in case they click a plugin button twice, or load it twice (too hard to reload, doesn't work that way anymore)
}

var extra_message = "";
var inMiddleOfTestingEdit = false;
var current_json;
var mouse_move_timer;
var mutes, skips, yes_audio_no_videos, do_nothings;


function addEditUi() {
	
	allEditStuffDiv = document.createElement('div');
	allEditStuffDiv.id = "all_edit_stuff";
	allEditStuffDiv.innerHTML = `
	<style>
	  #all_edit_stuff a:link { color: rgb(255,228,181); text-shadow: 0px 0px 5px black;} 
		#all_edit_stuff a:visited { color: rgb(255,228,181); text-shadow: 0px 0px 5px black;}
	</style>;
	<div id='color_oval_div_id' style='display: none; z-index: 99999999; position: absolute; background: yellow; border-radius: 50% / 50%;'></div> <!-- can't have inline terminate ? -->
	<div id='color_square_div_id' style='display: none; z-index: 99999999; position: absolute; background: black;'></div>
	`;
  allEditStuffDiv.style.color = "white";
  allEditStuffDiv.style.background = '#000000';
  allEditStuffDiv.style.backgroundColor = "rgba(0,0,0,0)"; // still see the video, but also see the text :)
  allEditStuffDiv.style.fontSize = "15px";
  allEditStuffDiv.style.textShadow="2px 1px 1px black";
  document.body.appendChild(allEditStuffDiv);
	
  currentlyEditingDiv = document.createElement('div');
  currentlyEditingDiv.style.position = 'absolute';
  currentlyEditingDiv.style.height = '30px';
  currentlyEditingDiv.style.zIndex = "99999999"; // doesn't inherit? gah
	currentlyEditingDiv.id = "top_left";
  currentlyEditingDiv.innerHTML = 
	` <div id=currently_filtering_id style='display: none;'>
	    Currently Playing it my way: <select id='tag_edit_list_dropdown' onChange='getEditsFromCurrentTagList();'></select>
	  </div>
	  <div id=loading_div_id>Loading...</div>
	  <span id=add_edit_span_id_for_extra_message></span><!-- purposefully left blank, filled in later with 'muted'-->
	  <br/><a href=# onclick="addForNewEditToScreen(); return false;" id="add_edit_or_add_movie_link_id"><!-- will be filled in --></a>`;
  // and stay visible
  allEditStuffDiv.appendChild(currentlyEditingDiv);

  tagLayer = document.createElement('div');
	tagLayer.id = "tagLayer";
  tagLayer.style.position = 'absolute';
  tagLayer.style.width = '600px';
  tagLayer.style.height = '30px';
  tagLayer.style.display = 'none';
  tagLayer.style.zIndex = "99999999";
		
  allEditStuffDiv.appendChild(tagLayer);
  
  tagLayer.innerHTML = `
  <div class="moccasin" id="moccasin_id">
	<div id='tag_layer_top_right'><!-- filled in later mutes=2 skips=... --></div>
	<br/>
	<div id='tag_layer_top_line'>
	  Create a new tag by entering the timestamp, testing it, then saving it: 
		<br/>current time=<span id="top_line_current_time" />
	</div>
	from:<input type="text" name='start' style='width: 150px; height: 20px; font-size: 12pt;' id='start' value='0m 0.00s'/>
  <input id='clickMe' type='button' value='<--set to current time' onclick="document.getElementById('start').value = getCurrentVideoTimestampHuman();" />
  <br/>
  &nbsp;&nbsp;&nbsp;&nbsp;to:<input type='text' name='endy' style='width: 150px; font-size: 12pt; height: 20px;' id='endy' value='0m 0.00s'/>
  <input id='clickMe' type='button' value='<--set to current time' onclick="document.getElementById('endy').value = getCurrentVideoTimestampHuman();" />
  <br/>
  action:
  <select name='default_action' id='new_action'>
    <option value='mute'>mute</option>
    <option value='skip'>skip</option>
    <option value='yes_audio_no_video'>yes_audio_no_video</option>
    <option value='do_nothing'>do_nothing</option>
  </select>
	<br/>
  <input type='submit' value='Test edit once' onclick="testCurrentFromUi();">
  <input type='submit' value='save edit' onclick="saveEditButton(); pauseVideo();">
  <br/>
  <br/>
  <input type='button' onclick="seekToBeforeEdit(-5); return false;" value='-5s'/>
  <input type='button' onclick="seekToTime(video_element.currentTime + 5); return false;" value='+5s'/> <!-- at worst this one seeks forward, so ok -->
  <input type='button' onclick="video_element.playbackRate -= 0.1; return false;" value='&lt;&lt;'/>
  <span id='playback_rate'>1.00x</span>
  <input type='button' onclick="video_element.playbackRate += 0.1; return false;" value='&gt;&gt;'/>
  <input type='button' onclick="stepFrameBack(); return false;" value='frame-'/>
  <input type='button' onclick="stepFrame(); return false;" value='frame+'/>
  <input type='button' onclick="video_element.play(); return false;" value='&#9654;'>
  <input type='button' onclick="pauseVideo(); return false;" value='&#9612;&#9612;'/>
	<br/>
  <input type='button' onclick="closeEditor(); return false;" value='✕ Hide editor'/>
	<br/>
	<br/>
  <a href=% onclick="showMoviePage(); return false;" </a>Movie's page</a>
	<br/>
  <a href=% onclick="getSubtitleLink(); return false;" </a>Get subtitles</a>
	<br/>
  <a href=% onclick="reloadForCurrentUrl(); return false;" </a>Reload tags</a>
  <br/>
  <a href=# onclick="createNewEditList(); return false">Create personalized playback list</a>
  </div>`;
  
  addMouseAnythingListener(mouseJustMoved);
  mouseJustMoved({pageX: 0, pageY: 0}); // start its timer prime it :|
}

function getStandardizedCurrentUrl() { // duplicated with other .js
  var current_url = currentUrlNotIframe();
  if (document.querySelector('link[rel="canonical"]') != null && !isYoutube()) {
		// -> canonical, the crystal code does this for everything so guess we should do here as well...ex youtube it strips off any &t=2 or something...
    current_url = document.querySelector('link[rel="canonical"]').href; // seems to always convert from "/gp/" to "/dp/" and sometimes even change the ID :|
  }
	// attempt to leave the rest in cyrstal
  return current_url;
}

function createNewEditList() {
  window.open("https://" + request_host + "/new_tag_edit_list/" + current_json.url.id);
}

function liveEpisodeName() {
  if (isAmazon() && document.getElementsByClassName("subtitle").length > 0) {
    split = document.getElementsByClassName("subtitle")[0].innerHTML.split(/Ep. \d+/); // like "Season 3, Ep. 3 The Painted Lady"
    if(split.length == 2)
      return split[1].trim();
    else
      return split[0].trim();
  }
  else
    if (isGoogleIframe()) {
      var numberNameDiv = window.parent.document.querySelectorAll('.epname-number')[0]; // apparently I have backward but not forward visibility. phew.
      if (numberNameDiv) {
        var numberName = numberNameDiv.innerHTML; // like " 3. Return to Omashu "
        var numberName = numberName.trim();
        var regex =  /(\d+)\. /; 
        if (regex.test(numberName)) {
          return numberName.split(regex)[2];
        }
        // ??
        return numberName;
     }
    }
    return "";
  end
}

function liveEpisodeNumber() {
  if (isGoogleIframe()) {
    var numberNameDiv = window.parent.document.querySelectorAll('.epname-number')[0]; // apparently I have backward but not forward visibility. phew.
    if (numberNameDiv) {
      var numberName = numberNameDiv.innerHTML; // like " 3. Return to Omashu "
      var numberName = numberName.trim();
      var regex =  /(\d+)\. /;
      if (regex.test(numberName)) {
        return /(\d+)\. /.exec(numberName)[1];
      }
      else {
        return "0";
      }
    }
  }
  if (isAmazon()) {
    var subtitle = document.getElementsByClassName("subtitle")[0];
    if (subtitle && subtitle.innerHTML.match(/Ep. (\d+)/)) {
      var out = /Ep. (\d+)/.exec(subtitle.innerHTML)[1];
			return out;
    }
		else {
			return "0";
		}
  }
  else {
    return "0"; // anything else...
  }
}

function areWeWithin(thisTagArray, cur_time) {
  for (var i = 0; i < thisTagArray.length; i++) {
    var tag = thisTagArray[i];
    var start_time = tag.start;
    var end_time = tag.endy;
    if(cur_time > start_time && cur_time < end_time) {
      return tag;
    }
  }
  return false;
}

var i_muted_it = false; // attempt to let them still control their mute button :|

function checkIfShouldDoActionAndUpdateUI() {
	var cur_time = video_element.currentTime;
	var tag = areWeWithin(mutes, cur_time);
	if (tag) {
	  if (!video_element.muted) {
	    video_element.muted = true;
      i_muted_it = true;
	    timestamp_log("muting", cur_time, tag);
	    extra_message = "muting";
	  }
	}
	else {
	  if (video_element.muted) {
      if (i_muted_it) {
  	    video_element.muted = false;
  	    console.log("unmuted at=" + cur_time);
  	    extra_message = "";
        i_muted_it = false;      
      }
	  }
	}
	
	tag = areWeWithin(skips, cur_time);
	if (tag) {
	  timestamp_log("seeking", cur_time, tag);
	  seekToTime(tag.endy);
	} // no else
	
	tag = areWeWithin(yes_audio_no_videos, cur_time);
	if (tag) {
		// use style.visibility here so it retains the space it would have otherwise used
	  if (video_element.style.visibility != "hidden") {
	    timestamp_log("hiding video leaving audio ", cur_time, tag);
	    extra_message = "doing a no video yes audio";
	    video_element.style.visibility="hidden";
	  }
	}
	else {
	  if (video_element.style.visibility != "") {
	    video_element.style.visibility=""; // non hidden :)
	    console.log("unhiding video with left audio" + cur_time);
	    extra_message = "";
	  }
	}

	document.getElementById('top_line_current_time').innerHTML = timeStampToEuropean(cur_time) + " (" + timeStampToHuman(cur_time) + ")"; // TODO next and previous edit starts as well :|
  var next_tag = getNextTagAfterCurrentPos();
  if (next_tag) {
    document.getElementById('top_line_current_time').innerHTML += " next tag: " + timeStampToHuman(next_tag.start) + " " + next_tag.default_action + " " + timeStampToHuman(next_tag.endy - next_tag.start);
  }
  var message = "";
  if (extra_message != "") {
    message = "play it my way is currently:" + extra_message;
  }
  document.getElementById("add_edit_span_id_for_extra_message").innerHTML = message;
  
	document.getElementById("playback_rate").innerHTML = video_element.playbackRate.toFixed(2) + "x";
}

function move_div_to_position(coords, div_to_adjust) {
	[topy, _, left, _, height, _, width, _, color] = coords.split(/%(,|:|)/);
	topy = parseInt(topy) / 100.0;
	left = parseInt(left) / 100.0;
	height = parseInt(height) / 100.0;
	width = parseInt(width) / 100.0;
	var video_position = getLocationOfElement(video_element);
	div_to_adjust.style.top = video_position.top + (topy * video_position.height);
	div_to_adjust.style.left = video_position.left + (left * video_position.width);
	div_to_adjust.style.height = video_position.height * height; 
	div_to_adjust.style.width = video_position.width * width;
	div_to_adjust.style.backgroundColor = color;
}

function checkStatus() {
	// avoid unmuting videos playing that we don't even control [like youtube main page] with this if...
  if (url_id != 0) {
		if (current_json.url.total_time > 0 && !withinDelta(current_json.url.total_time, video_element.duration, 2)) {
			console.log("watching add?");
			// and do nothing
		}
		else {
      checkIfShouldDoActionAndUpdateUI();
		}
	}
  checkIfEpisodeChanged();
  video_element = findFirstVideoTagOrNull() || video_element; // refresh it in case changed, but don't switch to null :|
	setEditedControlsToTopLeft(); // in case something changed [i.e. amazon moved their video element into "on screen" :| ]
}

function timestamp_log(message, cur_time, tag) {
  local_message = message + " at " + cur_time + " start:" + tag.start + " will_end:" + tag.endy + " in " + (tag.endy - cur_time)+ "s";;
  console.log(local_message);
}


function seekToBeforeEdit(delta) {
  var desired_time = video_element.currentTime + delta;
  var all = mutes.concat(skips);
  all = all.concat(yes_audio_no_videos);
	var tag = areWeWithin(all, desired_time);  
  if (tag) {
    console.log("would have sought to middle of " + JSON.stringify(tag) + " going back further instead");
    seekToBeforeEdit(tag.start - (video_element.currentTime + 1));
  }
  else {
    seekToTime(desired_time);
  }
}

function compareTagStarts(tag1, tag2) {
  if (tag1.start < tag2.start) {
    return -1;
  }
  if (tag1.start > tag2.start) {
    return 1;
  }
  return 0;
}

function getNextTagAfterCurrentPos() {
  var cur_time = video_element.currentTime;
  // or current_json.tags; // sorted :|
  var all = mutes.concat(skips);
  all = all.concat(yes_audio_no_videos);
  // don't include do_nothings [?]
  all.sort(compareTagStarts);
  for (var i = 0; i < all.length; i++) {
    var tag = all[i];
    var start_time = tag.start;
    var end_time = tag.endy;
    if(end_time > cur_time) {
      return tag;
    }
  }
  return null;
}

function addForNewEditToScreen() {
  if (url_id == 0) {
		// case "unedited click to add..."
		if (getStandardizedCurrentUrl().includes("youtube.com/user/")) {
			alert("this is a youtube user page, we don't support those yet, click through to a particular video first");
			// XXXX more generic here somehow possible???
			// TPDP don't even offer to edit it for them on that page [?] and other pages where it's impossible today [facebook]?
		}
		else {
	    window.open("https://" + request_host + "/new_url_from_plugin?url=" + encodeURIComponent(getStandardizedCurrentUrl()) + "&episode_number=" + liveEpisodeNumber() + "&episode_name="  +
			      encodeURIComponent(liveEpisodeName()) + "&title=" + encodeURIComponent(liveTitleNoEpisode()) + "&duration=" + video_element.duration, "_blank");
			setTimeout(loadForNewUrl, 4000); // it should auto save so we should be live within 2s I hope...if not they'll get the same prompt [?] :|					
      // once took longer than 2000 :|
			pauseVideo();
		}
  }
	else {
		// case "Add new content tag" XXX this is screwy but...but...LOL
    document.getElementById("add_edit_or_add_movie_link_id").innerHTML = "";
		displayAddTagStuffIfInAddMode();
	}
}

function inAddMode() {
	return document.getElementById("add_edit_or_add_movie_link_id").innerHTML == "" ;
}

function displayAddTagStuffIfInAddMode() {
  if (inAddMode()){
    displayDiv(tagLayer);
	}
}

function hideAddTagStuff() {
  hideDiv(tagLayer);
}
var addString = "Add a new content tag if we missed something!";
function closeEditor() {
  document.getElementById("add_edit_or_add_movie_link_id").innerHTML = addString;
	hideAddTagStuff();
}

function setEditedControlsToTopLeft() {
  // discover where the "currently viewed" top left actually is (not always 0,0 apparently, it seems)
  var left = getLocationOfElement(video_element).left; 
  var top = getLocationOfElement(video_element).top;
  top += 85; // couldn't see it when at the very top youtube [XXXX why?] but just in case others are the same fix it this way LOL
	if (isAmazon()) {
		top += 35; // allow them to expand x-ray to disable it
	}
  currentlyEditingDiv.style.left = left + "px";
  currentlyEditingDiv.style.top = top + "px";
	top += 55; // put rest below the currentlyEditingDiv line
  tagLayer.style.left = left + "px";
  tagLayer.style.top = top + "px";
}

function currentTestAction() {
  return document.getElementById('new_action').value;
}

function testCurrentFromUi() {
  if (currentTestAction() == 'do_nothing') {
    alert('testing a do nothing is hard, please set it to yes_audio_no_video, test it, then set it back to do_nothing, before hitting save button');
    return; // abort
  }
	if (inMiddleOfTestingEdit) {
		alert('cant test two edits simultaneously, please wait for the first to finish first'); // otherwise I'm not sure what is going to happen to those arrays with their temp add-on at the end 
		return; // abort
	}
	var faux_tag = {
		start: humanToTimeStamp(document.getElementById('start').value),
		endy: humanToTimeStamp(document.getElementById('endy').value)
	}
  if (faux_tag.endy <= faux_tag.start) {
    alert("appears your end is before your start, please fix this, then try again!");
    return; // abort!
  } 
  currentEditArray().push(faux_tag);
  
  inMiddleOfTestingEdit = true;
  var start = faux_tag.start - 2;
  if (start < 0) {
    start = 0; // allow edits to start at or near 0
  }
  seekToTime(start, function() {
	  length = faux_tag.endy - start;
	  if (currentTestAction() == 'skip') {
	    length = 0; // it skips it, so the amount of time before being done is less :)
		}
	  wait_time_millis = (length + 1 + 1) * 1000; 
	  setTimeout(function() {
			console.log("assuming done with edit...");
	    currentEditArray().pop();
	    inMiddleOfTestingEdit = false;
	  }, wait_time_millis);
	});
}

function currentEditArray() {
  switch (currentTestAction()) {
    case 'mute':
      return mutes;
    case 'skip':
      return skips;
    case 'yes_audio_no_video':
      return yes_audio_no_videos;
    case 'do_nothing':
      return do_nothings;
    default:
      alert('internal error 1...'); // hopefully never see this
  }
}

function getCurrentVideoTimestampHuman() {
  return timeStampToHuman(video_element.currentTime);
}

function saveEditButton() {
  var url = "https://" + request_host + "/add_tag_from_plugin/" + url_id + '?start=' + document.getElementById('start').value + 
            "&endy=" + document.getElementById('endy').value + "&default_action=" + currentTestAction();
  window.open(url, '_blank');
	document.getElementById('start').value = '0m 0.00s'; // reset so people don't think they can hit "test edit" again now :|
	// too disconcerting to see it all cleared :| document.getElementById('endy').value = '0m 0.00s';
  setTimeout(reloadForCurrentUrl, 5000); // reload to get it "back" from the server now
  //  setTimeout(reloadForCurrentUrl, 20000); // and get details :) but we don't use them today really :|
}

function showMoviePage() {
  window.open("https://" + request_host + "/view_url/" + current_json.url.id);
}

function getSubtitleLink() {
  if (isYoutube()) {
    window.open("http://www.yousubtitles.com/load/?url=" + currentUrlNotIframe()); // got git 'em
    return;
  }
  if (!isAmazon()) {
    alert("not supported except on amazon/youtube today");
    return;
  }
  var arr = window.performance.getEntriesByType("resource");
  for (var i = arr.length - 1; i >= 0; --i) {
    console.log("name=" + arr[i].name);
    if (arr[i].name.endsWith(".dfxp")) { // ex: https://dmqdd6hw24ucf.cloudfront.net/341f/e367/03b5/4dce-9c0e-511e3b71d331/15e8386e-0cb0-477f-b2e4-b21dfa06f1f7.dfxp apparently
      alert("this appears to be a subtitles file: " + arr[i].name);
      return;
    }
  }
  alert("didn't find a subtitles file, try turning subtitles on, then reload your browser, then try again");
}

function stepFrameBack() {
  seekToTime(video_element.currentTime - 2/30, function () { // go back 2 frames, 1 seems hard...
    video_element.pause();
  });
}

function stepFrame() {
  video_element.play();
  setTimeout(function() {
    video_element.pause(); 
  }, 1/30*1000); // theoretically about an NTSC frame worth :)
}

function lookupUrl() {
  return '//' + request_host + '/for_current_just_settings_json?url=' + encodeURIComponent(getStandardizedCurrentUrl()) + '&episode_number=' + liveEpisodeNumber();
}

function loadForNewUrl() {
  getRequest(lookupUrl(), parseSuccessfulJsonNewUrl, loadFailed);
}

function reloadForCurrentUrl() {
  if (url_id != 0 && !inMiddleOfTestingEdit) {
		console.log("reloading...");
    getRequest(lookupUrl(), parseSuccessfulJsonReload, function() { console.log("huh wuh edits disappeared but used to be there??");  }); 
  }
	else {
		console.log("not reloading...?");
	}
}

function parseSuccessfulJsonReload(json_string) {
  parseSuccessfulJson(json_string);
	getEditsFromCurrentTagList();
}

function parseSuccessfulJsonNewUrl(json_string) {
  parseSuccessfulJson(json_string);
	getEditsFromCurrentTagList(); // used to alert was useful on amazon, but annoying when you create new movie [?]
  startWatcherTimerOnce();
  if (getStandardizedCurrentUrl() != expected_current_url && getStandardizedCurrentUrl() != amazon_second_url) {
     // there can be false alerts like yours has a # or something so don't alert :|
  }
  old_current_url = getStandardizedCurrentUrl();
  if (liveEpisodeNumber() != expected_episode_number) {
    alert("play it my way\ndanger: may have gotten wrong episode expected=" + expected_episode_number + " got=" + liveEpisodeNumber());
  }
  old_episode = liveEpisodeNumber();
	displayDiv(document.getElementById("currently_filtering_id"));
	hideDiv(document.getElementById("loading_div_id"));
  document.getElementById("add_edit_or_add_movie_link_id").innerHTML = addString; // in case it said unedited... before
	sendMessageToPlugin({text: "YES", color: "#008000", details: "Edited playback is enabled and fully operational"}); // green
}

function loadFailed(status) {
  mutes = skips = yes_audio_no_videos = []; // reset so it doesn't re-use last episode's edits for the current episode!
  // plus if they paste it in it gets here, so...basically load the no-op :|
  if (current_json != null) {
    current_json.tags = [];
  }
  name = liveFullNameEpisode();
  episode_name = liveEpisodeString();
  expected_episode_number = liveEpisodeNumber();
  url_id = 0; // reset
	closeEditor();
  document.getElementById("add_edit_or_add_movie_link_id").innerHTML = "<span style='font-size: 18px;'>Unedited...</span>";
	hideDiv(document.getElementById("currently_filtering_id"));
	hideDiv(document.getElementById("loading_div_id"));
	
	removeAllOptions(document.getElementById("tag_edit_list_dropdown"));
  old_current_url = getStandardizedCurrentUrl();
  old_episode = liveEpisodeNumber(); 
  sendMessageToPlugin({color: "#A00000", text: "none", details: "No edited settings found for movie, not playing edited"}); // red
  if (status > 0) {
		// too annoying/frequent :|
		// setTimeout(alertHaveNoneClickOverThereToAddOne, 500); // do later so UI can update and not show behind this prompt as if loaded :|
  }
  else {
    alert("appears the play it my way server is currently down, please alert us! Edits disabled for now..." + request_host);
		document.getElementById("add_edit_or_add_movie_link_id").innerHTML = "Play it my way Server down, try again later...";
  }
  startWatcherTimerOnce(); // so it can check if episode changes to one we like magically LOL [amazon...]
}


function parseSuccessfulJson(json_string) {
  current_json = JSON.parse(json_string);
  var url = current_json.url;
  name = url.name;
  episode_name = url.episode_name;
  expected_current_url = current_json.expected_url_unescaped;
  amazon_second_url = current_json.url;
  expected_episode_number = url.episode_number;
  url_id = url.id;
	
	var dropdown = document.getElementById("tag_edit_list_dropdown");
	removeAllOptions(dropdown); // out with any old...	
  
	for (var i = 0; i < current_json.tag_edit_lists.length; i++) {
		var tag_edit_list_and_tags = current_json.tag_edit_lists[i];
		var option = document.createElement("option");
		option.text = tag_edit_list_and_tags[0].description + "(" + tag_edit_list_and_tags[1].length + ")"; // TODO this is wrong since some of those tags are "do_nothing"
		option.value = tag_edit_list_and_tags[0].id;
		dropdown.add(option, dropdown[0]); // put it at the top XX
	}
	var option = document.createElement("option");
	option.text = "Default (all tags) (" + current_json.tags.length + ")"; // so they can go back to "all" if wanted :|
	option.value = "-1"; // special case :|
  option.setAttribute('selected', true); // default is selected :| XXXX I bet if we add an edit we lose the selected
	dropdown.add(option, dropdown[0]);
  
	console.log("finished parsing response JSON");
}

function setTheseTagsAsTheOnesToUse(tags) {
	mutes = []; // it gets filled in this method :)
	skips = [];
	yes_audio_no_videos = [];
	do_nothings = []; // :|
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i];
		var push_to_array;
		if (tag.default_action == 'mute') {
      push_to_array = mutes;
		} else if (tag.default_action == 'skip') {
      push_to_array = skips;
		} else if (tag.default_action == 'yes_audio_no_video') {
      push_to_array = yes_audio_no_videos;
		} else {
      push_to_array = do_nothings;
		}
		push_to_array.push(tag);
	}
	document.getElementById('tag_layer_top_right').innerHTML = ""; // it was...just...so...ugly... XXX put next/prev here?
}

function getEditsFromCurrentTagList() {
	var dropdown = document.getElementById("tag_edit_list_dropdown");
	var selected_edit_list_id = dropdown.value;
	if (selected_edit_list_id == "-1") {
		setTheseTagsAsTheOnesToUse(current_json.tags);
		return;
	}
	for (var i = 0; i < current_json.tag_edit_lists.length; i++) {
		var tag_edit_list_and_tags = current_json.tag_edit_lists[i];
		if (tag_edit_list_and_tags[0].id == selected_edit_list_id) {
			setTheseTagsAsTheOnesToUse(tag_edit_list_and_tags[1]);
			return;
		}		
	}
	alert("unable to select " + dropdown.value); // shouldn't get here ever LOL.
}

// http://stackoverflow.com/questions/1442425/detect-xhr-error-is-really-due-to-browser-stop-or-click-to-new-page
function getRequest (url, success, error) {  
  console.log("starting attempt GET download " + url);
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

function checkIfEpisodeChanged() {
	var current_episode_number = liveEpisodeNumber();
  if (getStandardizedCurrentUrl() != old_current_url || current_episode_number != old_episode) {
		if (old_episode != "0" && current_episode_number == "0") {
			console.log("got change from an episode " + old_episode + " to non episode? ignoring..."); // amazon when you hit the x
			return;
		}
    console.log("detected move to another video, to\n" + getStandardizedCurrentUrl() + "\nep. " + liveEpisodeNumber() + "\nfrom\n" +
                 old_current_url + "\n ep. " + old_episode + "\nwill try to load its edited settings now for the new movie...");
    old_current_url = getStandardizedCurrentUrl(); // set them now so it doesn't re-get them next loop
    old_episode = liveEpisodeNumber(); 
    setTimeout(loadForNewUrl, 1000); // youtube has the "old name" still for awhile, so for the new prompt wait
  }
}

function alertHaveNoneClickOverThereToAddOne() {
  alert(decodeHTMLEntities("Play it my way:\nWe don't appear to have tags for\n\n" + liveFullNameEpisode() + "\n\n yet, you can add this movie to the system by clicking the 'Unedited, click to enable edited' link to the left"));
}

var clean_stream_timer;

function startWatcherTimerOnce() {
  clean_stream_timer = clean_stream_timer || setInterval(checkStatus, 1000 / 100 ); // 100 fps since that's the granularity of our time entries :|
  // guess we just never turn it off on purpose :)
}

function start() {
  video_element = findFirstVideoTagOrNull();

  if (video_element == null) {
    // this one's pretty serious, just let it die...
    // maybe could get here if they raw load the javascript?
    alert("play it my way:\nfailure: unable to find a video playing, not loading edited playback...possibly need to reload then hit a play button before loading edited playback?");
    return;
  }

  if (isGoogleIframe()) {
    if (!window.parent.location.pathname.startsWith("/store/movies/details") && !window.parent.location.pathname.startsWith("/store/tv/show")) {
      // iframe started from a non "details" page with full url
      alert('play it my way: failure: for google play movies, you need to right click on them and choosen "open link in new tab" for it to work edited in google play...');
      return; // avoid future prompts which don't matter anyway for now :|
    }
  }

  // ready to try and load the editor LOL
	console.log("adding edit UI, looking for URL");
  addEditUi(); // and only do once...
  loadForNewUrl();
}

function coordsWithinElement(cursorX, cursorY, element) {
  var coords = getLocationOfElement(element);
  return (cursorX < coords.left + coords.width && cursorX > coords.left && cursorY < coords.top + coords.height && cursorY > coords.top);
}

function mouseJustMoved(event) {
  var cursorX = event.pageX;
  var cursorY = event.pageY;
  var top_left = document.getElementById("top_left");
  var moccasin = document.getElementById("moccasin_id");
  var mouse_within_video = coordsWithinElement(cursorX, cursorY, video_element);
  var mouse_within_add = coordsWithinElement(cursorX, cursorY, moccasin); // only the "add tag" window FWIW
  var mouse_within_top_left = coordsWithinElement(cursorX, cursorY, top_left);
  if (!mouse_move_timer || (mouse_within_video && document.hasFocus())) {
  	displayDiv(top_left);
  	displayAddTagStuffIfInAddMode();
    clearTimeout(mouse_move_timer); // in case previously set
    if (!mouse_within_add && !mouse_within_top_left) {
      mouse_move_timer = setTimeout(hideAllEditStuff, 1500); // in add mode we ex: use the dropdown and it doesn't trigger this mousemove thing so when it comes off it it disappears and scares you, so 5000 here...
    }
  }
  else if (!mouse_within_video) {
    // mimic youtube :|
    hideAllEditStuff();
    clearTimeout(mouse_move_timer);
  }
}

function hideAllEditStuff() {
  hideDiv(document.getElementById("top_left")); 
  hideAddTagStuff();
}

function addMouseAnythingListener(func) {
  // some "old IE" browser compat stuff :|
  var addListener, removeListener;
  if (document.addEventListener) {
		addListener = function (el, evt, f) { return el.addEventListener(evt, f, false); };
    removeListener = function (el, evt, f) { return el.removeEventListener(evt, f, false); };
  } else {
    addListener = function (el, evt, f) { return el.attachEvent('on' + evt, f); };
    removeListener = function (el, evt, f) { return el.detachEvent('on' + evt, f); };
  }

  addListener(document, 'mousemove', func);
  addListener(document, 'mouseup', func);
  addListener(document, 'mousedown', func);
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


function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function isGoogleIframe() {
  return inIframe() && /google.com/.test(window.location.hostname); 
}

function currentUrlNotIframe() { // hopefully better alternate to window.location.href, though somehow this doesn't always work still [ex: netflix.com iframes?]
  return (window.location != window.parent.location) ? document.referrer : document.location.href;
} 

function isAmazon() {
  return currentUrlNotIframe().includes("amazon.com");
}

function isYoutube() {
  return currentUrlNotIframe().includes("www.youtube.com");  
}

function withinDelta(first, second, delta) {
	var diff = Math.abs(first - second);
	return diff < delta;
}

function findFirstVideoTagOrNull() {
  var all = document.getElementsByTagName("video");
  // search iframes in case people try to load it manually, non plugin, and we happen to have access to iframes, which will be about never
  // it hopefully won't hurt anything tho...since with the plugin way and most pages "can't access child iframes" the content script injected into all iframes will take care of business instead.
  var i, frames;
  frames = document.getElementsByTagName("iframe");
  for (i = 0; i < frames.length; ++i) {
    try { var childDocument = frame.contentDocument } catch (e) { continue }; // skip ones we can't access :|
    all.concat(frames[i].contentDocument.document.getElementsByTagName("video"));
  }
  for(var i = 0, len = all.length; i < len; i++) {
    if (all[i].currentTime > 0) {
      return all[i];
    }
  }
  return null;
}


function seekToTime(ts, callback) {
  if (ts < 0) {
    console.log("not seeking to before 0 " + ts);
    ts = 0;
  }
	callback = callback || function() {}
  // try and avoid pauses after seeking
	console.log("seeking to " + ts);
  video_element.pause();
  video_element.currentTime = ts; // if this is far enough away from current, it also implies a "play" call...oddly. I mean seriously that is bizarre.
	// however if it close enough, then we need to call play
	// some shenanigans to pretend to work around...
	var timer = setInterval(function() {
		if (video_element.paused && video_element.readyState == 4 || !video_element.paused) {
			console.log("appears it sought successfully to " + ts + " " + timeStampToHuman(ts));
			video_element.play();
			clearInterval(timer);
			callback();
		}		
	}, 50);
}

// method to bind easily to resize event
var addEvent = function(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
};

function decodeHTMLEntities(text) {
   	// I guess there's an HTML way to do this, but this way looked funner! :)
    var entities = [
        ['amp', '&'], ['apos', '\''], ['#x27', '\''], ['#x2F', '/'], ['#39', '\''], ['#47', '/'], ['lt', '<'], ['gt', '>'], ['nbsp', ' '], ['quot', '"']
    ];
    for (var i = 0, max = entities.length; i < max; ++i) {
        text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
    }
    return text;
}


function displayDiv(div) {
	div.style.display = "block";
}

function hideDiv(div) {
	div.style.display = "none";
}


function pauseVideo() {
	video_element.pause();
}

function sendMessageToPlugin(message) {
	window.postMessage({ type: "FROM_PAGE_TO_CONTENT_SCRIPT", payload: message }, "*");
  console.log("sent message from page to content script " + JSON.stringify(message));
}


function getLocationOfElement(el) {
  el = el.getBoundingClientRect();
  return {
    left: el.left + window.scrollX,
    top: el.top + window.scrollY,
		width: el.width,
		height: el.height
  }
}


function liveEpisodeString() {
  if (liveEpisodeNumber() != "0")
    return " episode:" + liveEpisodeNumber() + " " + liveEpisodeName();
  else
    return "";
  end
}

function youtubeChannelName() {
    var all = document.getElementsByTagName("img");
    var arrayLength = all.length;
    for (var i = 0; i < arrayLength; i++) {
        if (all[i].alt != "") {
          return all[i].alt + " "; // "Studio C" channel name, but hacky...
        }
    }
    return "";
}

function liveTitleNoEpisode() {
  var title = "unknown title";
  if (document.getElementsByTagName("title")[0]) {
    title = document.getElementsByTagName("title")[0].innerHTML;
  } // some might not have it [iframes?]
  if (isGoogleIframe()) {
    title = window.parent.document.getElementsByTagName("title")[0].innerHTML; // always there :) "Avatar Extras - Movies &amp; TV on Google Play"
    var season_episode = window.parent.document.querySelectorAll('.title-season-episode-num')[0];
    if (season_episode) {
      title += season_episode.innerHTML.split(",")[0]; // like " Season 2, Episode 2 "
    }
    // don't add episode name
  }
  if (isYoutube()) {
    title = youtubeChannelName() + title; 
  }
  return title;
}

function liveFullNameEpisode() {
  return liveTitleNoEpisode() + liveEpisodeString(); 
}

// unused?
function alertEditorWorkingAfterTimeout(message) {
	setTimeout(function() {
    alert("Play it my way:\n" + decodeHTMLEntities("SUCCESS: Editing playback successfully enabled for\n"  + name + " " + episode_name + "\n" + message + 
	      "\n\nskips=" + skips.length + "\nmutes=" + mutes.length +"\nyes_audio_no_videos=" + yes_audio_no_videos.length +
		    "\n" + liveFullNameEpisode()));
			}, 100);
}


function removeAllOptions(selectbox)
{
  for(var i = selectbox.options.length - 1 ; i >= 0 ; i--) {
    selectbox.remove(i);
  }
}

function timeStampToHuman(timestamp) {
  var hours = Math.floor(timestamp / 3600);
  timestamp -= hours * 3600;
  var minutes  = Math.floor(timestamp / 60);
  timestamp -= minutes * 60;
  var seconds = timestamp.toFixed(2); //  -> "12.31" or "2.3"
  // padding is "hard" apparently in javascript LOL
  if (hours > 0)
    return hours + "h " + minutes + "m " + seconds + "s";
  else
    return minutes + "m " + seconds + "s";
}


function timeStampToEuropean(timestamp) { // for the subsyncer :|
  var hours = Math.floor(timestamp / 3600);
  timestamp -= hours * 3600;
  var minutes  = Math.floor(timestamp / 60);
  timestamp -= minutes * 60;
  var seconds = Math.floor(timestamp);
  timestamp -= seconds;
  var fractions = timestamp;
  // want 00:00:12,074
  return paddTo2(hours) + ":" + paddTo2(minutes) + ":" + paddTo2(seconds) + "," + paddTo2(Math.floor(fractions * 100));
}

function paddTo2(n) {
  var pad = new Array(1 + 2).join('0');
  return (pad + n).slice(-pad.length);
}


function humanToTimeStamp(timestamp) {
  // 0h 17m 34.54s
  sum = 0.0
  split = timestamp.split(/[hms ]/)
  removeFromArray(split, "");
  split.reverse();
  for (var i = 0; i < split.length; i++) {
    sum += parseFloat(split[i]) * Math.pow(60, i);
  }
  return sum;
}

function removeFromArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}


// no jquery since this page might already have it loaded, so don't load/use it to avoid any conflict.  [plus speedup load times :| ]
// on ready just in case here LOL
onReady(start);