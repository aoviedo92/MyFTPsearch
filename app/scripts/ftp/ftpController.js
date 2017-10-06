(function () {
    'use strict';
    var Client = require('ftp');
    var util = require('util');
    var fs = require('fs');
    var slugify = require('slugify');
    angular.module('app')
        .controller('ftpController',
            ['ftpService',
                "$scope",
                '$q',
                '$mdDialog',
                "$mdSidenav",
                '$mdToast',
                '$location',
                '$filter',
                '$timeout',
                '$mdMedia',
                ftpController]
        );
    function ftpController(ftpService,
                           $scope,
                           $q,
                           $mdDialog,
                           $mdSidenav,
                           $mdToast,
                           $location,
                           $filter,
                           $timeout,
                           $mdMedia) {
        $scope.selected = null;
        $scope.ftps = [];
        $scope.selectedIndex = 0;
        $scope.selectedToSearch = [];
        $scope.findDirs = true;
        $scope.findFiles = true;
        $scope.foundDirs = [];
        $scope.foundFiles = [];
        $scope.toolBarTitle = "";
        $scope.indexing = false;
        $scope._searching = false;
        //var charsToSub = {""}Ã©

        // Load initial data
        getAllFtp();

        //$scope.showSelected = function () {
        //    console.log($scope.selected)
        //    console.log($scope.ftps)
        //    console.log($scope.selectedToSearch)
        //};

        $scope.checkboxesChanged = function (searchText, findFilesChk, findDirsChk) {
            $scope.findFiles = findFilesChk;
            $scope.findDirs = findDirsChk;
            if (searchText.length > 2) {
                $scope.findMatches(searchText)
            }
        };

        var timerPromise;
        $scope.debouncedSubmit = function (searchText) {
            //$scope._searching = true;
            if (timerPromise) {
                $timeout.cancel(timerPromise);
                //$scope._searching = false;
            }
            timerPromise = $timeout(function () {
                if (searchText.length == 0) {
                    $scope._searching = false;
                    $scope.foundDirs = [];
                    $scope.foundFiles = [];
                }
                if (searchText.length > 2) {
                    $scope._searching = true;
                    setTimeout(function () {
                        $scope.findMatches(searchText)
                    }, 150);
                }
            }, 800);
        };

        $scope.findMatches = function (searchText) {
            $scope.foundDirs = [];
            $scope.foundFiles = [];
            $scope._searching = true;

            var executeSearching = function () {
                var deferred = $q.defer();
                var re = new RegExp(searchText, "i");
                $scope.selectedToSearch.forEach(function (ftp) {
                    ftp.scanned_dirs.forEach(function (scanned_dirs) {
                        if ($scope.findDirs) {
                            if (re.test(scanned_dirs.name) || re.test(slugify(scanned_dirs.name).replace(/-/g, ' '))) {
                                var resultToAdd = {
                                    'name': scanned_dirs.name,
                                    'url': util.format('ftp://%s/%s', ftp.host, scanned_dirs.url)
                                };
                                foundSet(resultToAdd, 'dir')
                            }
                        }
                        if ($scope.findFiles) {
                            scanned_dirs.files.forEach(function (file) {
                                if (re.test(file) || re.test(slugify(file).replace(/-/g, ' '))) {
                                    var resultToAdd = {
                                        'name': file,
                                        'url_folder': util.format('ftp://%s/%s', ftp.host, scanned_dirs.url),
                                        'url': util.format('ftp://%s/%s/%s', ftp.host, scanned_dirs.url, file)
                                    };
                                    foundSet(resultToAdd, 'file')
                                }
                            })
                        }
                    });

                });
                deferred.resolve(false);
                return deferred.promise;
            };

            executeSearching().then(function (bool) {
                $scope._searching = bool;
            });


        };

        function foundSet(resultToAdd, type) {
            //recibe un obj result y lo add a la lista result correspondiente, pero sin repetirlo
            var foundList = [];
            type == 'dir' ? foundList.concat($scope.foundDirs) : foundList.concat($scope.foundFiles);
            var idx = foundList.indexOfByProperty(resultToAdd, 'url');
            if (idx == -1) {
                type == 'dir' ? $scope.foundDirs.push(resultToAdd) : $scope.foundFiles.push(resultToAdd)
            }
        }

        $scope.openLeftMenu = function () {
            $mdSidenav('left').toggle();
        };

        $scope.selectFtp = function (ftp) {
            $scope.selected = ftp;
            $location.path('/ftp');
            $scope.toolBarTitle = ftp.server_name
        };

        $scope.deleteFtp = function ($event) {
            var confirm = $mdDialog.confirm()
                .title('Confirmar')
                .content('Seguro que desea eliminar este ftp?')
                .ok('Si')
                .cancel('No')
                .targetEvent($event);

            $mdDialog.show(confirm).then(function () {
                ftpService.destroy($scope.selected).then(function (msg) {
                    //remove from title bar en caso de q haya sido eliminido con su switch on.
                    var idx = $scope.selectedToSearch.indexOfByProperty($scope.selected, 'server_name');
                    if (idx > -1)$scope.selectedToSearch.splice(idx, 1);
                    $scope.goSearch();//luego de eliminar mostrar la pag search
                    getAllFtp();//recargar nuevamente los datos
                    $mdToast.show($mdToast.simple().textContent(msg));
                });
            }, function () {
                console.log('creo q esto es cuando damos nO')
            });
        };

        $scope.scanFtp = function () {
            $scope.indexing = true;
            $scope.mensaje = "";
            var errors = [];
            var scan_result = [];//return array of scanned_dir objects
            var dirs_to_scan = [];//gets all dirs to scan
            dirs_to_scan.push(self.selected.scan_dir);//start from first dir to scan
            var c = new Client();
            c.connect({
                host: self.selected.host,
                port: self.selected.port != '' ? self.selected.port : '', // defaults to 21
                user: self.selected.user != '' ? self.selected.user : '', // defaults to "anonymous"
                password: self.selected.pass != '' ? self.selected.pass : ''
            });
            c.on('ready', function () {
                function exploreFolder() {
                    if (dirs_to_scan.length == 0) {
                        fs.writeFile(__dirname + "/test.json", JSON.stringify(scan_result), function (err) {
                            $scope.indexing = false;
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("archivo guardado..");
                            }
                        });
                        c.end();
                        return
                    }
                    var current_url = dirs_to_scan.shift();//takes a new url for getting its dirs
                    console.log("+ " + current_url);
                    $scope.mensaje = "+ " + current_url;
                    /*
                     scanned_dir is an object that represents a dir.
                     ex:
                     url: path/to/this/folder
                     name: folder
                     files: [list, with, all, files, inside, of, folder]
                     */
                    var scanned_dir = {
                        url: current_url,
                        name: current_url.split('/').pop(),
                        files: []
                    };
                    c.list(current_url, function (err, list) {
                        if (err) {
                            console.log(err.message);
                            errors.push(err);
                        } else {
                            list.forEach(function (file) {
                                var new_url = current_url + "/" + file.name;
                                if (file.type == 'd') {
                                    dirs_to_scan.push(new_url);
                                } else {
                                    scanned_dir["files"].push(file.name);
                                    console.log("\t\t" + new_url);
                                    $scope.mensaje = "\t\t" + new_url
                                }
                            });
                            scan_result.push(scanned_dir)
                        }
                        exploreFolder()
                    });
                }

                exploreFolder()
            })
        };

        $scope.openFtpLink = function (ftpLink) {
            var escaped = escape(ftpLink.split('ftp://')[1]);
            var spawn = require('child_process').spawn;
            spawn('cmd.exe', ['/c', 'start', '', 'ftp://' + escaped]);
        };

        $scope.scanFtpWithPythonMethod = function ($event) {
            var notify = [
                "",
                "Se produjo un error durante el intento de conexión.",
                "No se pudo conectar al servidor, revise la conexión.",
                "Archivo de configuración no encontrado.",
                "Servidor indexado correctamente."
            ];
            $scope.indexing = true;
            var file = __dirname + "/ftpIndexService.exe";
            var args = [
                $scope.selected.server_name,
                $scope.selected.host,
                $scope.selected.user,
                $scope.selected.passw,
                $scope.selected.scan_dir
            ];
            var execFile = require('child_process').execFile;
            execFile(file, args, function (error, stdout) {
                if (error) console.log(error);
                $scope.indexing = false;

                console.log('stdout-->', stdout);
                if (stdout == 1 || stdout == 2 || stdout == 3) {
                    ShowDialog('Error', notify[parseInt(stdout)], $event);
                }
                if (stdout == 4) {//exito
                    ftpService.getAllFtp().then(function (json_data) {//dos funciones iguales, refactorizar
                        json_data.forEach(function (ftp) {
                            if (ftp.server_name == $scope.selected.server_name) {
                                $scope.selectFtp(ftp)
                            }
                        });
                    });
                    getAllFtp();//para recargar la informacion
                    $mdToast.show($mdToast.simple().textContent(notify[4]));
                }
                if (/No fueron encontrados:/.test(stdout)) {
                    ftpService.getAllFtp().then(function (json_data) {
                        json_data.forEach(function (ftp) {
                            if (ftp.server_name == $scope.selected.server_name) {
                                $scope.selectFtp(ftp, 0)
                            }
                        });
                    });
                    getAllFtp();
                    ShowDialog('Alerta', "Se indexó correctamente el ftp pero" + stdout, $event)
                }
            });
        };
        function ShowDialog(title, content, $event) {
            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title(title)
                    .content(content)
                    .ok('Ok')
                    .targetEvent($event)
            );
        }

        $scope.saveFtp = function () {
            ftpService.save($scope.selected).then(function (msg) {
                $mdToast.show(//todo pasar toast a una funcion
                    $mdToast.simple()
                        .textContent(msg)
                        .hideDelay(4000)
                        .position('top right')
                );
                $scope.toolBarTitle = $scope.selected.server_name;//al salvar el nuevo serv lo mostramos en pantalla y tb el titulo en la barra de titulo
            });
        };

        $scope.createFtp = function () {
            //para crear un nuevo serv primero creamos una estructura por defecto
            var new_server = {
                server_name: "",
                active: false,
                scan_dir: "",
                host: "",
                user: "",
                passw: "",
                update_at: $filter("date")(new Date()),
                count_dirs: 0,
                count_files: 0,
                scanned_dirs: []
            };
            $scope.selectFtp(new_server, 0);//y la elegimos como seleccionada (ftp actual seleccionad)
            $scope.ftps.push(new_server);//add a la lista de ftps
            $scope.toolBarTitle = 'Nuevo Ftp';
            $scope.openLeftMenu()
        };

        $scope.SwitchFtp = function (ftp, active) {
            //on/off los interruptores para activar en q ftp buscamos.
            var index = 0;
            if (active) {
                $scope.selectedToSearch.push(ftp);
                $location.path('/search');//si es on ir a la pag de busq
            } else {//si es off lo borramos del array
                var idx = $scope.selectedToSearch.indexOfByProperty(ftp, 'server_name');
                $scope.selectedToSearch.splice(idx, 1);
            }
            $scope.ftps.forEach(function (_ftp) {
                if (ftp == _ftp)//buscar donde fue el cambio para salvarlo
                    ftpService.save(_ftp);//todo como terminar forEach antes de tiempo
            });
            getToolbarTitle();//luego q se modifiq selectedToSearch actualizar barra de titulo
        };

        $scope.goSearch = function () {
            $location.path('/search');
            getToolbarTitle()
        };

        $scope.updateData = function () {
            getAllFtp()
        };

        function getAllFtp() {
            $scope.selectedToSearch = [];
            ftpService.getAllFtp().then(function (json_data) {
                if (json_data) {//por si no hay servidores (json_data es [])
                    $scope.ftps = [].concat(json_data);
                    //rellenar selectedToSearch
                    json_data.forEach(function (ftp) {
                        if (ftp.active) {
                            $scope.selectedToSearch.push(ftp);
                        }
                    });
                }
            });
            getToolbarTitle();
        }

        function getToolbarTitle() {
            var title = '';
            $scope.selectedToSearch.forEach(function (ftp) {
                title += ftp.server_name + ", "
            });
            $scope.toolBarTitle = title ? title.substr(0, title.length - 2) : 'Buscar en los servidores activos';
        }
    }
})();
