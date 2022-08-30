chrome.runtime.onMessage.addListener(function(message, messageSender, sendResponse) {
	switch (message.type){
		case "profileData":
			chrome.storage.local.set({
				profileId: message.profileData.profileId,
				profileName: message.profileData.profileName,
				profileRank: message.profileData.profileRank,
				profileNameTitle: message.profileData.profileNameTitle
				}, function() {
			});
			//alert("set"+message.profileData.guildName);
		break;
		case "guildData":
			chrome.storage.local.set({
				guildName: message.guildData.guildName,
				guildAirship: message.guildData.guildAirship
				}, function() {
			});
			//alert("set"+message.guildData.guildName);
		break;
		case "raidData":
			chrome.storage.local.get({raid: []}, function(result) {
				var getraidid=false;
				var raidKey = result.raid;
				raidKey.forEach(function(item, index, arr){
					if (item.raidId[0] == message.raidData.raidId){
						getraidid = true;
					}
				});
				if (!getraidid){
					
					raidKey.push({
						raidName: message.raidData.raidName,
						raidUrl: message.raidData.raidUrl,
						raidId: message.raidData.raidId
					});
					chrome.storage.local.set({raid: raidKey}, function() {});
				}
				
			});
		break;
		case "commandSet":
			chrome.storage.sync.set({commands:message.commands}, function(result) {
				alert("saved!");
			});
		break;
		case "raidFinder":
			doRaid(message.codos);
		break;
	}
});
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.getSelected(null,function(tab) {
		var url = tab.url;
		if (url.match(/gbf-raidfinder/g)){
			chrome.browserAction.setBadgeText({text: "API"});
			chrome.browserAction.setBadgeBackgroundColor({color: "red"});
		}else if (url.match(/game.granbluefantasy.jp/g)){
			chrome.browserAction.setBadgeText({text: "ON"});
			chrome.browserAction.setBadgeBackgroundColor({color: "green"});
		}else{
			chrome.browserAction.setBadgeText({text: "OFF"});
			chrome.browserAction.setBadgeBackgroundColor({color: "black"});
		}
	});
});
chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
      chrome.tabs.sendMessage( tabId, {
        message: 'changeUrl',
        url: changeInfo.url
      });

    }
  }
);
chrome.commands.onCommand.addListener(function(command) {
   if (command == 'funcA'){
	   chrome.storage.sync.get({commands: []}, function(result){
		   chrome.tabs.query({ active: true }, function(tabs) {  
				chrome.tabs.remove(tabs[0].id);   
			}); 
			chrome.tabs.create({ url: result.commands.command_link });
	   });
   }
});

/* All Function */
function doRaid(codos){
		var xhr = new XMLHttpRequest();
		var payload = { special_token: null, battle_key: codos };
		xhr.open("POST", "http://game.granbluefantasy.jp/quest/battle_key_check", true);
		xhr.setRequestHeader('Accept', "application/json, text/javascript, */*; q=0.01");
		xhr.setRequestHeader('Content-Type', "application/json");
		xhr.setRequestHeader('X-Version', "1612496167");
		xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
		xhr.responseType = "json";
		xhr.send(JSON.stringify(payload));
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log(this);
				if (!isEmpty(this.response.redirect)){
					var urlNya = this.response.redirect;
					chrome.tabs.query({url: "*://game.granbluefantasy.jp/*"}, function(tabs) {
						if (!isEmpty(tabs[0])){
							//chrome.tabs.update(tabs[0].id, {url: "http://game.granbluefantasy.jp/"+this.response.redirect});
							chrome.tabs.remove(tabs[0].id);  
							chrome.tabs.create({ url: "http://game.granbluefantasy.jp/"+urlNya });	
						}else{
							chrome.tabs.create({ url: "http://game.granbluefantasy.jp/"+urlNya });	
						}
						//chrome.tabs.update(tabs[0].id, {url: "http://game.granbluefantasy.jp/"+this.response.redirect});
						//alert(tabs[0].id);
						//doRaid(message.codos);
					}); 
					//changePage("http://game.granbluefantasy.jp/"+this.response.redirect);
				}else if(this.response.current_battle_point < this.response.used_battle_point){
					//alert("Fill ur BP");
					var xhrr = new XMLHttpRequest();
					var payloadd = {special_token: null, item_id: "5", num: (this.response.used_battle_point-this.response.current_battle_point)};
					xhrr.open("POST", "http://game.granbluefantasy.jp/item/use_normal_item", true);
					xhrr.setRequestHeader('Accept', "application/json, text/javascript, */*; q=0.01");
					xhrr.setRequestHeader('Content-Type', "application/json");
					xhrr.setRequestHeader('X-Version', "1612496167");
					xhrr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
					xhrr.responseType = "json";
					xhrr.send(JSON.stringify(payloadd));
					xhrr.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
							doRaid(codos);
						}
					};
				}else{
					if (this.response.popup.body == "Check your pending battles."){
						chrome.tabs.query({url: "*://game.granbluefantasy.jp/*"}, function(tabs) {
						if (!isEmpty(tabs[0])){
							chrome.tabs.remove(tabs[0].id);  
							chrome.tabs.create({ url: "http://game.granbluefantasy.jp/#quest/assist/unclaimed/0/0" });	
						}else{
							chrome.tabs.create({ url: "http://game.granbluefantasy.jp/#quest/assist/unclaimed/0/0" });	
						}
						//chrome.tabs.update(tabs[0].id, {url: "http://game.granbluefantasy.jp/"+this.response.redirect});
						//alert(tabs[0].id);
						//doRaid(message.codos);
						}); 
					}else{
						alert(this.response.popup.body);
					}
				}
			}
		};
}
const checkElement = async selector => {
	while ( document.querySelector(selector) === null) {
		await new Promise( resolve =>  requestAnimationFrame(resolve) )
	}
	return document.querySelector(selector); 
};
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
function changePage(u){
	chrome.tabs.query({ active: true }, function(tabs) {  
		chrome.tabs.remove(tabs[0].id);   
	}); 
	chrome.tabs.create({ url: u });
}
/*
chrome.runtime.onConnect.addListener(function(port) {
    if(port.name == "profileData"){
        port.onMessage.addListener(function(message) {
            chrome.storage.sync.set({
				profileId: message.profileId,
				profileTitleName: message.profileTitleName,
				profileName: message.profileName
				}, function() {
			  alert("sent");
			});
			
        });
    }
});
*/
/*
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    let url = tabs[0].url;
    if (url.match(/game.granbluefantasy.jp/g)){
		chrome.browserAction.setBadgeText({text: "1234"});
			chrome.browserAction.setBadgeBackgroundColor({color: "red"});
	}else{
		chrome.browserAction.setBadgeText({text: "1234"});
			chrome.browserAction.setBadgeBackgroundColor({color: "black"});
	}
});
*/