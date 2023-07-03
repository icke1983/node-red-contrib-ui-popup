module.exports = function(RED) {
    var ui = undefined;
    
    var generateHTML = function (node, config) {
        
        var id = node.id.replace(/[^\w]/g, "");
        var pos = "";
        var msgPosX = "";
        var msgPosY = "";
        var li = "";
        config.options.forEach(function(item, index) {
            li += String.raw`<li ng-click="sendPayload(${index})"><span class="ui-popup-dropdown-icon">`;
            if (item.icon != "") { li += String.raw`<ui-icon icon="${item.icon}"></ui-icon>`; }
            li += String.raw`</span><span class="ui-popup-dropdown-label">${item.label}</span></li>`;
        });
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
            case "man":
                let posX;
                let posY;
                if (config.posXType == "num") {
                    posX = config.posX;
                } else{
                    posX = "0";
                    msgPosX = String.raw` msgposx="${config.posX}"`;
                }
                if (config.posYType == "num") {
                    posY = config.posY;
                } else {
                    posY = "0";
                    msgPosY = String.raw` msgposy="${config.posY}"`;
                }
                pos = "top: "+posY+"px; left: "+posX+"px; margin-top: 0px; margin-left: 0px;";
                break;
        } 
        HTML += String.raw`
            <style id="ui-popup-dropdown-style_${id}">
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
            <style id="ui-popup-dropdown-style">
                .ui-popup-dropdown {
                    position: absolute;
                }
                .ui-popup-dropdown .content{
                    width: auto;
                }
                .ui-popup-dropdown .content *{
                    box-sizing: border-box;
                }
                .ui-popup-dropdown ul {
                    list-style-type: none;
                    margin: 0px;
                    padding: 0px;
                }
                .ui-popup-dropdown li{
                    display: flex;
                    padding: 5px;
                    color: var(--nr-dashboard-widgetTextColor);
                }
                .ui-popup-dropdown li:hover{
                    background-color: var(--nr-dashboard-widgetColor);
                    cursor: pointer;
                }
                .ui-popup-dropdown .ui-popup-dropdown-icon {
                    display: inline-block;
                    text-align: center;
                    margin-right: 5px;
                    padding-right: 5px;
                    width: 1.5em;
                }
            </style>
            <div id="ui-popup-dropdown_${id}" class="nr-dashboard-cardpanel ${config.class}"${msgPosX}${msgPosY}>
                <div class="content">
                    <ul>
                        ${li}
                    </ul>
                </div>
            </div>`;
        return HTML;
    }
    
    function ui_popup_dropdown(config) {
        try {
            RED.nodes.createNode(this,config);
            var node = this;
            
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            
            node.on('input', function(msg) {
                node.msg = msg;
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
                        let index = orig.msg.ui_popup_dropdown_item
                        let newPayload;
                        //manipulate topic
                        switch (config.options[index].topicType) {
                            case "msg":
                                orig.msg.topic = ""
                                try { orig.msg.topic = RED.util.getMessageProperty(node.msg, config.options[index].topic); } catch (e) {}
                                break;
                            case "str":
                                orig.msg.topic = config.options[index].topic;
                                break;
                        }
                        switch (config.options[index].payloadType) {
                            case "msg":
                                newPayload = "";
                                try { newPayload = RED.util.getMessageProperty(node.msg, config.options[index].payload); } catch (e) {}
                                break;
                            case "str":
                                newPayload = config.options[index].payload;
                                break;
                            case "num":
                                newPayload = parseFloat(config.options[index].payload);
                                break;
                            case "bool":
                                newPayload = Boolean(config.options[index].payload);
                                break;
                        }
                        RED.util.setMessageProperty(orig.msg, config.sendValueTo, newPayload, true);
                        
                        delete orig.msg.ui_popup_dropdown_item;
                        return orig.msg;
                    }     
                },

                initController: function ($scope, events) {
                    let olddialog = document.querySelectorAll("#ui-popup-dialog_"+id);
                    olddialog.forEach(function(dialog) { dialog.remove(); } );
                    $scope.dropdown = document.createElement("dialog");
                    $scope.msgPosX = null;
                    $scope.msgPosY = null;
                    setTimeout(function () {
                        //close if click outside
                        let onClick = function(event) {
                            if (event.target === $scope.dropdown) {
                                $scope.dropdown.close();
                            }
                        }
                        let dialog_style = document.querySelector("#ui-popup-dialog-style");
                        let dropdown_style = document.querySelector("#ui-popup-dropdown-style");
                        let dropdown_style_id = document.querySelector("#ui-popup-dropdown-style_"+id);
                        let cardpanel = document.querySelector("#ui-popup-dropdown_" + id);
                        let cardPanelContainer = document.createElement("ui-card-panel");
                        $scope.msgPosX = cardpanel.getAttribute("msgposx");
                        $scope.msgPosY = cardpanel.getAttribute("msgposy");
                        document.head.appendChild(dialog_style);
                        document.head.appendChild(dropdown_style);
                        document.head.appendChild(dropdown_style_id);
                        cardpanel.parentElement.remove();
                        cardPanelContainer.appendChild(cardpanel);
                        cardPanelContainer.classList.add("ui-popup-dropdown");
                        $scope.dropdown.setAttribute("id", "ui-popup-dialog_"+id);
                        $scope.dropdown.appendChild(cardPanelContainer);
                        $scope.dropdown.classList.add("ui-popup-dialog");
                        $scope.dropdown.classList.add("_"+id);
                        $scope.dropdown.addEventListener("click", onClick);
                        document.body.appendChild($scope.dropdown);
                        
                    }, 300);
                    
                    $scope.sendPayload = function (value) {
                        $scope.dropdown.close();
                        $scope.send({ui_popup_dropdown_item: value})
                    }

                    $scope.$watch("msg", function (msg) {
                        if (!msg) { 
                            return;
                        } else {
                            
                            $scope.dropdown.close();
                            $scope.dropdown.showModal();
                            $scope.dropdown.style.height = $scope.dropdown.firstElementChild.offsetHeight.toString()+"px";
                            $scope.dropdown.style.width = $scope.dropdown.firstElementChild.offsetWidth.toString()+"px";
                            if ($scope.msgPosX != null) {
                                if(parseInt(msg.ui_popup_dropdown_posX) + $scope.dropdown.offsetWidth >= window.innerWidth) {
                                    $scope.dropdown.style.left = (window.innerWidth - $scope.dropdown.offsetWidth).toString()+"px";
                                } else {
                                    $scope.dropdown.style.left = msg.ui_popup_dropdown_posX+"px";
                                }
                            }
                            if ($scope.msgPosY != null) {
                                if(parseInt(msg.ui_popup_dropdown_posy) + $scope.dropdown.offsetHeight >= window.innerHeight) {
                                    $scope.dropdown.style.top = (window.innerHeight - $scope.dropdown.offsetHeight).toString()+"px";
                                } else {
                                    $scope.dropdown.style.top = msg.ui_popup_dropdown_posY+"px";
                                }
                            }
                            $scope.payload = msg.payload;
                            
                        };                        
                    });
                },
                
                beforeEmit: function (msg, value) {
                    var newMsg = {};
		            if (msg) {
                        newMsg = msg;
                        newMsg.ui_popup_dropdown_posX = "0";
                        newMsg.ui_popup_dropdown_posY = "0"
                        try { newMsg.ui_popup_dropdown_posX = RED.util.getMessageProperty(msg, config.posX).toString(); } catch (e) {}
                        try { newMsg.ui_popup_dropdown_posY = RED.util.getMessageProperty(msg, config.posY).toString(); } catch (e) {}
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
    RED.nodes.registerType("ui_popup-dropdown",ui_popup_dropdown);
}