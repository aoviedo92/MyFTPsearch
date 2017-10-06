var Client = require('ftp');
var fs = require('fs');
//var json_data = require('./test-json-data');

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
        function exploreFolder() {
            if (dirs_to_scan.length == 0){
                //console.log(1111111111)
                //console.log('sc',scan_result)
                see(scan_result)
                return scan_result;
            }
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
                        var name = "";
                        try {
                            // If the string is UTF-8, this will work and not throw an error.
                            name = decodeURIComponent(escape(new_url));
                        } catch (e) {
                            // If it isn't, an error will be thrown, and we can asume that we have an ISO string.
                            name = new_url;
                        }
                        if (file.type == 'd') {
                            dirs_to_scan.push(new_url);
                        } else {
                            scanned_dir["files"].push(new_url)
                            //console.log("\t"+new_url)
                        }
                    });
                    scan_result.push(scanned_dir)
                }
                exploreFolder()
            });
        }
        exploreFolder()
    });
    //console.log('sc',scan_result)
    // return $.Deferred().resolve();
    //c.end();
};
scannerFTPoneThread({
    dirscan: "documentacion/Fisio Terapia",
    uri: "ucistore.uci.cu",
    user: "",
    pass: ""
});
function see(dir){
    //console.log(dir)
    //console.log(__dirname)
    //console.log(typeof dir)
    fs.writeFile(__dirname+"/test.json", JSON.stringify(dir), function(err){
        if(err){console.log(err);} else {console.log("archivo guardado..");}
    });
}
