const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require ('mongoose');


mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true})

const ItemsSchema = {
    name : String
}

const Item = mongoose.model("Item", ItemsSchema);

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

    const item = new Item ({
        name : itemName
    });

    item.save();
    res.redirect('/'); 
});


app.post("/delete", function(req, res){
    //console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
            console.log("Successfully deleted item from DB!")
            res.redirect("/");
        } else {
            console.log(err);
        }
    });
});

app.get("/work", function(req, res){

    res.render("list", {listTitle: "Work List",newItems : works});
});

app.post("/work", function(req, res){
    let item = req.body.newItem;
    works.push(item);
    res.redirect("/work")
});

app.get("/place", function(req, res){
    res.render("list",{listTitle: "Place List",newItems : places})
});

app.post("/place", function(req, res){
    let item = req.body.newItem;
    places.push(item);
    res.redirect("/place");
});

app.get("/about", function(req, res){
    res.render("about");
});





app.listen(3000,()=>{
    console.log("listening on port 3000...")
});