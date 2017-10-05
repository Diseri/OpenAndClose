var intervalId;
var chromeStorage;
chrome.storage.local.get("chromeStorage", function (obj) {
    if (obj) {
        if (obj.chromeStorage) {
            if (obj.chromeStorage == 'local') {
                chromeStorage = chrome.storage.local;
            }
            else {
                chromeStorage = chrome.storage.sync;
            }
        }
    }
});

function firstLoad() {
    var cblocal = $('#cbLocal');
    var cbAccount = $('#cbAccount');

    chrome.storage.local.get("chromeStorage", function (obj) {
        if (obj) {
            if (obj.chromeStorage) {
                if (obj.chromeStorage == 'local') {
                    cblocal.prop('checked', true);
                }
                else {
                    cbAccount.prop('checked', true);
                }

                onDocReady();
            }
        }
    });
}
function setDay(index, value) {
    $('#weekCal' + index).weekLine("setSelected", value);
}

function onDocReady() {
    var cblocal = $('#cbLocal');
    var cbAccount = $('#cbAccount');

    var cblocaljs = document.getElementById('cbLocal').checked;
    var cbAccountjs = document.getElementById('cbAccount').checked;


    var isLocal = cblocaljs;
    var isAccount = cbAccountjs;
    if (isLocal)
        chromeStorage = chrome.storage.local;
    else if (isAccount)
        chromeStorage = chrome.storage.sync;


    chromeStorage.get("Use", function (obj) {
        if (obj) {
            if (obj.Use) {
                $('#spnStatus').text("Running");
                $('#spnStatus').css('color', 'green');
            } else {
                $('#spnStatus').text("Stopped");
                $('#spnStatus').css('color', 'red');
            }
        } else {
            $('#spnStatus').text("Stopped");
            $('#spnStatus').css('color', 'red');
        }
    });

    chromeStorage.get("ComboSetup", function (obj) {
        if (obj) {
            if (obj.ComboSetup) {
                var wrapper = $(".input_fields_wrap"); //Fields wrapper
                var txtOpenTimeTT = $("#txtOpenTimeTT");
                var txtDurationTT = $("#txtDurationTT");
                var weekCal = $("#weekCal");
                var urlT = $("#urlT");
                var toggle = $('#cbToggle');
                var toggleSec = $("#txtToggleDurationTT");

                var openTime = obj.ComboSetup;
                for (var i = 0; i < openTime.length; i++) {
                    var newVal = openTime[i].split('-----');
                    if (i == 0) {
                        if (newVal[0] != undefined && newVal[0] != '')
                            weekCal.weekLine("setSelected", newVal[0]);
                        if (newVal[1] != undefined && newVal[1] != '')
                            txtOpenTimeTT.val(newVal[1]);
                        if (newVal[2] != undefined && newVal[2] != '')
                            txtDurationTT.val(newVal[2]);
                        if (newVal[3] != undefined && newVal[3] != '')
                            urlT.val(newVal[3]);

                        if (newVal[4] != undefined && newVal[4] != '')
                            toggle.prop("checked", $.parseJSON(newVal[4]));
                        if (newVal[5] != undefined && newVal[5] != '') {
                            toggleSec.val(newVal[5]);
                            if (!$.parseJSON(newVal[4])) {
                                toggleSec.prop('disabled', true);
                            }
                        }

                    } else {
                        $(wrapper).append('<div><table><tr><td><span id="weekCal' + i + '" class="weekCal"></span></td><td><a class="btnSetTime" style="float:left;margin-left:4px;margin-top:4px;border:none;background-color:transparent;"><img src="images/Clock2.png" alt="Now" /></a><input style="width:80%;" type="text" name="txtOpenTimes" class="openTimesT form-control input-sm" value="' + newVal[1] + '" required placeholder="Time"/></td><td><input title="Set to zero to keep it open indefinitely." class="minutesT form-control input-sm" type="number" value="' + newVal[2] + '" name="txtDuration" min="0" step="1" data-bind="value:txtDuration" required placeholder="(Duration) Minutes" /></td><td><input type="text" class="urlT form-control input-sm" value="' + (newVal[3] != undefined && newVal[3] != '' ? newVal[3] : '') + '" placeholder="Url To Open (Optional)" /></td><td style="text-align:center;">Toggle?<input style="width:30%;" type="checkbox" title="This will ensure that it switches to the desired tab/url/page." class="toggle" id="cbToggle" placeholder="Toggle?" ' + ($.parseJSON(newVal[4]) ? 'checked' : '') + ' /></td><td><input id="txtToggleDurationTT" title="Set to zero if not being used." value="0" class="secondsT form-control input-sm" type="number" name="txtToggleDuration" min="0" step="1" data-bind="value:txtToggleDuration" value="' + newVal[5] + '" ' + (!$.parseJSON(newVal[4]) ? 'disabled=false' : '') + ' required placeholder="Toggle for (Seconds)"/></td><td><a href="#" class="remove_field">Remove</a></td></tr></table></div>'); //add input box
                        var w = $('#weekCal' + i).weekLine({
                            onChange: function () {
                                setSaveBtnEnable(true);
                            }
                        });

                        if (newVal[0] != '')
                            w.weekLine("setSelected", newVal[0]);
                        $('.openTimesT').each(function () {
                            $(this).change(function () {
                                setSaveBtnEnable(true);
                            });
                            $(this).datetimepicker({
                                datepicker: false,
                                step: 5,
                                theme: 'dark',
                                format: 'H:i'
                            });

                        });
                        $('.btnSetTime').each(function () {
                            $(this).click(function () {
                                var d = new Date();
                                var hours = d.getHours();
                                var minutes = d.getMinutes();
                                var fullTime = (hours.toString().length == 1 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes.toString().length == 1 ? "0" + minutes.toString() : minutes.toString());
                                $(this).next().val(fullTime);
                                setSaveBtnEnable(true);
                            });
                        });
                        $('.minutesT').each(function () {
                            $(this).change(function () {
                                setSaveBtnEnable(true);
                            });
                        });
                        $('.urlT').each(function () {
                            $(this).change(function () {
                                setSaveBtnEnable(true);
                            });
                        });
                        $('.toggle').each(function () {
                            $(this).change(function () {
                                setSaveBtnEnable(true);
                                if (!$(this).is(':checked')) {
                                    $(this).parent().next().children().first().prop('disabled', true);
                                    $(this).parent().next().children().first().val(0);
                                }
                                else
                                    $(this).parent().next().children().first().prop('disabled', false);
                            });
                        });
                    }
                }
            }
        }
    });

    chromeStorage.get("Duration", function (obj) {
        if (obj) {
            if (obj.Duration) {
                var txtDuration = document.getElementById('txtDuration');
                if (txtDuration)
                    txtDuration.value = obj.Duration;
            }
        }
    });
}

$(document).ready(function () {
    firstLoad();

    $('#txtOpenTime').datetimepicker({
        datepicker: false,
        step: 5,
        theme: 'dark',
        format: 'H:i'
    });

    $('#urlT').change(function () {
        setSaveBtnEnable(true);
    });

    $('#txtDurationTT').change(function () {
        setSaveBtnEnable(true);
    });

    $('#cbToggle').change(function () {
        setSaveBtnEnable(true);
        if (!$(this).is(':checked')) {
            $(this).parent().next().children().first().prop('disabled', true);
            $(this).parent().next().children().first().val(0);
        }
        else
            $(this).parent().next().children().first().prop('disabled', false);
    });

    $('#txtToggleDurationTT').change(function () {
        setSaveBtnEnable(true);
    });

    $('#txtOpenTimeTT').change(function () {
        setSaveBtnEnable(true);
    });

    $('#weekCal').weekLine({
        mousedownSel: false,
        onChange: function () {
            setSaveBtnEnable(true);
        }
    });
    $('#cbLocal').change(function () {
        var cblocaljs = document.getElementById('cbLocal').checked;
        var cbAccountjs = document.getElementById('cbAccount').checked;

        var isLocal = cblocaljs;
        var isAccount = cbAccountjs;
        if (isLocal)
            chrome.storage.local.set({
                'chromeStorage': 'local'
            }, function () { window.location.href = window.location.href; });
        else if (isAccount)
            chrome.storage.local.set({
                'chromeStorage': 'account'
            }, function () { window.location.href = window.location.href; });


    });

    $('#cbAccount').change(function () {
        var cblocaljs = document.getElementById('cbLocal').checked;
        var cbAccountjs = document.getElementById('cbAccount').checked;

        var isLocal = cblocaljs;
        var isAccount = cbAccountjs;
        if (isLocal)
            chrome.storage.local.set({
                'chromeStorage': 'local'
            }, function () { window.location.href = window.location.href; });
        else if (isAccount)
            chrome.storage.local.set({
                'chromeStorage': 'account'
            }, function () { window.location.href = window.location.href; });


    });

});

function setSaveBtnEnable(value) {
    if (value) {
        $('#btnSave').prop('disabled', false);
        $("#btnSave span").text("Save");
        $("#btnSave").removeClass($('#btnSave').attr('class')).addClass("btn btn-warning");
    } else {
        $('#btnSave').prop('disabled', true);
        $("#btnSave span").text("Saved");
        $("#btnSave").removeClass($('#btnSave').attr('class')).addClass("btn btn-success");
    }
}

document.addEventListener('DOMContentLoaded', function () {

    var checkPageButton = document.getElementById('btnSave');
    checkPageButton.addEventListener('click', function () {

        $('.openTimesT').each(function () {
            if ($(this).val() == '')
                return;
        });

        $('.minutesT').each(function () {
            if ($(this).val() == '')
                return;
        });

        var cblocal = document.getElementById('cbLocal').checked;
        var cbAccount = document.getElementById('cbAccount').checked;

        if (cblocal) {
            chrome.storage.local.set({
                'chromeStorage': 'local'
            }, function () { });
            chromeStorage = chrome.storage.local;
        }
        else if (cbAccount) {
            chrome.storage.local.set({
                'chromeStorage': 'account'
            }, function () { });
            chromeStorage = chrome.storage.sync;
        }

        // Save it using the Chrome extension storage API.
        var arr = [];
        $('.openTimesT').each(function () {
            var Time = $(this);
            var duration = $(this).parent().next().children().first();
            var url = $(this).parent().next().next().children().first();
            var selectedDays = $(this).parent().prev().children().first();
            var toggle = $(this).parent().next().next().next().children('input').first();
            var toggleSec = $(this).parent().next().next().next().next().children().first();

            if (Time && duration) {
                var timeValue = Time.val();
                var durationValue = duration.val();
                var urlValue = url.val();
                var toggleValue = toggle.is(':checked');
                var toggleSecValue = toggleSec.val();

                var concatenated = selectedDays.weekLine('getSelected') + '-----' + timeValue + '-----' + durationValue + '-----' + urlValue + '-----' + toggleValue + '-----' + toggleSecValue;
                arr.push(concatenated);
            }
        });

        chromeStorage.set({
            'ComboSetup': arr
        }, function () {
            setSaveBtnEnable(false);
        });
    }, false);

    var setTimebtn = document.getElementById('btnSetTime');
    setTimebtn.addEventListener('click', function () {
        var d = new Date();
        var hours = d.getHours();
        var minutes = d.getMinutes();
        var fullTime = (hours.toString().length == 1 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes.toString().length == 1 ? "0" + minutes.toString() : minutes.toString());
        $("#txtOpenTimeTT").val(fullTime);
        setSaveBtnEnable(true);
    }, false);
}, false);

chrome.extension.onRequest.addListener(function (request, sender) {
    if (request) {
        if (request.message) {
            if (request.message == 'Running') {
                $('#spnStatus').text("Running");
                $('#spnStatus').css('color', 'green');
            } else {
                $('#spnStatus').text("Stopped");
                $('#spnStatus').css('color', 'red');
            }
        }
        else if (request.storage) {
            var cblocal = document.getElementById('cbLocal').checked;
            var cbAccount = document.getElementById('cbAccount').checked;

            if (cblocal) {
                chrome.extension.sendRequest({
                    storage: "local"
                });
            }
            else if (cbAccount) {
                chrome.extension.sendRequest({
                    storage: "account"
                });
            }
        }
    }
});

function getlastElement() {
    if ($('.weekCal').length)
        return $('.weekCal').length;
    else
        return 0;

}

$('.btnSetTime').on("click", function () {
    var clickedBtnID = $(this).attr('id'); // or var clickedBtnID = this.id
    alert('you clicked on button #' + clickedBtnID);
});

$(document).ready(function () {
    var max_fields = 10; //maximum input boxes allowed
    var wrapper = $(".input_fields_wrap"); //Fields wrapper
    var add_button = $(".add_field_button"); //Add button ID

    var x = getlastElement(); //initlal text box count
    $(add_button).click(function (e) { //on add input button click
        e.preventDefault();
        x = getlastElement(); //initlal text box count
        if (x < max_fields) { //max input box allowed
            x++; //text box increment

            $(wrapper).append('<div><table><tr><td><span id="weekCal' + x + '" class="weekCal"></span></td><td><a class="btnSetTime" style="float:left;margin-left:4px;margin-top:4px;border:none;background-color:transparent;"><img src="images/Clock2.png" alt="Now" /></a><input style="width:80%;" type="text" name="txtOpenTimes" class="openTimesT form-control input-sm" required placeholder="Time"/></td><td><input title="Set to zero to keep it open indefinitely." class="minutesT form-control input-sm" type="number" name="txtDuration" min="0" step="1" data-bind="value:txtDuration" required placeholder="(Duration) Minutes" /></td><td><input type="text" class="urlT form-control input-sm" placeholder="Url To Open (Optional)" /></td><td style="text-align:center;">Toggle?<input style="width:30%;" type="checkbox" class="toggle" id="cbToggle" placeholder="Toggle?" title="This will ensure that it switches to the desired tab/url/page." /></td><td><input id="txtToggleDurationTT" title="Set to zero if not being used." value="0" class="secondsT form-control input-sm" type="number" name="txtToggleDuration" disabled=true min="0" step="1" data-bind="value:txtToggleDuration" required placeholder="Toggle for (Seconds)"/></td><td><a href="#" class="remove_field">Remove</a></td></tr></table></div>'); //add input box				
            $('.openTimesT').each(function () {
                $(this).datetimepicker({
                    datepicker: false,
                    step: 5,
                    theme: 'dark',
                    format: 'H:i'
                });
                $(this).change(function () {
                    setSaveBtnEnable(true);
                });
            });
            $('.btnSetTime').each(function () {
                $(this).click(function () {
                    var d = new Date();
                    var hours = d.getHours();
                    var minutes = d.getMinutes();
                    var fullTime = (hours.toString().length == 1 ? "0" + hours.toString() : hours.toString()) + ':' + (minutes.toString().length == 1 ? "0" + minutes.toString() : minutes.toString());
                    $(this).next().val(fullTime);
                    setSaveBtnEnable(true);
                });
            });

            $('.toggle').each(function () {
                $(this).change(function () {
                    setSaveBtnEnable(true);
                    if (!$(this).is(':checked')) {
                        $(this).parent().next().children().first().prop('disabled', true);
                        $(this).parent().next().children().first().val(0);
                    }
                    else
                        $(this).parent().next().children().first().prop('disabled', false);
                });
            });
            $('.secondsT').each(function () {
                $(this).change(function () {
                    setSaveBtnEnable(true);
                });
            });

            $('#txtToggleDurationTT').change(function () {
                setSaveBtnEnable(true);
            });



            $('.minutesT').each(function () {
                $(this).change(function () {
                    setSaveBtnEnable(true);
                });
            });
            $('.urlT').each(function () {
                $(this).change(function () {
                    setSaveBtnEnable(true);
                });
            });
            $('#weekCal' + x).weekLine({
                mousedownSel: false,
                onChange: function () {
                    setSaveBtnEnable(true);
                }
            });
        }
    });

    $(wrapper).on("click", ".remove_field", function (e) { //user click on remove text
        e.preventDefault();
        $(this).parent().parent().parent().parent().parent('div').remove();
        setSaveBtnEnable(true);
        x--;
    });

    $('.openTimesT').each(function () {
        $(this).datetimepicker({
            datepicker: false,
            step: 5,
            theme: 'dark',
            format: 'H:i'
        });
    });
});