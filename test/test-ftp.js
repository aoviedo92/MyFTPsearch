var paso = 300;
var Client = require('ftp');
var path = require('path')
var scannerFTPoneThread = function(result) {
    var folders = new Array();
    // adicionar ruta raiz
    folders.push(result.dirscan);
    var c = new Client();
    c.connect({
        host: result.uri,
        port: result.port != '' ? result.port : '', // defaults to 21
        user: result.user != '' ? result.user : '', // defaults to "anonymous"
        password: result.pass != '' ? result.pass : '',
    });
    var files_scanner = new Array();
    c.on('ready', function() {
        var exploreFolder = function() {
            if (folders.length !== 0) {
                var url = folders[0];
                c.list(url, function(err, list) {
                    if (err) {
                        console.log(err);
                    } else {
                        list.forEach(function(file) {
                            var name = "";
                            try {
                                // If the string is UTF-8, this will work and not throw an error.
                                name = decodeURIComponent(escape(file.name));
                            } catch (e) {
                                // If it isn't, an error will be thrown, and we can asume that we have an ISO string.
                                name = file.name;
                            }
                            if (file.type !== 'd') {
                                var newFile = {
                                    name: name,
                                    extname: path.extname(name),
                                    directory: url,
                                    ftp: result._id,
                                    size: file.size,
                                    time: file.date
                                }
                                files_scanner.push(newFile);
                            } else {
                                var join = "/";
                                if (url === '/') {
                                    join = '';
                                }
                                var newPaht = url + join + name;
                                var carpeta = {
                                    directory: url,
                                    name: name,
                                    ftp: result._id,
                                }
                                files_scanner.push(carpeta);
                                folders.push(newPaht);
                            }
                        });
                    }
                    // eliminar directorio de arreglo
                    folders.splice(0, 1);
                    // busca en la proxima carpeta
                    console.log(result.uri + url + " escaneado");
                    console.log("restan " + folders.length);
                    if (files_scanner.length > paso) {
                        FtpFiles.collection.insert(files_scanner, function(callback) {
                            files_scanner = new Array();
                            exploreFolder();
                        });
                    } else {
                        exploreFolder();
                    }
                });

            } else {
                if (files_scanner.length > 0) {
                    console.log("Quedaron archivos");
                    // quedaron archivos por insertar
//                    FtpFiles.collection.insert(files_scanner, function(callback) {
                        files_scanner = new Array();
                    //});
                }
                c.end();
                // desbloquear servidor para que pueda ser escaneado
//                freeServer(result._id);
                console.log('termine');
            }
        }
        exploreFolder();
    });
}
var scan = scannerFTPoneThread({
    dirscan: "documentacion/Fisio Terapia",
    uri: "ucistore.uci.cu",
    user: "",
    pass: ""
});