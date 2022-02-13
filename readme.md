# WeGottaEat.com scraper

My wife has used WeGottaEat to store her recipes for more than a decade. Especially in recent years, the site has proven unreliable and regularly goes down for days. So, she needs a different solution to store and find the nearly-400 recipes she has on there. WeGottaEat doesn't appear to offer a way to get recipes out, so I put together this scraper.

This is a node script, so you'll need node installed. Two arguments are required: a username and recipe count. Example use:

```
node index.js julia.child 123
```

The result will be a `recipes.json` file that contains all of the recipes stored as an array of objects. The object includes the recipe title, ingredients, directions, categories, and tags metadata. The date the recipe was created isn't surfaced on the recipe page and my wife doesn't use the stars, points, comments, or booksmarks features, so this script doesn't capture those.

What do we do with the data now that we've got it out of WeGottaEat? Well, that's another project. But when WeGottaEat goes down again we'll at least have access to the recipes!
