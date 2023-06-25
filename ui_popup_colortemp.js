module.exports = function(RED) {
    var ui = undefined;
    
    var generateHTML = function (node, config) {
        var id = node.id.replace(/[^\w]/g, "");
        var pos = "";
        var HTML = "";
        var unit = "&#176;K";
        if (config.unitKelvin == false) { unit = "&#176;M"}
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
            <style id="ui-popup-colortemp-style_${id}">
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
            <style id="ui-popup-colortemp-style">
                :root {
                    --ui-popup-colortemp-rgb: rgb(0,0,0);
                    --ui-popup-colortemp-filter-bri: 1;
                }
                .ui-popup-colortemp {
                    position: absolute;
                }
                .ui-popup-colortemp .content{
                    width: 650px;
                    display: grid;
                    grid-template-columns: 75px auto 75px;
                }
                .ui-popup-colortemp span{
                    color: var(--nr-dashboard-widgetTextColor);
                }
                .ui-popup-colortemp .ui-popup-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 25px;
                    border-radius: 12px;
                    outline: none;
                    -webkit-transition: .2s;
                    transition: opacity .2s;
                }
                .ui-popup-colortemp .ui-popup-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    border: solid black 2px;
                    background: none;
                    cursor: pointer;
                }
                .ui-popup-colortemp .ui-popup-slider::-moz-range-thumb {
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    border: solid black 2px;
                    background: none;
                    cursor: pointer;
                }
                .ui-popup-colortemp .ui-popup-bri {
                    background: -moz-linear-gradient(right, #000000 0%, var(--ui-popup-colortemp-rgb) 100%);
                    background: -ms-linear-gradient(right, #000000 0%, var(--ui-popup-colortemp-rgb) 100%);
                    background: -o-linear-gradient(right, #000000 0%, var(--ui-popup-colortemp-rgb) 100%);
                    background: -webkit-linear-gradient(left, #000000 0%, var(--ui-popup-colortemp-rgb) 100%);
                    background: linear-gradient(to right, #000000 0%, var(--ui-popup-colortemp-rgb) 100%);
                }
                .ui-popup-colortemp .nr-dashboard-button {
                    margin: 6px;
                }
                .ui-popup-colortemp .md-button{
                    font-size: 1em;
                }
            </style>
            <div id="ui-popup-colortemp_${id}" class="nr-dashboard-cardpanel">
                <p class="nr-dashboard-cardtitle">${config.label}</p>
                <div class="content">
                    <div style="text-align: center;"><span><i class="fa fa-thermometer-half"></i></span></div>
                    <div>
                        <input id="ui_popup_ct_slider_${id}" type="range" min="${config.rangeStart}" max="${config.rangeEnd}" unitkelvin="${config.unitKelvin}" class="ui-popup-ct_${id} ui-popup-slider" ng-value="ct" ng-change="ctSet()" ng-model="ct">
                    </div>
                    <div style="text-align: center;"><span id="ui_pupup_ct_value_${id}" ng-bind-html="ct+'${unit}'"></span></div>
                    <div style="text-align: center;"><span><i class="fa fa-sun-o"></i></span></div>
                    <div>
                        <input id="ui_popup_bri_slider_${id}" type="range" min="0" max="100" class="ui-popup-bri ui-popup-slider" ng-value="bri" ng-change="briSet()" ng-model="bri">
                    </div>
                    <div style="text-align: center;"><span ng-bind-html="bri+'&#037;'"></span></div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
                    <div class="nr-dashboard-button" style="background-color: var(--ui-popup-colortemp-rgb); filter: brightness(var(--ui-popup-colortemp-filter-bri)); -webkit-filter: brightness(var(--ui-popup-colortemp-filter-bri));">
                        <span style="color: black;" ng-bind-html="tempVal"></span>
                    </div>
                    <div class="nr-dashboard-button">
                        <button class="md-button md-raised" ng-click="ctCancel()"><span>${config.labelCancelButton}</span></button>
                    </div>
                    <div class="nr-dashboard-button">
                        <button class="md-button md-raised" ng-click="ctOk()"><span>${config.labelOkButton}</span></button>
                    </div>
                </div>
            </div>`;
        return HTML;
    }
    
    function ui_popup_colortemp(config) {
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
                        
                        RED.util.setMessageProperty(orig.msg, config.sendValueTo, orig.msg.ui_popup_ct, true);
                        delete orig.msg.ui_popup_ct;
                        return orig.msg;
                    }     
                },

                initController: function ($scope, events) {
                    let olddialog = document.querySelectorAll("#ui-popup-dialog_"+id);
                    olddialog.forEach(function(dialog) { dialog.remove(); } );
                    $scope.CTtoRGB = function(tmpKelvin) {
                        const clamp = (num, min, max) => num < min ? min : num > max ? max : num;
                        // All calculations require tmpKelvin \ 100, so only do the conversion once
                        tmpKelvin = clamp(tmpKelvin, 1000, 40000) / 100;
                    
                        // Note: The R-squared values for each approximation follow each calculation
                        
                            let r = tmpKelvin <= 66 ? 255 :
                                clamp(329.698727446 * (Math.pow(tmpKelvin - 60, -0.1332047592)), 0, 255);  // .988
                            
                            let g = tmpKelvin <= 66 ?
                                clamp(99.4708025861 * Math.log(tmpKelvin) - 161.1195681661, 0, 255) :      // .996
                                clamp(288.1221695283 * (Math.pow(tmpKelvin - 60, -0.0755148492)), 0, 255); // .987
                            
                            let b = tmpKelvin >= 66 ? 255 : 
                                tmpKelvin <= 19 ? 0 :
                                clamp(138.5177312231 * Math.log(tmpKelvin - 10) - 305.0447927307, 0, 255);  // .998
                        return Math.round(r).toString()+","+Math.round(g).toString()+","+Math.round(b).toString();
                    }
                    $scope.MiredsToKelvin = function(tmp) {
                        return Math.round(Math.pow(10,6)/tmp);
                    }
                    let ctSlider = document.querySelector("#ui_popup_ct_slider_" + id);
                    let ctMin = parseInt(ctSlider.getAttribute("min"));
                    let ctMax = parseInt(ctSlider.getAttribute("max"));
                    $scope.ctUnitKelvin = ctSlider.getAttribute("unitkelvin");
                    let ctStep = (ctMax-ctMin)/10;
                    let ctStart = ctMin;
                    let ctString = "";
                    if ($scope.ctUnitKelvin == "false") {
                        ctStep = ($scope.MiredsToKelvin(ctMax)-$scope.MiredsToKelvin(ctMin))/10;
                        ctStart = $scope.MiredsToKelvin(ctMin);
                    }
                    for (let i=0; i<=100; i+=10) {
                        ctString +=", rgb(" +$scope.CTtoRGB(ctStart)+ ") "+i.toString()+"%";
                        ctStart+=ctStep;
                    }
                    
                    ctSlider.style.cssText = String.raw`
                        background: -moz-linear-gradient(right${ctString});
                        background: -ms-linear-gradient(right${ctString});
                        background: -o-linear-gradient(right${ctString});
                        background: -webkit-linear-gradient(left${ctString});
                        background: linear-gradient(to right${ctString});`;
                    
                    $scope.root = document.documentElement;
                    $scope.colortemp = document.createElement("dialog");
                    $scope.ct = 0;
                    $scope.bri = 100;
                    setTimeout(function () {
                        //close if click outside
                        let onClick = function(event) {
                            if (event.target === $scope.colortemp) {
                                $scope.colortemp.close();
                            }
                        }
                        let dialog_style = document.querySelector("#ui-popup-dialog-style");
                        let colortemp_style = document.querySelector("#ui-popup-colortemp-style");
                        let colortemp_style_id = document.querySelector("#ui-popup-colortemp-style_"+id);
                        let cardpanel = document.querySelector("#ui-popup-colortemp_" + id);
                        let cardPanelContainer = document.createElement("ui-card-panel");
                        document.head.appendChild(dialog_style);
                        document.head.appendChild(colortemp_style);
                        document.head.appendChild(colortemp_style_id);
                        cardpanel.parentElement.remove();
                        cardPanelContainer.appendChild(cardpanel);
                        cardPanelContainer.classList.add("ui-popup-colortemp");
                        $scope.colortemp.appendChild(cardPanelContainer);
                        $scope.colortemp.setAttribute("id", "ui-popup-dialog_"+id);
                        $scope.colortemp.classList.add("ui-popup-dialog");
                        $scope.colortemp.classList.add("_"+id);
                        $scope.colortemp.addEventListener("click", onClick);
                        document.body.appendChild($scope.colortemp);
                    }, 300);
                    
                    $scope.ctCancel = function () {
                        $scope.colortemp.close();
                    }

                    $scope.ctOk = function () {
                        $scope.ctCancel();
                        $scope.send({ui_popup_ct: $scope.ct.toString()+","+$scope.bri.toString()});
                    }
                    $scope.briSet = function() {
                        $scope.root.style.setProperty("--ui-popup-colortemp-filter-bri", $scope.bri / 100);
                    }
                    
                    $scope.ctSet = function() {
                        let ct = $scope.ct;
                        if ($scope.ctUnitKelvin == "false") {
                            ct = $scope.MiredsToKelvin($scope.ct);
                        }
                        $scope.root.style.setProperty("--ui-popup-colortemp-rgb", "rgb("+$scope.CTtoRGB(ct)+")");
                        $scope.tempVal = $scope.MiredsToKelvin(ct).toString()+"&#176;M / "+ct.toString()+"&#176;K";;
                    }

                    $scope.$watch("msg", function (msg) {
                        if (!msg) { 
                            return;
                        } else {
                            if (msg.ct!= undefined && msg.bri != undefined) {
                                $scope.colortemp.close();
                                $scope.colortemp.showModal();
                                $scope.colortemp.style.height = $scope.colortemp.firstElementChild.offsetHeight.toString()+"px";
                                $scope.colortemp.style.width = $scope.colortemp.firstElementChild.offsetWidth.toString()+"px";
                                $scope.ct = msg.ct;
                                $scope.bri = msg.bri;
                                $scope.ctSet();
                                $scope.briSet();
                            }
                        };                        
                    });
                },
                
                beforeEmit: function (msg, value) {
                    var newMsg = {};
		            if (msg) {
                        newMsg.socketid = msg.socketid;
                        let payload = "0,100";
                        try {payload = RED.util.getMessageProperty(msg, config.payload); } catch (e) {}
                        if (typeof payload == "string") {
                            let hsb = payload.split(",");
                            if (hsb.length = 3){
                                newMsg.ct = hsb[0];
                                newMsg.bri = hsb[1];
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
    RED.nodes.registerType("ui_popup-colortemp",ui_popup_colortemp);
}