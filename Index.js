/**
 * Created by Олег Шиловский on 20.11.2016.
 */

'use strict'

class warehouseItem {
    constructor(name,ID) {
        this.name = name;
        this.ID = ID;
    }
    show(){
        console.log(`Item ${this.name} level ${this.ID}`);
    }
}


class warehouse extends Array {

    constructor() {
        super();
    }

    add(name,ID){
        this.push(new warehouseItem(name,ID));
    }
//общее количество и список
    show(){
        for(let itm of this){
            itm.show();
            console.log("Item %s, ID %d",itm.name,itm.level);
        }
        console.log(`Total amount: ${this.length}`);

    }

    getItems(ID){

        return this.filter((x)=>{
            return x.ID==ID
        });


    }
    addItem(item){
        return this.push(item);
    }

    removeItem(ID,amount){
    let i=0;
    while ((i<amount)) {
        for (let pos in this) {
            if (this[pos].ID == ID) {
                    this.splice(pos, 1);
                    i++;
                    break;
                }

            }

        }



    }

    max(){
        return this.reduce((prev,curr)=>{
            return prev.ID>curr.ID ? prev : curr} )
    }


}


console.log('Клиенты и сервера используя модуль http');
const querystring = require('querystring');
const server = require('http');
var url = require('url');
const PORT = process.env.PORT || 3000;
var counter =0;

var WH = new warehouse();


server.createServer()
    .listen(PORT)
    .on('listening',()=>{
        console.log(`port is ${PORT}`);

    })
    .on('request',requestHandler);


function requestHandler(request,response) {

    var strres="no such method";

    var parts = url.parse(request.url, true);
    var query = parts.query;
    //checkParams(query);
    var method =  parts.pathname.replace('/','');
    console.log(method);

    switch (method){
        case 'create':
           if (checkParamsC(query)) {
               let ID = Math.floor(Math.random()*1000);
                for (let i=0;i<query.amount;i++){

                    let itm = new warehouseItem(query.name, ID);
                    WH.addItem(itm);
                }

                strres = JSON.stringify({ID:ID,name:query.name,amount:query.amount});
            }else{
               strres  = "Check your parameters. Must be like amount=129&name=Item name";

           }
            break;
        case 'read':

            var groupBy = function(xs, key) {
                return xs.reduce(function(rv, x) {
                    //(rv[x[key]] = rv[x[key]] || []).push(rv[x[key]].length+1);
                    let value = parseInt(rv[x[key]])||0;
                    rv[x[key]]=(value+1).toString();
                    return rv;
                }, {});
            };
            var items = groupBy(WH, 'ID');
            var total = [];
            Object.keys(items).forEach((itm)=>{
            total.push({ID:itm,name:WH.getItems(itm)[0].name,amount:items[itm]});
           });

            strres = JSON.stringify(total);
            break;
        case 'add':
            if (checkParamsB(query)) {
                var itms = WH.getItems(query.ID);
                if (itms.length>0){
                    for (let i=0;i<query.amount;i++){
                        let itm = new warehouseItem(itms[0].name,query.ID);
                        WH.addItem(itm);
                    }
                    strres = JSON.stringify({ID:query.ID,name:itms[0].name,amount:WH.getItems(query.ID).length});
                }else{
                    strres  ='no such ID in warehouse';
                }
                //todo Если ID нет


            }else{
                strres  = "Check your parameters. Must be like ID=129&amount=100";

            }
            break;
        case 'del':
            if (checkParamsB(query)) {
                var itms = WH.getItems(query.ID);
                if (itms.length>=query.amount){

                        WH.removeItem(query.ID,query.amount);
                    strres = JSON.stringify({ID:query.ID,name:itms[0].name,amount:WH.getItems(query.ID).length});
                }else
                {
                    strres = 'there is no this amount of items on warehouse';
                }



            }else{
                strres  = "Check your parameters. Must be like ID=129&amount=100";

            }
            break;
    }

    response.writeHead(200,'OK',{'Content-Type':'application/json'});
    response.write(strres);
    response.end();

}

function checkParamsB(query) {
    return (query.ID!==undefined)&&(query.amount!==undefined)
}

function checkParamsC(query) {
    return (query.amount!==undefined)&&(query.name!==undefined)
}

