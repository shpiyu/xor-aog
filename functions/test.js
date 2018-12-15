
  const {
    fetchTravelRequestsFromXoriant,
    getTravelDetail
  } = require("./etravel/etravelCoontroller");

  

let test = function(conv) {
    return new Promise((res, rej) => {
      fetchTravelRequestsFromXoriant().then( data => JSON.parse(data).data ).then(requests => {
          
          return getTravelDetail(requests[0].request.id)
        }).then (data => {
            let firstCab = {};
            firstCab.date = data.cabPickupDateTime;
            firstCab.from = data.pickupFromCity;
            firstCab.to = data.goingToCity;
  
            let response = `Your upcoming cab request is on ${firstCab.date} 
            from ${firstCab.from} to ${firstCab.to}`;
  
            console.log(response);
            res();
        }) 
        .catch(err => {
          console.log("hooo ", err);
        });
    });
  }
  
  test().then(res => console.log(res));