var Client = require('ftp');
var selected = {
    scan_dir:"test",
    host:"localhost",
    user:"",
    pass:""
}
var scanFtp = function () {
    var errors = [];
    var scan_result = [];//return array of scanned_dir objects
    var dirs_to_scan = [];//gets all dirs to scan
    dirs_to_scan.push(escape(selected.scan_dir));//start from first dir to scan
    var c = new Client();
    c.connect({
        host: selected.host,
        port: selected.port != '' ? selected.port : '', // defaults to 21
        user: selected.user != '' ? selected.user : '', // defaults to "anonymous"
        password: selected.pass != '' ? selected.pass : ''
    });
    c.on('ready', function () {
        function exploreFolder() {
            if (dirs_to_scan.length == 0) {
                console.log('finish')
                c.end();
                return
            }
            var current_url = escape(dirs_to_scan.shift());//takes a new url for getting its dirs
            console.log("+ " + current_url);
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
                            scanned_dir["files"].push(file.name)
                            console.log("\t\t" + new_url)
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
scanFtp()