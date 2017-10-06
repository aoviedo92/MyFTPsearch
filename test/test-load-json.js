var fs = require('fs');
fs.readFile('../app/json_data.json','utf-8', function (err, data) {
    if (err) throw err;
    //console.log(data)
    var json_data = JSON.parse(data)
    console.log(json_data)

});
