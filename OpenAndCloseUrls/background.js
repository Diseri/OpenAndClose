var timerUniqueId = '';
var secondTimerUniqueId = '';
//var uniqueID = '';
var chromeStorage;
var openNow = true;
var taburlId = "";
var tabUrltoNavigateToId = "";
var tabUrl = false;
var tabUrltoNavigateTo = false;

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get("chromeStorage", function(obj) {
        if (obj) {
            if (obj.chromeStorage) {
                if (obj.chromeStorage == 'local') {
                    chromeStorage = chrome.storage.local;
                } else {
                    chromeStorage = chrome.storage.sync;
                }
                executeAfterMessageRecieved();
            }
        }
    });
});

function executeAfterMessageRecieved() {
    chromeStorage.get("Use", function(obj) {
        if (obj) {
            if (obj.Use) {
                chromeStorage.set({
                    'Use': false
                }, function() {
                    StopProcess();
					runNow = false;
                    chrome.browserAction.setIcon({
                        path: "images/RedIcon.png"
                    });
                    chrome.browserAction.setTitle({
                        title: "Open and Close: Stopped!"
                    });
                    chrome.extension.sendRequest({
                        message: "Stopped"
                    });

                });
            } else {
                chromeStorage.set({
                    'Use': true
                }, function() {
                    chrome.browserAction.setIcon({
                        path: "images/GreenIcon.png"
                    });
                    chrome.browserAction.setTitle({
                        title: "Open and Close: Running!"
                    });
                    chrome.extension.sendRequest({
                        message: "Running"
                    });

                    //OpenDisplayPage();
					runNow = true;
                    StartProcess();
                    startToggleTimer(0);
                });
            }
        }
    });
}

// chrome.extension.onRequest.addListener(function(request, sender) {
// if (request) {
// if(request.storage) {
// if(request.storage == 'local') {
// chromeStorage = chrome.storage.local;
// }
// else {
// chromeStorage = chrome.storage.sync;
// }

// }
// }
// });
// Accepts Interger as the value.
function tabExists(value) {
    chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].id == value) {
                return true;
            }
        }
    });
    return false;
}

function StopProcess() {
	runNow = false;
    if (timerUniqueId != '')
        clearTimeout(timerUniqueId);
    if (secondTimerUniqueId != '')
        clearTimeout(secondTimerUniqueId);
    for (i = 0; i < 100; i++) {
        clearTimeout(i);
    }
}

function OpenDisplayPage() {
    chromeStorage.get("UrltoNavigateTo", function(obj) {
        if (obj) {
            if (obj.UrltoNavigateTo) {
                var newURL = obj.UrltoNavigateTo;
                tabUrltoNavigateTo = true;
                chrome.tabs.create({
                    url: newURL
                });
            }
        }
    });
}

function StartProcess() {
    startTimer();
    startSecondTimer();
}

var readyToOpen = true;
function startTimer() {
    var timerUniqueId = setTimeout(function() {
        OpenPage();
        clearTimeout(timerUniqueId);
        startTimer();
    }, 1000);
}

function startSecondTimer() {
    secondTimerUniqueId = setTimeout(function() {
        if (tabUrltoNavigateToId != '')
            setTabActive(tabUrltoNavigateToId, false);
    }, 3000);
}

var timerCount = 0;
var cContinue = true;

function startToggleTimer(proceedingIndex) {
    var allotedTime = 3500;
    var toggles = tabArray[proceedingIndex];
    if (!toggles) {
        proceedingIndex = 0;
        toggles = tabArray[proceedingIndex];
    }

    if (toggles) {
        var options = toggles.Options;
        var checkToggle = options.toggle == "false" ? false : true;

        if (checkToggle) {
			if(runNow && !waitingForPageLoad) {
				setNewTabActiveTimer(toggles.tabId, parseInt(options.toggleDuration) * 1000, proceedingIndex);
				cContinue = false;
			}
        }
    } else {
        proceedingIndex = 0;
		cContinue = true;
    }
    if (cContinue)
        proceed(allotedTime, proceedingIndex);
}

var runNow = true;
function proceed(allotedTime, proceedingIndex) {
	// if(runNow && !waitingForPageLoad)
		var toggleTimerId = setTimeout(function() {
			var newIndex = proceedingIndex + 1;
			startToggleTimer(newIndex);
			clearTimeout(toggleTimerId);
		}, allotedTime);
}

var timeslotAvailable = true;
var waitingForPageLoad = false;

function setNewTabActiveTimer(tabId, millisecs, index) {
    timeslotAvailable = false;
    setTabActive(tabId, false);
	toggleTimerEvent(millisecs, index);
}

function toggleTimerEvent(millisecs, index) {
	    var id = setTimeout(function() {

        cContinue = true;
		// if(runNow && !waitingForPageLoad)
			startToggleTimer(index + 1);

        timeslotAvailable = true;
        clearTimeout(id);
    }, millisecs);
}

function startTimerDurationV2(tabId, duration) {
    var dur = parseInt(duration);
    var seconds = dur * 60;
    var milliseconds = seconds * 1000;

    for (var i = 0; i < tabArray.length; i++) {
        if (tabArray[i].tabId == tabId) {
            tabArray[i].durationTimerStarted = true;
        }
    }

    if (dur != 0)
        removeTabs(tabId, milliseconds);
}

function removeTabs(tabId, milliseconds) {
    var uniqueID = setTimeout(function() {
        for (var i = 0; i < tabArray.length; i++) {
            var toggles = tabArray[i];

            if (tabId == toggles.tabId)
                tabArray.splice(i, 1);
        }

        chrome.tabs.remove(tabId);
        clearTimeout(uniqueID);
    }, milliseconds);
}

var durationNext = '';

function OpenPage() {
    chromeStorage.get("ComboSetup", function(obj) {
        if (obj) {
            if (obj.ComboSetup) {
                clearTimeout(timerUniqueId);
                ValidateActioning(obj.ComboSetup);
            }
        }
    });
}

function ValidateActioning(ComboSetup) {
	readyToOpen = false;
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var fullTime = (hours.toString().length == 1 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes.toString().length == 1 ? "0" + minutes.toString() : minutes.toString());

    var weekday = new Array(7);
    weekday[0] = "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tue";
    weekday[3] = "Wed";
    weekday[4] = "Thu";
    weekday[5] = "Fri";
    weekday[6] = "Sat";

    var n = weekday[d.getDay()];
    var openTime = ComboSetup;
    var timeOut = 5000;
	
    for (var i = 0; i < openTime.length; i++) {
        var newVal = openTime[i].split('-----');
        var days = newVal[0].split(',');

        for (var j = 0; j < days.length; j++) {
            if (days[j] === n)
                if (newVal[1].toString().replace(' ', '') === fullTime.toString().replace(' ', '')) {
                    var newItem = {
                        day: newVal[0],
                        time: newVal[1],
                        duration: newVal[2],
                        url: newVal[3],
                        toggle: newVal[4],
                        toggleDuration: newVal[5]
                    };
				if(!waitingForPageLoad)
                    OpenNewPage(timeOut, newItem);
                    timeOut = timeOut + 5000;
                    openNow = false;
                }
        }
    }
}

function tabExistsInArray(url) {
    for (var i = 0; i < tabArray.length; i++) {
        var toggles = tabArray[i];
        if (toggles.Options.url == url)
            return true;
    }
    return false;
}

function OpenNewPage(timeout, toggleOptions) {
    var waitforUrl = setTimeout(function() {
		if(!waitingForPageLoad && runNow)
        if (toggleOptions.url != '') {
            var exists = tabExistsInArray(toggleOptions.url);
            if (!exists) {
				waitingForPageLoad = true;
                chrome.tabs.create({
                        url: toggleOptions.url
                    },
                    function(tab) {
                        var newItem = {
                            tabId: tab.id,
                            duration: toggleOptions.duration,
                            durationTimerStarted: false,
                            Options: toggleOptions
                        };
                        tabArray.push(newItem);
                        setTabActive(tab.id, true);
                    });
            }
        } else {
			if(!waitingForPageLoad && runNow)
            chromeStorage.get("url", function(obj) {
                if (obj) {
                    if (obj.url) {
                        var exists = tabExistsInArray(obj.url);
                        if (!exists) {
							waitingForPageLoad = true;
                            chrome.tabs.create({
                                    url: obj.url
                                },
                                function(tab) {
                                    var newItem = {
                                        tabId: tab.id,
                                        duration: toggleOptions.duration,
                                        durationTimerStarted: false,
                                        Options: toggleOptions
                                    };
                                    tabArray.push(newItem);
                                    setTabActive(tab.id, true);
                                });
                        }
                    }
                }
            });
        }
		readyToOpen = true;
        clearTimeout(waitforUrl);
    }, timeout);
}
var tabArray = [];
var tabArray2 = [];

chrome.tabs.onCreated.addListener(function(tab) {

});

chrome.tabs.onRemoved.addListener(function(tabId, info) {
    for (var i = 0; i < tabArray.length; i++) {
        var toggles = tabArray[i];

        if (tabId == toggles.tabId)
            tabArray.splice(i, 1);
    }
	
	waitingForPageLoad = false;
});

chrome.windows.onRemoved.addListener(function(windowId){
                  chrome.storage.local.set({
                    'Use': false
                }, function() {
                    StopProcess();
                    chrome.browserAction.setIcon({
                        path: "images/RedIcon.png"
                    });
                    chrome.browserAction.setTitle({
                        title: "Open and Close: Stopped!"
                    });
                    chrome.extension.sendRequest({
                        message: "Stopped"
                    });

                });
});

chrome.tabs.onUpdated.addListener(function(tabId, info) {
    if (info.status === 'complete') {
        if (tabArray.length > 0) {
            for (var i = 0; i < tabArray.length; i++) {
                var item = tabArray[i];
                if (item.tabId == tabId)
                    if (!item.durationTimerStarted) {
                        startTimerDurationV2(item.tabId, item.duration);
                    }
            }
        }
    }
});

function setTabActive(newTabId, addDelay) {
	if(addDelay)
	{
	    var timerUniqueId = setTimeout(function() {
			afterWaitTimerEvent(newTabId, timerUniqueId);
		}, 3000);
	}
	else
	{
		if(!waitingForPageLoad)
			finalActive(newTabId);
	}
}

function afterWaitTimerEvent(newTabId, timerId) {
	waitingForPageLoad = false;
	finalActive(newTabId);
	clearTimeout(timerId);
}

function finalActive(newTabId) {
	    chrome.tabs.update(newTabId, {
        selected: true
    });
    chrome.tabs.update(newTabId, {
        active: true
    });
}