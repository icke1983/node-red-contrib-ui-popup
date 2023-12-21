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
            <style id="ui-popup-iframe-style_${id}">
                .ui-popup-dialog._${id} {
                    ${pos}
                    width: ${config.documentWidth};
                    height: ${config.documentHeight};
                    overflow: hidden
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
            <style id="ui-popup-iframe-style">
                .ui-popup-iframe {
                    position: absolute;
                    width: calc(100% - 2px);
                    height: calc(100% - 2px);
                }
                .ui-popup-iframe .nr-dashboard-cardpanel {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-flow: column;
                }

                .ui-popup-iframe .nr-dashboard-cardtitle {
                    flex: 0 1 auto;
                }

                .ui-popup-iframe .content{
                    flex: 1 1 auto;
                }
                .ui-popup-iframe iframe{
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .ui-popup-iframe .closeButton{
                    position: absolute;
                    right: 12px;
                    top: 10px;
                }
                .ui-popup-iframe .closeButton span{
                    font-size: x-large;
                }
                .ui-popup-iframe span{
                    color: var(--nr-dashboard-widgetTextColor);
                }
            </style>
            <div id="ui-popup-iframe_${id}" class="nr-dashboard-cardpanel ${config.class}">
                <p class="nr-dashboard-cardtitle">${config.label}</p>
                <div class="content" framesrc="${config.url}">
                    <iframe loading="lazy"><p>Ihr Browser kann leider keine eingebetteten Frames anzeigen. Sie können die eingebettete Seite <a href="${config.url}">hier</a> aufrufen!</iframe>
                    </p>
                </div>
                <div class="closeButton" ng-click="dialogClose()"><span><i class="fa fa-window-close-o"></i></span></div>
            </div>`;
        return HTML;
    }
    
    function ui_popup_iframe(config) {
        try {
            RED.nodes.createNode(this,config);
            var node = this;
            
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            
            node.on('input', function(msg) {
                                
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
                       
                },

                initController: function ($scope, events) {
                    let olddialog = document.querySelectorAll("#ui-popup-dialog_"+id);
                    olddialog.forEach(function(dialog) { dialog.remove(); } );
                    $scope.iframe = document.createElement("dialog");                   
                    setTimeout(function () {
                        //close if click outside
                        let onClick = function(event) {
                            if (event.target === $scope.iframe) {
                                $scope.dialogClose();
                            }
                        }
                        let dialog_style = document.querySelector("#ui-popup-dialog-style");
                        let iframe_style = document.querySelector("#ui-popup-iframe-style");
                        let iframe_style_id = document.querySelector("#ui-popup-iframe-style_"+id);
                        let cardpanel = document.querySelector("#ui-popup-iframe_" + id);
                        let cardPanelContainer = document.createElement("ui-card-panel");
                        document.head.appendChild(dialog_style);
                        document.head.appendChild(iframe_style);
                        document.head.appendChild(iframe_style_id);
                        cardpanel.parentElement.remove();
                        cardPanelContainer.appendChild(cardpanel);
                        cardPanelContainer.classList.add("ui-popup-iframe");
                        $scope.iframe.appendChild(cardPanelContainer);
                        $scope.iframe.setAttribute("id", "ui-popup-dialog_"+id);
                        $scope.iframe.classList.add("ui-popup-dialog");
                        $scope.iframe.classList.add("_"+id);
                        $scope.iframe.addEventListener("click", onClick);
                        document.body.appendChild($scope.iframe);
                    }, 300);
                    
                    $scope.dialogClose = function () {
                        $scope.iframe.close();
                        document.querySelector("#ui-popup-dialog_"+id+" iframe").removeAttribute("src");
                    }

                    $scope.$watch("msg", function (msg) {
                        if (!msg) { 
                            return;
                        } else {
                            switch (msg.payload) {
                                case "show": 
                                    $scope.iframe.close();
                                    $scope.iframe.showModal();
                                    document.querySelector("#ui-popup-dialog_"+id+" iframe").setAttribute("src", document.querySelector("#ui-popup-dialog_"+id+" .content").getAttribute("framesrc"))
                                    break;
                                case "hide":
                                    $scope.dialogClose();
                            }
                        };                        
                    });
                },
                
                beforeEmit: function (msg, value) {
                    var newMsg = {};
		            if (msg) {
                        newMsg.socketid = msg.socketid;
                        newMsg.payload = msg.payload;
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
    RED.nodes.registerType("ui_popup-iframe",ui_popup_iframe);
}