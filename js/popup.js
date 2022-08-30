chrome.storage.local.get([
	'profileId',
	'profileName',
	'profileNameTitle',
	'profileRank',
	'guildName',
	'guildAirship'
	], function(result) {
		document.getElementById("profileID").innerHTML = result.profileId;
		document.getElementById("profileName").innerHTML = result.profileName;
		document.getElementById("profileTitleName").innerHTML = result.profileNameTitle;
		document.getElementById("profileRank").innerHTML = result.profileRank;
		document.getElementById("guildName").innerHTML = result.guildName;
		document.getElementById("guildAirship").innerHTML = result.guildAirship;
		document.getElementById("copyProfileId").disabled = false;
		
});
chrome.storage.sync.get({commands: []}, function(result) {
	if(!isEmpty(result.commands)){
		document.getElementById("link1").value = result.commands.command_link;
		document.getElementById("key1").innerText = result.commands.key;
		
	}
});
chrome.storage.local.get({raid: []}, function(result) {
		if (result.raid.length > 0){
			document.getElementById("raidTab").classList.add("show");
			document.getElementById("clearRaid").style.display = "block";
		}
		document.getElementById("total-raid").innerText = result.raid.length;
		for(var i = 0;i<result.raid.length;i++){
			var divNew = document.createElement("div");
			var bNew = document.createElement("b");
			var brNew = document.createElement("br");
			var btNew = document.createElement("button");
			var iNew = document.createElement("i");
			iNew.setAttribute("class", "fa fa-arrow-right");
			btNew.style.marginLeft = "10px";
			btNew.setAttribute("class", "btn btn-outline-secondary raid");
			btNew.setAttribute("data-href", result.raid[i].raidUrl);
			divNew.setAttribute("data-id", i);
			bNew.innerHTML = "["+(i+1)+"] "+result.raid[i].raidName;
			divNew.appendChild(bNew);
			btNew.appendChild(iNew);
			divNew.appendChild(btNew);
			divNew.appendChild(brNew);
			document.getElementById("raid-Tab").appendChild(divNew);
		}
	
});
chrome.storage.local.get(function(result) {
	if ("shop" in result){
		Object.keys(result.shop).forEach(function (item) {
			var elementImage = document.createElement("img");
			var elementP = document.createElement("span");
			elementP.innerText = " "+result.shop[item].remain_time;
			elementImage.setAttribute("src", "http://game-a.granbluefantasy.jp/assets_en/img/sp/assets/item/support/"+result.shop[item].image_path+"_4.png");
			elementImage.setAttribute("width", "25");
			elementImage.setAttribute("title", result.shop[item].name);
			document.getElementById("shopBuff").appendChild(elementImage);
			document.getElementById("shopBuff").appendChild(elementP);
			document.getElementById("shopBuff").appendChild(document.createElement("br"));
			
		});
	}
	if ("crew" in result){
		Object.keys(result.crew).forEach(function (item) {
			var elementImage = document.createElement("img");
			var elementP = document.createElement("span");
			elementP.innerText = " "+result.crew[item].time;
			elementImage.setAttribute("src", "http://game-a.granbluefantasy.jp/assets_en/img/sp/assets/item/support/support_"+result.crew[item].image+"_3.png");
			elementImage.setAttribute("width", "25");
			elementImage.setAttribute("title", result.crew[item].comment);
			document.getElementById("crewBuff").appendChild(elementImage);
			document.getElementById("crewBuff").appendChild(elementP);
			document.getElementById("crewBuff").appendChild(document.createElement("br"));
			
		});
	}
});

window.onload = function() {
	UpdateConsumeableSupplies();
	var d = document;
	document.getElementById("copyProfileId").onclick = function(){
		var e=d.createElement('textarea');
		e.id="id-profile-gbf";
		e.innerHTML= d.getElementById("profileID").innerText;
		var b=d.getElementsByTagName('body').item(0);
		b.appendChild(e);
		d.getElementById('id-profile-gbf').select();
		d.execCommand('Copy');b.removeChild(e);
	};
	var ax = d.getElementsByClassName("btn btn-outline-secondary raid");
	for (var i = 0; i<ax.length;i++){
		ax[i].onclick = function(){
			chrome.tabs.query({ active: true }, function(tabs) {  
				chrome.tabs.remove(tabs[0].id);   
			}); 
			chrome.tabs.create({ url: this.dataset.href });
		}
	}
	document.getElementById("save1").onclick = function(){
		chrome.runtime.sendMessage({type: "commandSet", commands: {command_link: d.getElementById("link1").value, key: "ctrl+q"}});
	};
	function checkTime(i) {
	  if (i < 10) {
		i = "0" + i;
	  }
	  return i;
	}

	function startTime() {
		const time = Date.now()
		var today = new Date(time);
		const utcHours = today.getUTCHours() // UTC Hour
		today.setHours(utcHours + 9);
		var h = today.getHours();
		var m = today.getMinutes();
		var s = today.getSeconds();
		m = checkTime(m);
		s = checkTime(s);
		document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
		t = setTimeout(function() {
			startTime()
		}, 500);
	}
	startTime();
	document.getElementById("gotoCrew").addEventListener("click", function(e){
		changePage("http://game.granbluefantasy.jp/#guild");
	});
/*chrome.runtime.onMessage.addListener(function(message, messageSender, sendResponse) {
	switch (message.type){
		case "raidFinder":
			doRaid(message.codos);
		break;
	}
});
*/
	document.getElementById("join").addEventListener("click", function(e){
		var xhr = new XMLHttpRequest();
		var payload = { special_token: null, battle_key: document.getElementById("code").value };
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
				   changePage("http://game.granbluefantasy.jp/"+this.response.redirect);
			   }else if(this.response.current_battle_point < this.response.used_battle_point){
					document.getElementById("alertraid").innerText = "Fill ur BP";
			   }else{
					document.getElementById("alertraid").innerText = this.response.popup.body;
			   }
		   }
		};
		
	});
	document.getElementById("clearRaid").addEventListener("click", function(){
		clearRaid();
	});
	
}

function changePage(u){
	chrome.tabs.query({ active: true }, function(tabs) {  
		chrome.tabs.remove(tabs[0].id);   
	}); 
	chrome.tabs.create({ url: u });
}
function clearRaid(){
	chrome.storage.local.remove(["raid"],function(){
		var error = chrome.runtime.lastError;
		if (error) {
			console.error(error);
		}
	});
}
function UpdateConsumeableSupplies(){
	chrome.storage.local.get({consumeableSupplies: []}, function(result) {
		document.getElementById("fullElix").innerText = result.consumeableSupplies.fullElix;
		document.getElementById("halfElix").innerText = result.consumeableSupplies.halfElix;
		document.getElementById("soulBalm").innerText = result.consumeableSupplies.soulBalm;
		document.getElementById("soulBerry").innerText = result.consumeableSupplies.soulBerry;
	});
}
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
function isEmptyObject(value) {
  return Object.keys(value).length === 0 && value.constructor === Object;
}