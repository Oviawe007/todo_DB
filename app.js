const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require ('mongoose');
const _ = require('lodash');

mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true});

const ItemsSchema = {
    name : String
}

const Item = mongoose.model("Item", ItemsSchema);

//default items creation.
//
const item1 = new Item ({
    name : "Welcome to your Todo App"
});

const item2 = new Item ({
    name : "Press the + button to add new item"
});

const item3 = new Item ({
    name : "<--- check the box to delete item"
});

const defaultItems = [item1,item2,item3];

//creating a custom route
const listSchema = {
    name : String,
    items : [ItemsSchema]
}

const List = mongoose.model("List", listSchema);



const app = express();

app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))


//

app.get('/', (req, res) => {

    Item.find({}, function(err, foundItems){
        
        if (foundItems.length === 0){

            Item.insertMany(defaultItems , function(err){
                if (err){
                    console.log(err)
                } else {
                    console.log("Successfully added items to dataBase");  
                    res.redirect('/');
                }
            });

        } else {
            res.render("list",{listTitle : "Today", newItems : foundItems});
           
        }

    }); 

});

app.post("/", (req, res) => {
   // console.log(req.body)
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name : itemName
    });
    //console.log(listName);
    
    if (listName === "Today"){
        item.save();
        res.redirect('/'); 
    } else {
        List.findOne({name : listName}, function(err, foundList){
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
                //console.log(foundList)
            }
            
        });

    }

    
});


app.post("/delete", function(req, res){
    //console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    const listTitle = req.body.listTitle;
    
    if (listTitle === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successfully deleted item from DB!")
                res.redirect("/");
            } else {
                console.log(err);
            }
        });
    } else {
        //deleting from a custom route
        List.findOneAndUpdate(
            {name : listTitle}, 
            {$pull : {items : {_id : checkedItemId}}}, 
            function(err , foundList){
                if(!err){
                    res.redirect("/" + listTitle)
                }
            });
    }



    
});

//Enabling custom route
//
app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    //console.log(customListName)

    List.findOne({name : customListName}, function(err, foundItem){
        if (!err){
            if (!foundItem){
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list.save();
                res.redirect("/" + customListName);

            } else {
                res.render("list",{listTitle : foundItem.name , newItems : foundItem.items});
            }
        }
    });
    
});





app.get("/about", function(req, res){
    res.render("about");
});





app.listen(3000,()=>{
    console.log("listening on port 3000...")
});