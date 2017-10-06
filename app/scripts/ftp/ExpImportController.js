'use strict';
(function () {
    var remote = require('remote');
    var dialog = remote.require('dialog');
    var path = require('path');
    var fs = require('fs');
    angular.module('app')
        .controller('ExpImportController', ['ftpService', "$scope", "$interval", '$mdDialog', '$mdToast', ExportImport]);
    function ExportImport(ftpService, $scope, $interval, $mdDialog, $mdToast) {
        var showSimpleToast = function (msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .position('top right')
                    .hideDelay(3000)
            );
        };
        $scope.exportFunc = function (ev) {
            $mdDialog.show({
                    controller: ExportController,
                    templateUrl: 'partials/export.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: false
                })
                .then(function (msg) {
                    showSimpleToast(msg);
                });
        };
        $scope.importFunc = function (ev) {
            $mdDialog.show({
                    controller: ImportController,
                    templateUrl: 'partials/import.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: false
                })
                .then(function (msg) {
                    showSimpleToast(msg);
                });
        };
        function ExportController($scope, $mdDialog) {
            $scope.ftps = [];//esta variable pertenece a este scope y no al de ftpController, por eso aunq tengan el mismo nombre, no son las mismas
            $scope.selected = [];//ftps seleccionados para exportar
            $scope.fileName = 'ftp-exports';
            ftpService.getAllFtp().then(function (json_data) {
                if (json_data) {
                    $scope.ftps = json_data;
                }
            });
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.toggle = function (ftp, selected) {
                var idx = selected.indexOf(ftp);
                if (idx > -1) selected.splice(idx, 1);
                else selected.push(ftp);
            };
            $scope.doExport = function () {
                var dirWhereExport = dialog.showOpenDialog({properties: ['openDirectory']})[0];
                var file = path.join(dirWhereExport, $scope.fileName);
                //console.log($scope.selected)
                fs.writeFile(file, JSON.stringify($scope.selected), function (err) {
                    var msg = "";
                    if (err) {
                        console.log(err);
                        msg = "Error " + err;
                    } else {
                        msg = "Éxito al exportar los datos.";
                    }
                    $mdDialog.hide(msg);
                });
            };
        }

        function ImportController($scope, $mdDialog) {
            $scope.ftps = [];
            var msg_err = '';
            var importFile = dialog.showOpenDialog({properties: ['openFile']})[0];
            fs.readFile(importFile, function (err, data) {
                if (err) {
                    msg_err = err;
                } else {
                    try {
                        $scope.ftps = JSON.parse(data);
                    } catch (err) {
                        $scope.ftps = [];
                        msg_err = 'Fichero no válido.'
                    }
                }
            });
            $scope.selected = [];
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.toggle = function (ftp, list) {
                var idx = list.indexOf(ftp);
                if (idx > -1) list.splice(idx, 1);
                else list.push(ftp);
            };
            $scope.doImport = function () {
                //todo informarle al ftpController que actualice la lista de servidores
                if (!msg_err) {
                    if ($scope.selected.length > 0) {
                        ftpService.getAllFtp().then(function (json_data) {
                            $scope.selected.forEach(function (ftp) {
                                var idx = json_data.indexOfByProperty(ftp, 'server_name');
                                if (idx > -1)json_data.splice(idx, 1);
                                json_data.push(ftp);
                                ftpService.save(ftp)
                            });
                            $mdDialog.hide("Importados los datos.");
                        });
                    } else {
                        $mdDialog.hide('Ningún dato importado.');
                    }
                } else {
                    $mdDialog.hide(msg_err);
                }
            }
        }

    }
})();
Array.prototype.indexOfByProperty = function (searchElement, property) {
    /*
     * revisa si en dos arrays hay algun objeto con la misma propiedad.
     * [{a:1,b:2},{a:4,b:4}].indexOfByProperty({a:1,b:7}, 'a') --> 0
     * [{a:1,b:2},{a:4,b:4}].indexOfByProperty({a:1,b:7}, 'b') --> -1
     * [{a:1,b:2},{a:4,b:4}].indexOfByProperty({a:4,b:7}, 'a') --> 1
     */
    var index = -1;
    for (var i = 0; i < this.length; i++) {
        if (this[i][property] == searchElement[property]) {
            index = i;
            break
        }
    }
    return index
};