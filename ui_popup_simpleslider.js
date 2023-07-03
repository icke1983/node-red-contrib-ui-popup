module.exports = function(RED) {
    var ui = undefined;
    
    var generateHTML = function (node, config) {
        var id = node.id.replace(/[^\w]/g, "");
        var pos = "";
        var HTML = "";
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
            <style id="ui-popup-simpleslider-style_${id}">
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
            <style id="ui-popup-simpleslider-style">
                .ui-popup-simpleslider {
                    position: absolute;//z-index: 99999;
                }
                .ui-popup-simpleslider .content{
                    width: 650px;
                    display: grid;
                    grid-template-columns: 75px auto 75px;
                }
                .ui-popup-simpleslider span{
                    color: var(--nr-dashboard-widgetTextColor);
                }
                .ui-popup-simpleslider .ui-popup-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 25px;
                    border-radius: 12px;
                    outline: none;
                    -webkit-transition: .2s;
                    transition: opacity .2s;
                    background: -moz-linear-gradient(right, ${config.colorStart} 0%, ${config.colorEnd} 100%);
                    background: -ms-linear-gradient(right, ${config.colorStart} 0%, ${config.colorEnd} 100%);
                    background: -o-linear-gradient(right, ${config.colorStart} 0%, ${config.colorEnd} 100%);
                    background: -webkit-linear-gradient(left, ${config.colorStart} 0%, ${config.colorEnd} 100%);
                    background: linear-gradient(to right, ${config.colorStart} 0%, ${config.colorEnd} 100%);
                }
                .ui-popup-simpleslider .ui-popup-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    border: solid black 2px;
                    background: none;
                    cursor: pointer;
                }
                .ui-popup-simpleslider .ui-popup-slider::-moz-range-thumb {
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    border: solid black 2px;
                    background: none;
                    cursor: pointer;
                }
                .ui-popup-simpleslider .nr-dashboard-button {
                    margin: 6px;
                }
                .ui-popup-simpleslider .md-button{
                    font-size: 1em;
                }
            </style>
            <div id="ui-popup-simpleslider_${id}" class="nr-dashboard-cardpanel ${config.class}">
                <p class="nr-dashboard-cardtitle">${config.label}</p>
                <div class="content">
                    <div style="text-align: center;"><span>${config.sndLabel}</span></div>
                    <div>
                        <input type="range" min="${config.rangeStart}" max="${config.rangeEnd}" step="${config.rangeStep}" class="ui-popup-slider" ng-value="val" ng-model="val">
                    </div>
                    <div style="text-align: center;"><span ng-bind-html="val+'${config.unit}'"></span></div>
                 </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
                    <div class="nr-dashboard-button">
                        <span></span>
                    </div>
                    <div class="nr-dashboard-button">
                        <button class="md-button md-raised" ng-click="sliderCancel()"><span>${config.labelCancelButton}</span></button>
                    </div>
                    <div class="nr-dashboard-button">
                        <button class="md-button md-raised" ng-click="sliderOk()"><span>${config.labelOkButton}</span></button>
                    </div>
                </div>
            </div>`;
        return HTML;
    }
    
    function ui_popup_simpleslider(config) {
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
                        
                        try { RED.util.setMessageProperty(orig.msg, config.sendValueTo, orig.msg.ui_popup_val, true); } catch (e) {}
                        delete orig.msg.ui_popup_val;
                        return orig.msg;
                    }     
                },

                initController: function ($scope, events) {
                    let olddialog = document.querySelectorAll("#ui-popup-dialog_"+id);
                    olddialog.forEach(function(dialog) { dialog.remove(); } );
                    $scope.simpleslider = document.createElement("dialog");                   
                    $scope.val = 0;
                    setTimeout(function () {
                        //close if click outside
                        let onClick = function(event) {
                            if (event.target === $scope.simpleslider) {
                                $scope.simpleslider.close();
                            }
                        }
                        let dialog_style = document.querySelector("#ui-popup-dialog-style");
                        let simpleslider_style = document.querySelector("#ui-popup-simpleslider-style");
                        let simpleslider_style_id = document.querySelector("#ui-popup-simpleslider-style_"+id);
                        let cardpanel = document.querySelector("#ui-popup-simpleslider_" + id);
                        let cardPanelContainer = document.createElement("ui-card-panel");
                        document.head.appendChild(dialog_style);
                        document.head.appendChild(simpleslider_style);
                        document.head.appendChild(simpleslider_style_id);
                        cardpanel.parentElement.remove();
                        cardPanelContainer.appendChild(cardpanel);
                        cardPanelContainer.classList.add("ui-popup-simpleslider");
                        $scope.simpleslider.appendChild(cardPanelContainer);
                        $scope.simpleslider.setAttribute("id", "ui-popup-dialog_"+id);
                        $scope.simpleslider.classList.add("ui-popup-dialog");
                        $scope.simpleslider.classList.add("_"+id);
                        $scope.simpleslider.addEventListener("click", onClick);
                        document.body.appendChild($scope.simpleslider);
                    }, 300);
                    
                    $scope.sliderCancel = function () {
                        $scope.simpleslider.close();
                    }

                    $scope.sliderOk = function () {
                        $scope.sliderCancel();
                        $scope.send({ui_popup_val: $scope.val});
                    }
                   
                    $scope.$watch("msg", function (msg) {
                        if (!msg) { 
                            return;
                        } else {
                            if (msg.val != undefined) {
                                $scope.simpleslider.close();
                                $scope.simpleslider.showModal();
                                $scope.simpleslider.style.height = $scope.simpleslider.firstElementChild.offsetHeight.toString()+"px";
                                $scope.simpleslider.style.width = $scope.simpleslider.firstElementChild.offsetWidth.toString()+"px";
                                $scope.val = msg.val;
                            }
                        };                        
                    });
                },
                
                beforeEmit: function (msg, value) {
                    var newMsg = {};
		            if (msg) {
                        newMsg.socketid = msg.socketid;
                        newMsg.val = "0";
                        try { newMsg.val = RED.util.getMessageProperty(msg, config.payload); } catch (e) {}
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
    RED.nodes.registerType("ui_popup-simpleslider",ui_popup_simpleslider);
}