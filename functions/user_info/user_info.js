const rp = require('request-promise');
fetchTravelRequestsFromXoriant = function() {
   

    var form = { "emailid" : "Piyush.Ranjan@Xoriant.com" } 

    var formData = JSON.stringify(form);
    var options = {
        headers: {
        'Content-Type': 'application/json',
        'Host': 'e-travel.xoriant.com'
        },
        uri: 'https://e-travel.xoriant.com/external/userinfo',
        body: formData,
        method: 'POST'
    }

    return rp(options).then(data => data);

}
