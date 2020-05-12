"use strict";

//-------------------------------------------------------------------------------------------------
// Global Fields
//-------------------------------------------------------------------------------------------------
var _updating;

var _currentRegion;
var _dirtyFlag = false;
var _isChanging;

var _connection;

// attach main event listener to TXTextControl
TXTextControl.addEventListener("textControlLoaded", textControlLoadedHandler);

// attach all other required TXTextControl events
async function textControlLoadedHandler(e) {
    TXTextControl.addEventListener("editableRegionLeft", editableRegionLeftHandler);
    TXTextControl.addEventListener("editableRegionEntered", editableRegionEnteredHandler);
    TXTextControl.addEventListener("textControlChanged", textControlChangedHandler);
}

// connect to signalr hub
_connection = new signalR.HubConnectionBuilder().withUrl("/collabHub").build();
_connection.start();

_connection.on("ReceiveRegionSync", async function (syncRegion) {

    // set flag to avoid infinite loops
    _updating = true;

    TXTextControl.editableRegions.forEach(function (er) {

        // find editable region by id
        er.getID(function (id) {

            if (syncRegion.regionId == id) {
                er.getStart(function (start) {
                    er.getLength(function (length) {

                        TXTextControl.inputPosition.getTextPosition(function (sp) {

                            // select editable region
                            var sel = TXTextControl.selection;
                            var bounds = { "start": start - 1, "length": length };
                            sel.setBounds(bounds);

                            //sel = TXTextControl.selection;
                            // load synchronized content
                            sel.load(TXTextControl.StreamType.InternalUnicodeFormat,
                                syncRegion.document);

                            // reset input position
                            var bounds = { "start": sp, "length": 0 };
                            sel.setBounds(bounds);

                            // reset flags
                            setTimeout(function () {
                                _updating = false;
                                _dirtyFlag = false;
                            }, 100);
                        });

                    });
                });
            }
        });
    });
});

// force region update
function editableRegionLeftHandler(e) {
    _currentRegion = null;
    updateSection(e);
    clearInterval(_isChanging);
};

// set current region
function editableRegionEnteredHandler(e) {
    _currentRegion = e;
};

// restart interval to synchronize regions
function textControlChangedHandler() {
    if (_currentRegion != null) {
        clearInterval(_isChanging);
        _dirtyFlag = true;
        _isChanging = setInterval(function () {
            updateSection(_currentRegion);
        }, 1000);
    }
};

function updateSection(region) {

    // check flags
    if (_updating === true || _dirtyFlag === false)
        return;

    TXTextControl.editableRegions.forEach(function (er) {

        // find region by id
        er.getID(function (id) {

            if (region.editableRegion.id == id) {

                // save the region content
                er.save(TXTextControl.StreamType.InternalUnicodeFormat,
                    function (doc) {

                    // create sync object
                    var regionSyncObject = {
                        User: region.editableRegion.userName,
                        RegionId: id, Document: doc.data
                    };

                    // call signalr hub with sync object
                    _connection.invoke("SetEditableRegionSync",
                        regionSyncObject).catch(function (err) {
                            return console.error(err.toString());
                        });

                });

            }

        });
    });
}