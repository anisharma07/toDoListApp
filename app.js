//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const PORT = process.env.PORT || 3030;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://anis42390:DXgVnsXzIq11QyJb@cluster0.9lgdys4.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  name: "HII! This is a toDoList app!"
});

const Item2 = new Item({
  name: "Hit the + to add a new item"
});

const Item3 = new Item({
  name: "<--Hit this to delete an item"
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};


const List = mongoose.model("List", listSchema);


/**
 * 
 * 
 * render the main list
 * 
 * 
 */

app.get("/", async function (req, res) {


  const itemes = await Item.find({});

  if (itemes.length === 0) {
    await Item.insertMany(defaultItems);

    res.redirect("/");
  }

  else {
    res.render("list", { listTitle: "Today", newListItems: itemes });
  }
});



/**
 * 
 * 
 * Adds Item
 * 
 * 
 */

app.post("/", async function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }

  else {
    const foundList = await List.findOne({ name: listName });
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }
});
/**
 * 
 * 
 * making lIsts
 * 
 * 
 */



app.get("/:customListName", async function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  const listies = await List.findOne({ name: customListName });

  if (!listies) {
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
    res.redirect("/" + customListName);
  }

  else {
    res.render("list", { listTitle: listies.name, newListItems: listies.items });
  }

});


/**
 * 
 * 
 * Delete Items
 * 
 * 
 */

app.post("/delete", async function (req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;



  if (listName === "Today") {
    await Item.findOneAndDelete({ _id: itemId });
    res.redirect("/");
  }
  else {
    await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: itemId } } });
    res.redirect("/" + listName);
  }

});




app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
