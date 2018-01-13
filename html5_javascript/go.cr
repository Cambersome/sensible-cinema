def subcategory_map
   # "end consumer friendly": "creator instructions" (and the double dash is needed...)
   
    {
    "initial theme song": "movie-content -- initial theme song",
    "initial credits": "movie-content -- initial company credits before intro/before songs",
    "closing credits": "movie-content -- closing credits/songs",
    "subscription plea": "movie-content -- closing subscription plea",
    "joke edit": "movie-content -- joke edit -- edits that make video funny when applied",
    "movie content morally questionable choice": "movie-content -- morally questionable choice",
    "movie note for viewer": "movie-content -- movie note/message for viewer",
    "movie content other": "movie-content -- other",

    "loud noise": "profanity -- loud noise/screaming/yelling",
    "raucous music": "profanity -- raucous music",
    "personal insult mild": "profanity -- insult (\"moron\", \"idiot\" etc.)",
    "personal attack mild": "profanity -- attack command (\"shut up\" etc.)",
    "being mean": "profanity -- being mean/cruel to another",
    "derogatory slur": "profanity -- categorizing derogatory slur",
    "crude humor": "profanity -- crude humor, like poop, bathroom, gross, etc.",
    "bodily part reference mild": "profanity -- bodily part reference mild (butt, bumm, suck...)",
    "bodily part reference harsh": "profanity -- bodily part reference harsh (balls, etc.)",
    "sexual reference": "profanity -- sexual innuendo/reference",
    "violence reference": "profanity -- violence reference",
    "euphemized profanities": "profanity -- euphemized profanities (ex: crap, dang, gosh dang)",
    "lesser expletive": "profanity -- other lesser expletive ex \"bloomin'\" etc.",
    "deity religious context": "profanity -- deity use in religious context like \"the l... is good\"",
    "deity reference": "profanity -- deity use appropriate but non religious context like \"in this game you are G...\"",
    "deity exclamation mild": "profanity -- deity exclamation mild like Good L...",
    "deity exclamation euphemized": "profanity -- deity euphemized like 'oh my gosh'",
    "deity exclamation harsh": "profanity -- deity exclamation harsh, name of the Lord (omg, etc.)",
    "deity expletive": "profanity -- deity expletive (es: goll durn, the real words)",
    "deity greek": "profanity -- deity greek (Zeus, etc.)",
    "deity foreign language": "profanity -- deity different language, like Allah or French equivalents, etc",
    "personal insult harsh": "profanity -- insult harsh (son of a ..... etc.)",
    "a word": "profanity -- a.. (and/or followed by anything)",
    "d word": "profanity -- d word",
    "h word": "profanity -- h word",
    "h word in context": "profanity -- h word original meaning",
    "s word": "profanity -- s word",
    "f word": "profanity -- f-bomb expletive",
    "f word sex connotation": "profanity -- f-bomb sexual connotation",
    "profanity foreign language": "profanity -- any other profanity different language, French, etc",
    "profanity (other)": "profanity -- other",
		
    "light fight": "violence -- short fighting (single punch/kick/hit/push)",
    "sustained fight": "violence -- sustained punching/fighting",
    "threatening actions": "violence -- threatening actions",
    "stabbing/shooting no blood": "violence -- stabbing/shooting no blood",
    "stabbing/shooting with blood": "violence -- stabbing/shooting yes blood",
    "visible blood": "violence -- visible blood (ex: blood from wound)",
    "visible wound": "violence -- visible wound (no gore, light gore)",
    "open wounds": "violence -- visible gore (ex: open wound)",
    "crudeness": "violence -- crude actions, grossness, etc.",
    "collision": "violence -- collision/crash (no implied death)",
    "collision death": "violence -- collision/crash (implied death)",
    "explosion": "violence -- explosion (no implied death)",
    "explosion death": "violence -- explosion (implied death)",
    "comedic fight": "violence -- comedic/slapstick fighting",
    "shooting miss": "violence -- shooting miss or ambiguous",
    "shooting hit non death": "violence -- shooting hits person or thing but non fatal",
    "killing": "violence -- killing on screen (ex: shooting death fatal)",
    "attempted killing": "violence -- attempted killing on screen (ex: laser zap)",
    "non human killing": "violence -- non human killing/death on screen (ex: animal, or robot)",
    "killing offscreen": "violence -- killing off screen (ex: shooting death off screen)",
    "circumstantial death": "violence -- death non-killing, ex: accidental falling",
    "hand gesture": "violence -- hand gesture",
    "sports violence": "violence -- sports violence part of game",
    "rape": "violence -- rape",
    "dead body": "violence -- dead body visible lifeless",
    "suicidal actions": "violence -- suicidal actions",
    "creepy": "violence -- creepy/horror/unsettling",
    "violence (other)": "violence -- other",

    "art nudity": "physical -- art based nudity",
    "revealing clothing": "physical -- revealing clothing (scantily clad)",
    "tight clothing": "physical -- tight clothing (revealing because tight)",
    "underwear": "physical -- clad in underwear",
    "swimsuit": "physical -- swimsuit",
    "light cleavage": "physical -- light cleavage/barely revealing",
    "revealing cleavage": "physical -- revealing cleavage",
    "partial nudity": "physical -- partial nudity (ex: excessive cleavage)",
    "nudity posterior male": "physical -- nudity (posterior) male",
    "nudity posterior female": "physical -- nudity (posterior) female",
    "nudity anterior male": "physical -- nudity (anterior) male",
    "nudity anterior female": "physical -- nudity (anterior) female",
    "nudity breast": "physical -- nudity (breast)",
    "shirtless male": "physical -- shirtless male (non sexual)",
    "kissing peck": "physical -- kiss (peck)",
    "kissing passionate": "physical -- kiss (passionate)",
    "sexually charged scene": "physical -- sexually charged scene",
    "sex foreplay": "physical -- sex foreplay",
    "implied sex": "physical -- implied sex",
    "explicit sex": "physical -- explicit sex",
    "homosexual behavior": "physical -- homosexual behavior (kissing, holding hands, light stuff)",
    "physical (other)": "physical -- other",

    "alcohol": "substance-abuse -- alcohol drinking",
    "smoking": "substance-abuse -- smoking legal stuff (cigar, cigarette)",
    "smoking illegal": "substance-abuse -- smoking illegal drugs",
    "drugs": "substance-abuse -- illegal drug use",
    "drug injection": "substance-abuse -- drug use injection",
    "substance-abuse other": "substance-abuse -- other",

    "frightening/startling scene/event": "suspense -- frightening/startling scene/event",
    "suspenseful fight \"will they win?\"": "suspense -- suspenseful fight \"will they win?\"",
    "suspense other": "suspense -- other"
  }
end
puts "{"
puts subcategory_map.to_a.group_by{|db_name, cat_with_human_name| cat_with_human_name.split(" -- ")[0]}.each{|category, entries|
  puts "\"#{category}\": ["
  entries.each{|k, v|
    sans_cat = v.split(" -- ")[1].gsub("\"", "\\\"")
    k = k.to_s.gsub("\"", "\\\"")
    puts "  {db_name: \"#{k}\", human_name: \"#{sans_cat}\", sub_sub_cat: \"\"},"
  }
  puts "],"

}
puts "}"
