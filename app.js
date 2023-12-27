//jshint esversion:6
const  express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");
const app=express();
const PORT=process.env.PORT||3000;
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//connnectivity ti the database using monogdb
mongoose.connect("mongodb+srv://kam123:Bhagat123@cluster0.gbobrcl.mongodb.net/todolistDB");

// mongoose.connect("mongodb+srv://kam123:sBhagat123@cluster0.gbobrcl.mongodb.net/todolistDB");
const itemsSchema={
  name: String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to your Todolist!"
})
const item2=new Item({
  name:"Hit the + button to add a new item."
})
const item3=new Item({
  name:"<-- Hit this to delete an item."
});

const defautItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function (req, res) {
  Item.find({}).then((foundItems) => {
      if(foundItems.length===0){
        Item.insertMany(defautItems);
        res.redirect("/");
      }else{
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving items");
    });
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then((foundList)=>{
    if(!foundList){
      const list=new List({
        name:customListName,
        items: defautItems
      });
      list.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });

    }
  })


});

app.post("/",function(req,res){
  let itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();

    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


  // if(req.body.list==="Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }
  // else{
  //   items.push(item);
  //   res.redirect("/");
  // }

});
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId)
      .then((result) => {
        if (result) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        } else {
          console.log("Item not found.");
          res.status(404).send("Item not found");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error deleting item");
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then((foundList) => {
        if (foundList) {
          res.redirect("/" + listName);
        } else {
          console.log("List not found.");
          res.status(404).send("List not found");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error updating list");
      });
  }
});




app.get("/<%=",function(req,res){
  res.render("list",{listTitle: "Work List", newListItems: workItems})
});

app.get("/about",function(req,res){
  res.render("about");
});

app.listen(PORT,function(){
  console.log("Server started on port 3000");
});
