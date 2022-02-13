const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");
const { resolve } = require('path');

const username = process.argv[2];
const count = process.argv[3];
const domain = 'http://wegottaeat.com';
const url = domain + '/' + username + '/recipes?pagesize=' + count;

async function main() {
  if (!(typeof username !== undefined && username) || !(typeof count !== undefined && count)) {
    console.log("Both the username and recipe count need to be supplied. Username is the first argument and recipe count is the second.");
    console.log("Example: `node index.js julia.child 123`.");
    return;
  }

  console.log('Looking for ' + count + ' recipes for user `' + username + '` at ' + url + '.');

  // Collect the URLs to all of the individual recipe pages.
  let html = await axios.get(url)
    .then(response => {
      return response.data;
    })
    .catch(function(error) {
      console.error(error);
    });

  $ = cheerio.load(html);

  recipe_count = $('a.taggedlink').length;
  console.log(`Found ${recipe_count} recipes.`);

  recipe_urls = [];

  $('a.taggedlink').each(function(idx, el) {
      recipe_urls.push(
          domain + $(el).attr('href')
      );
  });
    
  fs.writeFile("recipe_urls.json", JSON.stringify(recipe_urls, null, 2), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Successfully wrote recipe URLs to file.");
    console.log(recipe_urls);
  });
  
  // Get each recipe.
  recipes = [];
  recipes_promises = []

  recipe_urls.forEach(function(recipe_url) {
    recipes_promises.push( read_recipe(recipe_url) );
  });

  Promise.all(recipes_promises)
  .then( recipes => {
    fs.writeFile("recipes.json", JSON.stringify(recipes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully wrote recipes to file recipes.json.");
    });  
  })
  .catch( error => {
    console.log("All promises error: " + error);
  });
}

async function read_recipe(recipe_url) {
  let html = await axios.get(recipe_url)
    .then(response => {
      return response.data;
    })
    .catch(function(error) {
      console.error(error);
    });

  const $ = cheerio.load(html);

  var recipe = {};
  recipe.title = $('h1').text().trim();
  recipe.ingredients = $('div#ingredients').html().trim();
  recipe.directions = $('div#directions').html().trim();

  recipe_meta = [];
  $('div#categoriesSection table td').each(function(idx,el){
    value = $(el).contents().filter(function(){ 
      return this.nodeType == 3; 
    });
    value = value.length ? value[0].nodeValue.trim() : "";
    meta = {
      'key': $(el).find('span i').text().trim(),
      'value': value
    }
    recipe_meta.push(meta);
  });

  recipe_tags = [];
  $('div#tagsSection div.tags span.item').each(function(idx,el){
    recipe_tags.push($(el).text().trim());
  })
  recipe_meta.push({
    'key': "Tags",
    'value': recipe_tags
  })

  recipe.meta = recipe_meta;

  console.log("* " + recipe.title);
  return recipe;
}

main();
