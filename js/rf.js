checkElement('li[class="gbfrf-tweet gbfrf-js-tweet mdl-list__item"]').then((selector) => {
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	var observer = new MutationObserver(function(mutations, observer) {
		var d = document;
		var ax = d.querySelectorAll("li.gbfrf-tweet");
		for (var i = 0; i<ax.length;i++){
			ax[i].onclick = function(){
				chrome.runtime.sendMessage({type: "raidFinder", codos: this.dataset.raidid});
			}
		}
	});
		observer.observe(document, {
		subtree: true,
		attributes: true
	});
});	