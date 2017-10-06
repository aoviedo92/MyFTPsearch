var Client = require('ftp');
var urlencode = require('urlencode');

var scannerFTPoneThread = function (ftpServer) {
    var errors = [];
    var scan_result = [];
    var dirs_to_scan = [];
    dirs_to_scan.push(ftpServer.dirscan);
    var c = new Client();
    c.connect({
        host: ftpServer.uri,
        port: ftpServer.port != '' ? ftpServer.port : '', // defaults to 21
        user: ftpServer.user != '' ? ftpServer.user : '', // defaults to "anonymous"
        password: ftpServer.pass != '' ? ftpServer.pass : ''
    });
    c.on('ready', function () {
        var exploreFolder = function () {
            var resolver = new Promise(function (resolve, reject) {
                if (dirs_to_scan.length > 0) {
                    //console.log('1', dirs_to_scan)
                    var current_url = dirs_to_scan.shift();
                    console.log("+ " + current_url);
                    var scanned_dir = {url: current_url, name: "", files: []}
                    c.list(current_url, function (err, list) {
                        if (err) {
                            console.log(err);
                            errors.push(err);
                            exploreFolder()
                        } else {
                            scanned_dir.name = current_url.split('/').pop();
                            list.forEach(function (file) {
                                var new_url = current_url + "/" + file.name;
                                if (file.type == 'd') {
                                    dirs_to_scan.push(new_url);
                                }else{
                                    scanned_dir["files"].push(file.name)
                                    console.log("\t"+new_url)
                                }
                            });
                            scan_result.push(scanned_dir)
                        }
                        resolve(scan_result)
                        exploreFolder()
                    });
                }
            });
            resolver.then(function (resolv) {
                console.log(3,errors)
                console.log(4, resolv)
            });
        };
        exploreFolder()
    });
    //console.log('sc',scan_result)
    // return $.Deferred().resolve();
};
var scan = scannerFTPoneThread({
    dirscan: "",
    uri: "192.168.137.1",
    user: "anonymous",
    pass: ""
});
//console.log('scan',scan)
//var result = [];
//var resolver = new Promise(function (s, f) {
//    while (…
//    )
//    {
//    … adiciono
//        elementos
//        a
//        result
//        console.log(1, result) —- > muestra
//        los
//        elementos
//        que
//        hay
//        en
//        result
//    }
//});
//resolver.then(function (s, f) {
//    console.log(2, result)
//});