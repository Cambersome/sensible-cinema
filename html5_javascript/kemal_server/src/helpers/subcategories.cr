Subcats = {} of String => String

def subcategory_map
   # I guess this is like "end consumer friendly" and "creator instructions" the double dash is needed
   
   if (Subcats.size == 0)  # I couldn't resist though probably unneeded LOL
   Subcats.merge!({
    "initial theme song" => "movie-content -- initial theme song/credits",
    "closing credits" => "movie-content -- closing credits/songs",
    "joke edit" => "movie-content -- joke edit -- edits that make it funny when applied",
    "movie content morally questionable choice" => "movie-content -- morally questionable choice",
    "movie content other" => "movie-content -- other",

    "loud noise" => "profanity -- loud noise/screaming",
    "personal insult mild" => "profanity -- insult (\"moron\", \"idiot\" etc.)",
    "personal insult harsh" => "profanity -- insult harsh (b.... etc.)",
    "personal attack mild" => "profanity -- attack command (\"shut up\" etc.)",
    "being mean" => "profanity -- being mean/cruel to another",
    "crude humor" => "profanity -- crude humor, like poop, bathroom, gross, etc.",
    "bodily part reference mild" => "profanity -- bodily part reference mild (butt, bumm...)",
    "bodily part reference harsh" => "profanity -- bodily part reference harsh",
    "sexual reference" => "profanity -- sexual innuendo/reference",
    "euphemized profanities" => "profanity -- euphemized 4-letter (crap, dang, gosh)",
    "deity appropriate context" => "profanity -- deity use in appropriate context like \"the l... is good\"",
    "deity exclamation mild" => "profanity -- deity exclamation  mildlike Good L...,  the gods, etc.",
    "deity exclamation harsh" => "profanity -- deity exclamation harsh, name of the Lord (omg, etc.)",
    "deity expletive" => "profanity -- deity expletive (es: goll durn but the real words)",
    "medium expletive" => "profanity -- medium expletive ex \"bloomin'\" etc.",
    "a word" => "profanity -- a.. (and/or followed by anything else)",
    "d word" => "profanity -- d word",
    "h word" => "profanity -- h word",
    "s word" => "profanity -- s word",
    "f word" => "profanity -- f-bomb expletive",
    "f word sex connotation" => "profanity -- f-bomb with sexual connotation",
    "profanity (other)" => "profanity -- other",
		
    "stabbing/shooting no blood" => "violence -- stabbing/shooting no blood",
    "stabbing/shooting with blood" => "violence -- stabbing/shooting yes blood",
    "visible blood" => "violence -- visible blood of wound",
    "open wounds" => "violence -- gore/open wound",
    "light fight" => "violence -- light fighting (single punch/kick/hit/push)",
    "sustained fight" => "violence -- sustained punching/fighting",
    "killing" => "violence -- killing on screen (ex: bullet shot)",
    "killing offscreen" => "violence -- killing off screen",
    "circumstantial death" => "violence -- death non-killing, like falling",
    "rape" => "violence -- rape",
    "violence (other)" => "violence -- other",

    "art nudity" => "physical -- art based nudity",
    "revealing clothing" => "physical -- revealing clothing (cleavage, scantily clad)",
    "nudity posterior male" => "physical -- nudity (posterior) male",
    "nudity posterior female" => "physical -- nudity (posterior) female",
    "nudity anterior male" => "physical -- nudity (anterior) male",
    "nudity anterior female" => "physical -- nudity (anterior) female",
    "nudity breast" => "physical -- nudity (breast)",
    "kissing peck" => "physical -- kiss (peck)",
    "kissing passionate" => "physical -- kiss (passionate)",
    "sex foreplay" => "physical -- sex foreplay",
    "implied sex" => "physical -- implied sex",
    "explicit sex" => "physical -- explicit sex",
    "physical (other)" => "physical -- other",

    "drugs" => "substance-abuse -- drug use",
    "alcohol" => "substance-abuse -- alcohol drinking",
    "smoking" => "substance-abuse -- smoking",
    "substance-abuse other" => "substance-abuse -- other",

    "frightening/startling scene/event" => "suspense -- frightening/startling scene/event",
    "suspenseful fight \"will they win?\"" => "suspense -- suspenseful fight \"will they win?\""
    })
  end
  Subcats
end
