module.exports = function(RED) {
    var ui = undefined;
    
    var generateHTML = function (node, config) {
        var id = node.id.replace(/[^\w]/g, "");
        var pos = "";var HTML = "";
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
            <style id="ui-popup-colorpicker-style_${id}">
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
            <style id="ui-popup-colorpicker-style">
                :root {
                    --ui-popup-colorpicker-hue: 0;
                    --ui-popup-colorpicker-sat: 100%;
                    --ui-popup-colorpicker-bri: 50%;
                    --ui-popup-colorpicker-filter-bri: 1;
                }
                .ui-popup-colorpicker {
                    position: absolute;
                }
                .ui-popup-colorpicker .ui-popup-slider::-moz-range-thumb {
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    border: solid black 2px;
                    background: none;
                    cursor: pointer;
                }
                .ui-popup-colorpicker .content{
                    width: 650px;
                    display: grid;
                    grid-template-columns: 75px auto 75px;
                }
                .ui-popup-colorpicker span{
                    color: var(--nr-dashboard-widgetTextColor);
                }
                .ui-popup-colorpicker .ui-popup-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 25px;
                    border-radius: 12px;
                    outline: none;
                    -webkit-transition: .2s;
                    transition: opacity .2s;
                }
                .ui-popup-colorpicker .ui-popup-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    border: solid black 2px;
                    background: none;
                    cursor: pointer;
                }
                .ui-popup-colorpicker .ui-popup-hue {
                    background: -moz-linear-gradient(right, hsl(0,100%,var(--ui-popup-colorpicker-bri)) 0%, hsl(60,100%,var(--ui-popup-colorpicker-bri)) 17%, hsl(120,100%,var(--ui-popup-colorpicker-bri)) 33%, hsl(180,100%,var(--ui-popup-colorpicker-bri)) 50%, hsl(240,100%,var(--ui-popup-colorpicker-bri)) 67%, hsl(300,100%,var(--ui-popup-colorpicker-bri)) 83%, hsl(360,100%,var(--ui-popup-colorpicker-bri)) 100%);
                    background: -ms-linear-gradient(right, hsl(0,100%,var(--ui-popup-colorpicker-bri)) 0%, hsl(60,100%,var(--ui-popup-colorpicker-bri)) 17%, hsl(120,100%,var(--ui-popup-colorpicker-bri)) 33%, hsl(180,100%,var(--ui-popup-colorpicker-bri)) 50%, hsl(240,100%,var(--ui-popup-colorpicker-bri)) 67%, hsl(300,100%,var(--ui-popup-colorpicker-bri)) 83%, hsl(360,100%,var(--ui-popup-colorpicker-bri)) 100%);
                    background: -o-linear-gradient(right, hsl(0,100%,var(--ui-popup-colorpicker-bri)) 0%, hsl(60,100%,var(--ui-popup-colorpicker-bri)) 17%, hsl(120,100%,var(--ui-popup-colorpicker-bri)) 33%, hsl(180,100%,var(--ui-popup-colorpicker-bri)) 50%, hsl(240,100%,var(--ui-popup-colorpicker-bri)) 67%, hsl(300,100%,var(--ui-popup-colorpicker-bri)) 83%, hsl(360,100%,var(--ui-popup-colorpicker-bri)) 100%);
                    background: -webkit-linear-gradient(left, hsl(0,100%,var(--ui-popup-colorpicker-bri)) 0%, hsl(60,100%,var(--ui-popup-colorpicker-bri)) 17%, hsl(120,100%,var(--ui-popup-colorpicker-bri)) 33%, hsl(180,100%,var(--ui-popup-colorpicker-bri)) 50%, hsl(240,100%,var(--ui-popup-colorpicker-bri)) 67%, hsl(300,100%,var(--ui-popup-colorpicker-bri)) 83%, hsl(360,100%,var(--ui-popup-colorpicker-bri)) 100%);
                    background: linear-gradient(to right, hsl(0,100%,var(--ui-popup-colorpicker-bri)) 0%, hsl(60,100%,var(--ui-popup-colorpicker-bri)) 17%, hsl(120,100%,var(--ui-popup-colorpicker-bri)) 33%, hsl(180,100%,var(--ui-popup-colorpicker-bri)) 50%, hsl(240,100%,var(--ui-popup-colorpicker-bri)) 67%, hsl(300,100%,var(--ui-popup-colorpicker-bri)) 83%, hsl(360,100%,var(--ui-popup-colorpicker-bri)) 100%);
                }
                .ui-popup-colorpicker .ui-popup-sat {
                    background: -moz-linear-gradient(right, #ffffff 0%, hsl(var(--ui-popup-colorpicker-hue),100%,50%) 100%);
                    background: -ms-linear-gradient(right, #ffffff 0%, hsl(var(--ui-popup-colorpicker-hue),100%,50%) 100%);
                    background: -o-linear-gradient(right, #ffffff 0%, hsl(var(--ui-popup-colorpicker-hue),100%,50%) 100%);
                    background: -webkit-gradient(linear, left top, right top, from(#ffffff), to(hsl(var(--ui-popup-colorpicker-hue),100%,50%)));
                    background: -webkit-linear-gradient(left, #ffffff 0%, hsl(var(--ui-popup-colorpicker-hue),100%,50%) 100%);
                    background: linear-gradient(to right, #ffffff 0%, hsl(var(--ui-popup-colorpicker-hue),100%,50%) 100%);
                }
                .ui-popup-colorpicker .ui-popup-bri {
                    background: -moz-linear-gradient(right, #000000 0%, hsl(var(--ui-popup-colorpicker-hue),100%,var(--ui-popup-colorpicker-bri)) 100%);
                    background: -ms-linear-gradient(right, #000000 0%, hsl(var(--ui-popup-colorpicker-hue),100%,var(--ui-popup-colorpicker-bri)) 100%);
                    background: -o-linear-gradient(right, #000000 0%, hsl(var(--ui-popup-colorpicker-heu),100%,var(--ui-popup-colorpicker-bri)) 100%);
                    background: -webkit-linear-gradient(left, #000000 0%, hsl(var(--ui-popup-colorpicker-hue),100%,var(--ui-popup-colorpicker-bri)) 100%);
                    background: linear-gradient(to right, #000000 0%, hsl(var(--ui-popup-colorpicker-hue),100%,var(--ui-popup-colorpicker-bri)) 100%);
                }
                .ui-popup-colorpicker .nr-dashboard-button {
                    margin: 6px;
                }
                
                .ui-popup-colorpicker .md-button{
                    font-size: 1em;
                }
            </style>
            <div id="ui-popup-colorpicker_${id}" class="nr-dashboard-cardpanel ${config.class}">
                <p class="nr-dashboard-cardtitle">${config.label}</p>
                <div class="content">
                    <div style="text-align: center;"><span><span><i class="fa fa-tint"></i></span></div>
                    <div>
                        <input type="range" min="0" max="360" class="ui-popup-hue ui-popup-slider" ng-value="hue" ng-change="hueSet()" ng-model="hue">
                    </div>
                    <div style="text-align: center;"><span ng-bind-html="hue+'&#176;'"></span></div>
                    <div style="text-align: center;"><span><span><i class="fa fa-adjust"></i></span></div>
                    <div>
                        <input type="range" min="0" max="100" class="ui-popup-sat ui-popup-slider" ng-value="sat" ng-change="satSet()" ng-model="sat">
                    </div>
                    <div style="text-align: center;"><span ng-bind-html="sat+'&#037;'"></span></div>
                    <div style="text-align: center;"><span><span><i class="fa fa-sun-o"></i></span></div>
                    <div>
                        <input type="range" min="0" max="100" class="ui-popup-bri ui-popup-slider" ng-value="bri" ng-change="briSet()" ng-model="bri">
                    </div>
                    <div style="text-align: center;"><span ng-bind-html="bri+'&#037;'"></span></div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
                    <div class="nr-dashboard-button" style="background-color: hsl(var(--ui-popup-colorpicker-hue), 100%, var(--ui-popup-colorpicker-bri)); filter: brightness(var(--ui-popup-colorpicker-filter-bri)); -webkit-filter: brightness(var(--ui-popup-colorpicker-filter-bri));">
                        
                    </div>
                    <div class="nr-dashboard-button">
                        <button class="md-button md-raised" ng-click="colorCancel()"><span>${config.labelCancelButton}</span></button>
                    </div>
                    <div class="nr-dashboard-button">
                        <button class="md-button md-raised" ng-click="colorOk()"><span>${config.labelOkButton}</span></button>
                    </div>
                </div>
            </div>`;
        return HTML;
    }
    
    function ui_popup_colorpicker(config) {
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
                        
                        RED.util.setMessageProperty(orig.msg, config.sendValueTo, orig.msg.ui_popup_color, true);
                        delete orig.msg.ui_popup_color;
                        return orig.msg;
                    }     
                },

                initController: function ($scope, events) {
                    let olddialog = document.querySelectorAll("#ui-popup-dialog_"+id);
                    olddialog.forEach(function(dialog) { dialog.remove(); } );
                    $scope.root = document.documentElement;
                    $scope.colorpicker = document.createElement("dialog");                   
                    $scope.hue = 0;
                    $scope.sat = 100;
                    $scope.bri = 100;
                    setTimeout(function () {
                        //close if click outside
                        let onClick = function(event) {
                            if (event.target === $scope.colorpicker) {
                                $scope.colorpicker.close();
                            }
                        }
                        let dialog_style = document.querySelector("#ui-popup-dialog-style");
                        let colorpicker_style = document.querySelector("#ui-popup-colorpicker-style");
                        let colorpicker_style_id = document.querySelector("#ui-popup-colorpicker-style_"+id);
                        let cardpanel = document.querySelector("#ui-popup-colorpicker_" + id);
                        let cardPanelContainer = document.createElement("ui-card-panel");
                        document.head.appendChild(dialog_style);
                        document.head.appendChild(colorpicker_style);
                        document.head.appendChild(colorpicker_style_id);
                        cardpanel.parentElement.remove();
                        cardPanelContainer.appendChild(cardpanel);
                        cardPanelContainer.classList.add("ui-popup-colorpicker");
                        $scope.colorpicker.appendChild(cardPanelContainer);
                        $scope.colorpicker.setAttribute("id", "ui-popup-dialog_"+id);
                        $scope.colorpicker.classList.add("ui-popup-dialog");
                        $scope.colorpicker.classList.add("_"+id);
                        $scope.colorpicker.addEventListener("click", onClick);
                        document.body.appendChild($scope.colorpicker);
                    }, 300);
                    
                    $scope.colorCancel = function () {
                        $scope.colorpicker.close();
                    }

                    $scope.colorOk = function () {
                        $scope.colorCancel();
                        $scope.send({ui_popup_color: $scope.hue.toString()+","+$scope.sat.toString()+","+$scope.bri.toString()});
                    }
                    $scope.briSet = function() {
                        $scope.root.style.setProperty("--ui-popup-colorpicker-filter-bri", $scope.bri / 100);
                    }
                    $scope.satSet = function() {
                        let bri = 50 + (50 - ($scope.sat / 2));
                        $scope.root.style.setProperty("--ui-popup-colorpicker-bri", bri+"%");
                    }
                    $scope.hueSet = function() {
                        $scope.root.style.setProperty("--ui-popup-colorpicker-hue", $scope.hue);
                    }

                    $scope.$watch("msg", function (msg) {
                        if (!msg) { 
                            return;
                        } else {
                            if (msg.hue != undefined && msg.sat != undefined && msg.bri != undefined) {
                                 $scope.colorpicker.close();
                                $scope.colorpicker.showModal();
                                $scope.colorpicker.style.height = $scope.colorpicker.firstElementChild.offsetHeight.toString()+"px";
                                $scope.colorpicker.style.width = $scope.colorpicker.firstElementChild.offsetWidth.toString()+"px";
                                $scope.hue = msg.hue;
                                $scope.sat = msg.sat;
                                $scope.bri = msg.bri;
                                $scope.hueSet();
                                $scope.satSet();
                            }
                        };                        
                    });
                },
                
                beforeEmit: function (msg, value) {
                    var newMsg = {};
		            if (msg) {
                        newMsg.socketid = msg.socketid;
                        let payload = "0,100,100";
                        try { payload = RED.util.getMessageProperty(msg, config.payload); } catch (e) {}
                        if (typeof payload == "string") {
                            let hsb = payload.split(",");
                            if (hsb.length = 3){
                                newMsg.hue = hsb[0];
                                newMsg.sat = hsb[1];
                                newMsg.bri = hsb[2];
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
    RED.nodes.registerType("ui_popup-colorpicker",ui_popup_colorpicker);
}