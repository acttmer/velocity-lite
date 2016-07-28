var temp = {
    isTrue: true,
    p1: "111",
    p2: "222",
    p3: "333",
    p4: "444",
    p5: "555",
    obj: [{
        success: true,
        info: "ok~~~~~~~~~~~~~~~~~~~~",
        error: "no~~~~~~~~~~~~~~~~~~~"
    }, {
        success: true,
        info: "ok~~~~~~~~~~~~~~~~~~~~",
        error: "no~~~~~~~~~~~~~~~~~~~"
    }, {
        success: true,
        info: "ok~~~~~~~~~~~~~~~~~~~~",
        error: "no~~~~~~~~~~~~~~~~~~~"
    }, {
        success: true,
        info: "ok~~~~~~~~~~~~~~~~~~~~",
        error: "no~~~~~~~~~~~~~~~~~~~"
    }, {
        success: true,
        info: "ok~~~~~~~~~~~~~~~~~~~~",
        error: "no~~~~~~~~~~~~~~~~~~~"
    }, {
        success: true,
        info: "ok~~~~~~~~~~~~~~~~~~~~",
        error: "no~~~~~~~~~~~~~~~~~~~"
    }]
}

var r = [];
for(let i = 0 ;i<200;i++){
    r.push(temp);
}
var data = {
    result : r
}
function getDateByNum(num){
    var r = [];
    for(let i = 0 ;i<num;i++){
        r.push(temp);
    }
    var data = {
        result : r
    }
    return data;        
}


