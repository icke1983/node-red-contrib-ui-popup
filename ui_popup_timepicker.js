module.exports = function(RED) {
    var ui = undefined;
    
    var generateHTML = function (node, config) {
        var id = node.id.replace(/[^\w]/g, "");
        var pos = "";
        var HTML = "";
        var hhLi = "";
        var mmLi = "";
        for (let i=0; i<60;i++)
        {
            let buttonText = i.toString();
            if (i<10) { buttonText = "0"+buttonText; }
            if (i < 24) { 
                hhLi += String.raw`<li class="selector" id="hhLi_${id}_${i}" ng-click="hhSet(${buttonText})"><span>${buttonText}</span></li>`;
            }
            mmLi += String.raw`<li class="selector" id="mmLi_${id}_${i}" ng-click="mmSet(${buttonText})"><span>${buttonText}</span></li>`;

            
        }
        switch(config.position) {
            case "tl":
                pos = "top: 0px; left: 0px; margin-top: 0px; margin-left: 0px;";
                break;
            case "tr":
                pos = "top: 0px; right: 0px; margin-top: 0px; margin-right: 0px;";
                break;
            case "bl":
                pos = "bottom: 0px; left: 0px; margin-bottom: 0px; margin-left: 0px;";
                break;
            case "br":
                pos = "bottom: 0px; right: 0px; margin-bottom: 0px; margin-right: 0px;";
                break;
            case "center":
                pos = "top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0px;";
                break;
        } 
        HTML += String.raw`
            <style id="ui-popup-timepicker-style_${id}">
                .ui-popup-dialog._${id} {
                    ${pos}
                }
            </style>
            <style id="ui-popup-dialog-style">
                .ui-popup-dialog {
                    padding: 0px;
                    position: relative;
                }
                .ui-popup-dialog[open] {
                    background: none;
                    border: none;
                }
                
                .ui-popup-dialog[open]::backdrop {
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(3px);
                }
            </style>
            <style id="ui-popup-timepicker-style">
                .ui-popup-timepicker {
                    position: absolute;
                }
                .ui-popup-timepicker .content{
                    width: 280px;
                    display: grid;
                    grid-template-columns: 40px 100px 100px 40px;
                }
                .ui-popup-timepicker .valueContainer {   
                    border: solid 1px var(--nr-dashboard-widgetColor);
                    color: var(--nr-dashbord-widgetTextColor); 
                    overflow-x: hidden;
                    overflow-y: auto;
                    height: 106px;
                    margin: 6px;
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */ 
                    
                }
                .ui-popup-timepicker .nr-dashboard-button{
                    margin: 6px;
                }
                .ui-popup-timepicker ul {
                    list-style-type: none;
                    margin: 0px;
                    padding: 0px;
                }
                .ui-popup-timepicker li{
                    text-align: center;
                    height: 36px;
                    color: var(--nr-dashboard-widgetTextColor);
                }
                .ui-popup-timepicker li.selector:hover{
                    border: 1px solid var(--nr-dashboard-widgetTextColor);
                    cursor: pointer;
                }
                .ui-popup-timepicker li:focus{
                    outline: none;
                }
                .ui-popup-timepicker li.selected{
                    background-color: var(--nr-dashboard-widgetColor);
                }
                .ui-popup-timepicker li span{
                    line-height: 36px;
                }
                .ui-popup-timepicker .valueContainer::-webkit-scrollbar {
                    display: none;
                }
                .ui-popup-timepicker .valueContainer button {
                    paddin: 5px !important;
                    margin: 0px;
                    width: 100%;
                    height: unset;
                    background-color: unset;
                    border: unset;
                    border-radius: unset;
                    box-shadow: unset;
                    
                }
            </style>
            <div id="ui-popup-timeselect_${id}" class="nr-dashboard-cardpanel ${config.class}">
                <p class="nr-dashboard-cardtitle">${config.label}</p>
                <div class="content">
                    <div class="spacer"></div>
                    <div class="valueContainer">
                    <ul>
                    <li>
                    ${hhLi}
                    <li>
                    <ul>
                    </div>
                    <div class="valueContainer">
                    <ul>
                    <li>
                    ${mmLi}
                    <li>
                    <ul>
                    </div>
                    <div class="spacer"></div>
                </div>
                <div class="content">
                    <div class="nr-dashboard-button" style="grid-column: span 2;">
                    <button class="md-button md-raised" ng-click="timeCancel()"><span>${config.labelCancelButton}</span></button>
                    </div>
                    <div class="nr-dashboard-button" style="grid-column: span 2;">
                    <button class="md-button md-raised" ng-click="timeOk()"><span>${config.labelOkButton}</span></button>
                    </div>
                </div>
            </div>`;
        return HTML;
    }
    
    function ui_popup_timepicker(config) {
        try {
            RED.nodes.createNode(this,config);
            var node = this;
            
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            
            node.on('input', function(msg) {
                                
                //set topic
                if (config.topicType == "msg") {
                    node.topic = "";
                    try { node.topic = RED.util.getMessageProperty(msg, config.topic); } catch (e) {}
                }
                //node.send({payload: msg.payload});
            });

            var done = ui.addWidget({
                node: node,
                format: generateHTML(node, config),
                templateScope: "local",
                group: config.group,
                emitOnlyNewValues: false,
                forwardInputMessages: false,
                storeFrontEndInputAsState: false,
                group: config.group,
                order: config.order,
                width: 0,
                height: -1,
                
                convertBack: function (value) {
                    return value;
                },

                beforeSend: function (msg, orig) {
                    if(orig) {
                        //manipulate topic
                        switch (config.topicType) {
                            case "msg":
                                orig.msg.topic = node.topic;
                                break;
                            case "str":
                                orig.msg.topic = config.topic;
                                break;
                        }
                        
                        RED.util.setMessageProperty(orig.msg, config.sendValueTo, orig.msg.ui_popup_time, true);
                        delete orig.msg.ui_popup_time;
                        return orig.msg;
                    }     
                },

                initController: function ($scope, events) {
                    let olddialog = document.querySelectorAll("#ui-popup-dialog_"+id);
                    olddialog.forEach(function(dialog) { dialog.remove(); } );
                    $scope.timepicker = document.createElement("dialog");                   
                    $scope.hh = "00";
                    $scope.mm = "00";
                    setTimeout(function () {
                        //close if click outside
                        let onClick = function(event) {
                            if (event.target === $scope.timepicker) {
                                $scope.timepicker.close();
                            }
                        }
                        let dialog_style = document.querySelector("#ui-popup-dialog-style");
                        let timepicker_style = document.querySelector("#ui-popup-timepicker-style");
                        let timepicker_style_id = document.querySelector("#ui-popup-timepicker-style_"+id);
                        let cardpanel = document.querySelector("#ui-popup-timeselect_" + id);
                        let cardPanelContainer = document.createElement("ui-card-panel");
                        document.head.appendChild(dialog_style);
                        document.head.appendChild(timepicker_style);
                        document.head.appendChild(timepicker_style_id);
                        cardpanel.parentElement.remove();
                        cardPanelContainer.appendChild(cardpanel);
                        cardPanelContainer.classList.add("ui-popup-timepicker");
                        $scope.timepicker.appendChild(cardPanelContainer);
                        $scope.timepicker.setAttribute("id", "ui-popup-dialog_"+id);
                        $scope.timepicker.classList.add("ui-popup-dialog");
                        $scope.timepicker.classList.add("_"+id);
                        $scope.timepicker.addEventListener("click", onClick);
                        document.body.appendChild($scope.timepicker);
                    }, 300);
                    
                    $scope.timeCancel = function () {
                        $scope.timepicker.close();
                    }

                    $scope.timeOk = function () {
                        $scope.timeCancel();
                        $scope.send({ui_popup_time: $scope.hh+":"+$scope.mm});
                    }

                    $scope.hhSet = function(value){
                        let hh = document.getElementById("hhLi_"+id+"_"+parseInt(value).toString());
                        Array.from(hh.parentElement.children).forEach(function(hhSis) {
                            hhSis.classList.remove("selected");
                        });
                        hh.classList.add("selected")
                        hh.scrollIntoView({ block: 'center' });
                        $scope.hh = value;
                    }
                    $scope.hhCur = function(){
                        let hh = document.getElementById("hhLi_"+id+"_"+parseInt($scope.hh).toString());
                        hh.scrollIntoView({ block: 'center' });
                    }

                    $scope.mmSet = function(value){
                        let mm = document.getElementById("mmLi_"+id+"_"+parseInt(value).toString());
                        Array.from(mm.parentElement.children).forEach(function(mmSis) {
                            mmSis.classList.remove("selected");
                        });
                        mm.classList.add("selected")
                        mm.scrollIntoView({ block: 'center' });
                        $scope.mm = value;
                    }
                    $scope.mmCur = function(){
                        let mm = document.getElementById("mmLi_"+id+"_"+parseInt($scope.mm).toString());
                        mm.scrollIntoView({ block: 'center' });
                    }
                    $scope.$watch("msg", function (msg) {
                        if (!msg) { 
                            return;
                        } else {
                            if (msg.hh != undefined && msg.mm != undefined) {
                                $scope.timepicker.close();
                                $scope.timepicker.showModal();
                                $scope.timepicker.style.height = $scope.timepicker.firstElementChild.offsetHeight.toString()+"px";
                                $scope.timepicker.style.width = $scope.timepicker.firstElementChild.offsetWidth.toString()+"px";
                                $scope.hhSet(msg.hh);
                                $scope.mmSet(msg.mm);
                            }
                        };                        
                    });
                },
                
                beforeEmit: function (msg, value) {
                    var newMsg = {};
		            if (msg) {
                        newMsg.socketid = msg.socketid;
                        let payload = "00:00";
                        try { payload = RED.util.getMessageProperty(msg, config.payload); } catch (e) {}
                        if (typeof payload == "string") {
                            let time = payload.split(":");
                            if (time.length > 1){
                                let hh = parseInt(time[0]);
                                let mm = parseInt(time[1]);
                                if (!isNaN(hh) && hh < 24 && hh > -1 && !isNaN(mm) && mm < 60 && mm > -1) {
                                    newMsg.hh = time[0];
                                    newMsg.mm = time[1];
                                }
                            }

                        }
                    }
                    return { msg: newMsg };
                
            }

            });
        }
        catch (e) {
            //console.log(e);
        }
        node.on("close", done);
    }
    RED.nodes.registerType("ui_popup-timepicker",ui_popup_timepicker);
}