addEventListener("load", onLoad, false);
function onLoad(){
	checkUrl(window.location.href);
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.message === 'changeUrl') {
				if (request.url.match(/game.granbluefantasy.jp/g)){
					checkUrl(request.url);
				}
			}
		}
	);
}
const checkElement = async selector => {
	while ( document.querySelector(selector) === null) {
		await new Promise( resolve =>  requestAnimationFrame(resolve) )
	}
	return document.querySelector(selector); 
};
const checkRaid = async selectors => {
	while ( document.querySelector(selectors).innerText.split(" ").length < 3) {
		await new Promise( resolve =>  requestAnimationFrame(resolve) )
	}
	return document.querySelector(selectors); 
};
function checkUrl(theUrl){
	if (theUrl.match(/#raid_multi/g)){
		checkElement('div.enemy-info div.name').then((selector) => {
			checkRaid('div.enemy-info div.name').then((selectors) => {
				//console.log(document.querySelector("div.enemy-info div.name").innerText);
				chrome.runtime.sendMessage({
					type: "raidData",
					raidData: {
						raidName: document.querySelector("div.enemy-info div.name").innerText,
						raidUrl: theUrl,
						raidId: theUrl.match(/[0-9]+$/g)
					}
				});
			});
		});	
	}else if(theUrl.match(/#profile/g)){
		checkElement('div.prt-user-id').then((selector) => {
			chrome.runtime.sendMessage({
				type: "profileData",
				profileData: {
					profileId: selector.innerText.split(" ")[3],
					profileName: document.querySelector("span.txt-user-name").innerText
				}
			});
		});
		checkElement('div.prt-title-name').then((selector) => {
			chrome.runtime.sendMessage({
				type: "profileData",
				profileData: {
					profileNameTitle: document.querySelector("div.prt-title-name").innerText,
					profileRank: document.querySelector("div.prt-rank-value").innerText
				}
			});
		});
		checkElement('div.prt-guild-name').then((selector) => {
			chrome.runtime.sendMessage({
				type: "guildData",
				guildData: {
					guildAirship: document.querySelector("div.prt-airship-name").innerText,
					guildName: document.querySelector("div.prt-guild-name").innerText
				}
			});
		});
	}
	else if(theUrl.match(/#mypage/g)){
		//clearRaid();
	}
	else if(theUrl.match(/#result_multi/g)){
		var raidIds = theUrl.match(/[0-9]+$/g);
		chrome.storage.local.get({raid: []}, function(result) {
			var raidKey = result.raid;
			raidKey.forEach(function(item, index, arr){
				if (item.raidId[0] == raidIds){
					raidKey.splice(index, 1);
					chrome.storage.local.set({raid: raidKey}, function(result) {});
				}
			});
		});
	}
}
function getAP(){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://game.granbluefantasy.jp/item/recovery_and_evolution_list_by_filter_mode", true);
		xhr.setRequestHeader('Accept', "application/json, text/javascript, */*; q=0.01");
		xhr.setRequestHeader('Content-Type', "application/json");
		xhr.setRequestHeader('X-Version', "1612496167");
		xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
		xhr.responseType = "json";
		xhr.send();
		xhr.onreadystatechange = function() {
		   if (this.readyState == 4 && this.status == 200) {
			chrome.storage.local.set({
				consumeableSupplies: {
					fullElix: this.response[0][0].number,
					halfElix: this.response[0][1].number,
					soulBalm: this.response[0][2].number,
					soulBerry: this.response[0][3].number
				}
			});
		   }
		};
}
function getCrewBuff(){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://game.granbluefantasy.jp/guild_main/support_all_info/", true);
		xhr.setRequestHeader('Accept', "application/json, text/javascript, */*; q=0.01");
		xhr.setRequestHeader('Content-Type', "application/json");
		xhr.setRequestHeader('X-Version', "1612496167");
		xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
		xhr.responseType = "json";
		xhr.send();
		xhr.onreadystatechange = function() {
		   if (this.readyState == 4 && this.status == 200) {
			   var crew = this.response;
				chrome.storage.local.set({crew});
		   }
		};
}
function getShopBuff(){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "http://game.granbluefantasy.jp/shop_exchange/activated_personal_supports/", true);
		xhr.setRequestHeader('Accept', "application/json, text/javascript, */*; q=0.01");
		xhr.setRequestHeader('Content-Type', "application/json");
		xhr.setRequestHeader('X-Version', "1612496167");
		xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
		xhr.responseType = "json";
		xhr.send();
		xhr.onreadystatechange = function() {
		   if (this.readyState == 4 && this.status == 200) {
			   var shop = this.response;
				chrome.storage.local.set({shop});
		   }
		};
}